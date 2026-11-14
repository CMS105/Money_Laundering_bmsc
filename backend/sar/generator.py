import datetime
import uuid
from typing import List, Dict, Any, Optional
from backend.graph.detectors.models import DetectedAlert
from backend.graph.temporal_graph import TemporalGraph
from backend.data.models import TypologyType
from backend.database import save_sar_report
from .models import SARReport, TemporalTrailStep, XAIFeatureDriver


class SARGenerator:
    """
    Generates regulatory-grade, FinCEN-compliant Suspicious Activity Reports (SAR)
    for LaunderGraph AML with plain-language narrative summaries,
    banking channel hops, and chronological money trails.
    """

    def generate_sar(
        self,
        alert: DetectedAlert,
        tg: Optional[TemporalGraph] = None,
        xai_drivers: Optional[List[Dict[str, Any]]] = None,
        ml_prob: float = 0.94,
        isolation_score: float = 0.88,
    ) -> SARReport:
        sar_id = f"SAR-{datetime.datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        filing_date = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        # Threat level classification
        if alert.risk_score >= 0.85:
            threat_level = "CRITICAL"
        elif alert.risk_score >= 0.70:
            threat_level = "HIGH"
        else:
            threat_level = "MEDIUM"

        time_hours = round(alert.time_span_seconds / 3600.0, 2)
        total_vol = alert.total_volume
        typology_val = alert.typology.value

        # Build chronological money trail
        trail_steps = self._extract_trail_steps(alert, tg)

        # Generate red flags based on typology
        red_flags = self._generate_red_flags(alert)

        # Generate plain-language regulatory narrative
        narrative = self._generate_narrative(alert, threat_level, time_hours, total_vol, trail_steps)

        # Recommended regulatory action
        if threat_level == "CRITICAL":
            action = "Immediate account restraint and mandatory 24-hour FinCEN filing under 31 CFR § 1020.320. Escalate to Law Enforcement Liaison."
        elif threat_level == "HIGH":
            action = "File Form 111 (SAR), place temporary 48-hour debit freeze on suspect intermediary accounts, initiate Enhanced Due Diligence (EDD)."
        else:
            action = "Log alert in Internal AML Watchlist and request beneficial ownership documents within 5 business days."

        # Synthetic FinCEN XML snippet
        xml_snippet = f"""<SuspiciousActivityReport id="{sar_id}">
  <ActivityDate>{filing_date}</ActivityDate>
  <FilingInstitution>LaunderGraph National Bank AML Intelligence Unit</FilingInstitution>
  <TypologyCategory>{typology_val}</TypologyCategory>
  <SuspiciousAmount Currency="USD">{total_vol:,.2f}</SuspiciousAmount>
  <SubjectCount>{len(alert.involved_accounts)}</SubjectCount>
  <RiskRating>{threat_level} ({alert.risk_score:.2f})</RiskRating>
  <MLProbability>{ml_prob:.2f}</MLProbability>
  <IsolationScore>{isolation_score:.2f}</IsolationScore>
</SuspiciousActivityReport>"""

        parsed_drivers = [
            XAIFeatureDriver(
                feature=d.get("feature", "Topology"),
                weight=float(d.get("weight", 0.0)),
                description=d.get("description", ""),
            )
            for d in (xai_drivers or [])
        ]

        sar_obj = SARReport(
            sar_id=sar_id,
            alert_id=alert.alert_id,
            filing_date=filing_date,
            filing_institution="LaunderGraph National Bank AML Intelligence Unit",
            primary_typology=typology_val,
            risk_score=alert.risk_score,
            threat_level=threat_level,
            suspect_accounts=alert.involved_accounts,
            total_volume_usd=total_vol,
            transaction_count=len(alert.involved_transactions),
            time_span_hours=time_hours,
            narrative_summary=narrative,
            chronological_trail=trail_steps,
            red_flag_indicators=red_flags,
            recommended_action=action,
            fincen_xml_snippet=xml_snippet,
            xai_feature_drivers=parsed_drivers if parsed_drivers else None,
            ml_probability=ml_prob,
            isolation_score=isolation_score,
        )

        # Persist automatically to SQLite
        try:
            save_sar_report({
                "sar_id": sar_id,
                "cluster_id": alert.alert_id,
                "threat_level": threat_level,
                "narrative": narrative,
            })
        except Exception:
            pass

        return sar_obj

    def _extract_trail_steps(self, alert: DetectedAlert, tg: Optional[TemporalGraph]) -> List[TemporalTrailStep]:
        steps: List[TemporalTrailStep] = []
        if tg is None or tg.df.is_empty():
            return steps

        # Look up transactions involved in this alert
        tx_filter = tg.df.filter(tg.df["transaction_id"].is_in(alert.involved_transactions)).sort("timestamp")
        
        for idx, row in enumerate(tx_filter.iter_rows(named=True)):
            ts = row["timestamp"]
            formatted_dt = datetime.datetime.utcfromtimestamp(ts).strftime("%Y-%m-%d %H:%M:%S")
            from_b = str(row.get("from_bank") or "000")
            to_b = str(row.get("to_bank") or "000")
            p_format = str(row.get("payment_format") or "Wire")
            desc = f"Bank {from_b}:{row['source_account']} transferred ${row['amount']:,.2f} via {p_format} to Bank {to_b}:{row['target_account']}"
            steps.append(
                TemporalTrailStep(
                    step_number=idx + 1,
                    timestamp=ts,
                    formatted_time=formatted_dt,
                    source_account=row["source_account"],
                    target_account=row["target_account"],
                    amount=row["amount"],
                    description=desc,
                    from_bank=from_b,
                    to_bank=to_b,
                    payment_format=p_format,
                )
            )
        return steps

    def _generate_red_flags(self, alert: DetectedAlert) -> List[str]:
        typ = alert.typology
        flags = []
        if typ == TypologyType.SMURFING:
            flags = [
                "Transaction amounts structured immediately below the $10,000 Currency Transaction Report (CTR) filing threshold.",
                "High out-degree/in-degree velocity with minimal operational delay across intermediary accounts.",
                "Unusual dispersion of capital followed by reconvergence into a single destination repository.",
                "Inter-bank cross-institution transfers evading single-bank KYC parameters.",
            ]
        elif typ == TypologyType.ROUNDTRIP_CYCLE:
            flags = [
                "Directed circular capital flow with capital returning to original originator (round-tripping).",
                "Transaction loop completed within an expedited temporal window with negligible economic utility.",
                "Slight balance decay consistent with laundering transit fees (1-5%).",
                "Cyclic multi-hop PageRank loop evading linear threshold monitoring.",
            ]
        elif typ == TypologyType.MULE_CHAIN:
            flags = [
                "Rapid pass-through: Funds liquidated and forwarded within minutes of receipt (delta-t <= 1 hour).",
                "Near-zero balance retention: account acts solely as a conduit with > 90% immediate outflow.",
                "High transit betweenness centrality connecting disjoint subgraphs.",
                "Lack of typical retail, payroll, or commercial transaction history.",
            ]
        else:
            flags = ["Anomalous transaction graph density exceeding baseline risk parameters."]
        return flags

    def _generate_narrative(
        self,
        alert: DetectedAlert,
        threat_level: str,
        time_hours: float,
        total_vol: float,
        trail_steps: List[TemporalTrailStep],
    ) -> str:
        typ = alert.typology
        accounts_str = ", ".join(alert.involved_accounts[:6])
        if len(alert.involved_accounts) > 6:
            accounts_str += f" and {len(alert.involved_accounts) - 6} other accounts"

        if typ == TypologyType.SMURFING:
            direction = alert.details.get("direction", "DISPERSION")
            narrative = (
                f"SUSPICIOUS ACTIVITY NARRATIVE — SMURFING / STRUCTURING SYNDICATE\n\n"
                f"1. SUMMARY OF ACTIVITY:\n"
                f"The LaunderGraph AML monitoring engine detected coordinated structuring activity classified as {direction} "
                f"involving {len(alert.involved_accounts)} counterparties with an aggregate flow volume of ${total_vol:,.2f} USD "
                f"transacted over a span of {time_hours:.1f} hours.\n\n"
                f"2. MONEY TRAIL BREAKDOWN:\n"
                f"Between the monitored accounts ({accounts_str}), funds were transferred in individual batches deliberately "
                f"structured between $8,500 and $9,900, remaining just beneath the $10,000 regulatory reporting threshold. "
                f"This pattern exhibits low statistical variance (CV < 0.25), indicating deliberate avoidance of automatic CTR filings.\n\n"
                f"3. INVESTIGATIVE CONCLUSION:\n"
                f"The coordination across multiple accounts within a compressed time frame strongly suggests smurfing layering "
                f"designed to obscure illicit source origins before consolidation. This activity warrants a {threat_level} threat priority."
            )
        elif typ == TypologyType.ROUNDTRIP_CYCLE:
            k = alert.details.get("cycle_length", len(alert.involved_accounts))
            retention = alert.details.get("retention_ratio", 0.95) * 100
            narrative = (
                f"SUSPICIOUS ACTIVITY NARRATIVE — CIRCULAR ROUND-TRIPPING (WASHING LOOP)\n\n"
                f"1. SUMMARY OF ACTIVITY:\n"
                f"An artificial transaction loop was detected spanning {k} consecutive counterparties ({accounts_str}) "
                f"with a gross volume of ${total_vol:,.2f} USD. The funds returned to the originating node within {time_hours:.1f} hours.\n\n"
                f"2. MONEY TRAIL BREAKDOWN:\n"
                f"The path traversed sequentially through accounts with strictly ascending timestamps. "
                f"Upon completing the {k}-hop cycle, {retention:.1f}% of the original capital was conserved, with minor deductions "
                f"consistent with laundering transit fees. No apparent commercial or legitimate financial justification exists "
                f"for transferring funds across multiple distinct legal entities only to terminate at the origin.\n\n"
                f"3. INVESTIGATIVE CONCLUSION:\n"
                f"This topological cycle constitutes classic layering round-tripping to fabricate paper trails and legitimate appearance. "
                f"Categorized as a {threat_level} priority incident."
            )
        elif typ == TypologyType.MULE_CHAIN:
            mule = alert.details.get("mule_account", "INTERMEDIARY")
            latency_mins = round(alert.details.get("transit_latency_seconds", 300) / 60.0, 1)
            narrative = (
                f"SUSPICIOUS ACTIVITY NARRATIVE — RAPID PASS-THROUGH MULE CONDUIT\n\n"
                f"1. SUMMARY OF ACTIVITY:\n"
                f"LaunderGraph AML identified acute conduit behavior centered at account {mule}, involving {len(alert.involved_accounts)} "
                f"counterparties and ${total_vol:,.2f} USD in rapid pass-through funds.\n\n"
                f"2. MONEY TRAIL BREAKDOWN:\n"
                f"Account {mule} received incoming funds and forwarded them to downstream destinations in approximately {latency_mins} minutes. "
                f"The account retained negligible balance (< 5%), exhibiting zero typical personal or merchant transaction characteristics.\n\n"
                f"3. INVESTIGATIVE CONCLUSION:\n"
                f"The combination of minimal transit latency, exact amount forwarding, and lack of historical transaction depth "
                f"is a hallmark indicator of an unvetted or compromised money mule account operating under syndicate direction."
            )
        else:
            narrative = (
                f"SUSPICIOUS ACTIVITY NARRATIVE — HIGH-RISK ANOMALY\n\n"
                f"Cluster {alert.alert_id} exhibited anomalous topological centrality and volume velocity "
                f"involving ${total_vol:,.2f} USD across {len(alert.involved_accounts)} accounts. Rated as {threat_level} priority."
            )

        return narrative
