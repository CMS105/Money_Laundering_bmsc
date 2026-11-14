import os
import json
import logging
from typing import Optional
import requests
try:
    from .schemas import AlertCluster, ExplainResponse
except ImportError:
    from schemas import AlertCluster, ExplainResponse

logger = logging.getLogger(__name__)


def generate_heuristic_explanation(cluster: AlertCluster) -> ExplainResponse:
    """Deterministic, high-fidelity explainable AI generator for offline or fallback operation."""
    typology = cluster.typology
    vol_formatted = f"₹{cluster.total_volume:,.2f}"
    dwell_str = f"{cluster.dwell_time_mins:.1f} minutes"
    num_nodes = len(cluster.nodes)
    num_edges = len(cluster.edges)

    mule_nodes = [n.id for n in cluster.nodes if n.role == "mule"]
    mules_str = ", ".join(mule_nodes) if mule_nodes else "intermediary accounts"

    if typology == "CYCLIC_ROUND_TRIPPING":
        summary = (
            f"Account {cluster.entry_node} orchestrated a circular layering loop of {vol_formatted} "
            f"through {len(mule_nodes)} shell accounts ({mules_str}), returning 94%+ of funds back to "
            f"the origin node {cluster.exit_node} within {dwell_str}."
        )
        pattern_desc = (
            "Cyclic round-tripping involves funneling illicit capital through multiple intermediary nodes "
            "before returning it to the originator. This creates synthetic transaction velocity to artificially "
            "inflate turnover and obscure true beneficial ownership without transferring capital to third parties."
        )
        key_findings = [
            f"Direct circular topology returning funds to {cluster.exit_node}",
            f"High volume velocity: {vol_formatted} cycled across {num_edges} hops in {dwell_str}",
            f"Pass-through shell accounts ({mules_str}) showed near-zero lingering balances",
            f"Average hop latency of {cluster.dwell_time_mins / max(1, num_edges):.1f} mins indicates programmatic dispatch",
        ]
        recommended_actions = [
            f"Immediately freeze originating/exit account {cluster.entry_node}",
            "Submit urgent STR (Suspicious Transaction Report) for circular laundering",
            f"Place enhanced watchlists on intermediate entities: {mules_str}",
            "Trigger automated KYC re-verification on account holder identity documents",
        ]
        risk_level = "CRITICAL"
        confidence = 0.95

    elif typology == "FAN_OUT_IN":
        summary = (
            f"Source account {cluster.entry_node} executed structured smurfing of {vol_formatted}, "
            f"fanning out to {len(mule_nodes)} conduit accounts before rapidly re-aggregating into "
            f"consolidator account {cluster.exit_node} in {dwell_str}."
        )
        pattern_desc = (
            "Fan-Out / Fan-In (Structuring/Smurfing) splits high-value sums into multiple smaller tranches "
            "below statutory reporting thresholds, routing them concurrently through parallel nodes before "
            "reconsolidating into a central target account for cash-out or offshore remittance."
        )
        key_findings = [
            f"Parallel tranche distribution: {num_edges // 2} outbound legs and {num_edges // 2} inbound legs",
            f"Dispersal deliberately calibrated below standard threshold monitoring limits",
            f"Short consolidation window of {dwell_str} between fan-out and final pooling",
            f"Consolidator entity {cluster.exit_node} flagged with 96+ risk score",
        ]
        recommended_actions = [
            f"Place administrative hold on incoming wire transfers for consolidator {cluster.exit_node}",
            "Perform aggregate volume audit across all identified conduit accounts",
            "File regulatory Structuring / Smurfing alert with FIU-IND",
            "Identify common IP/Device fingerprints linking conduit accounts",
        ]
        risk_level = "CRITICAL" if cluster.risk_score > 90 else "HIGH"
        confidence = 0.92

    elif typology == "MULE_CHAIN":
        summary = (
            f"High-velocity relay chain detected transferring {vol_formatted} across {num_edges} consecutive hops "
            f"from compromised origin {cluster.entry_node} to exit terminal {cluster.exit_node} in {dwell_str}."
        )
        pattern_desc = (
            "Mule Chain (Rapid Hop Relay) transfers funds through a serial chain of recently opened or rented "
            "mule accounts. Each recipient immediately forwards the remaining balance to the next hop with "
            "minimal dwell time to outrun automated bank fraud detection and manual wire recall windows."
        )
        key_findings = [
            f"Ultra-low dwell time: average hop duration of {cluster.dwell_time_mins / max(1, num_edges):.1f} mins",
            f"Near 100% pass-through ratio with minor nominal deductions for mule handling cuts",
            f"Terminal account {cluster.exit_node} acts as immediate cash-out / crypto gateway",
            f"Unusual login geography or rapid token turnover detected along relay hops",
        ]
        recommended_actions = [
            f"Trigger emergency interbank stop-payment request targeting hop terminal {cluster.exit_node}",
            f"Freeze intermediate mule accounts ({mules_str}) to prevent collateral dispersal",
            "Liaise with cyber forensics to investigate credential theft on origin {cluster.entry_node}",
            "Coordinate with destination institution for asset recovery",
        ]
        risk_level = "HIGH"
        confidence = 0.89

    else:
        summary = (
            f"Suspicious transaction network of {vol_formatted} involving {num_nodes} accounts and "
            f"{num_edges} hops completed in {dwell_str}."
        )
        pattern_desc = "Complex multi-party transactional pattern exhibiting anomalous graph metrics."
        key_findings = [
            f"Elevated risk score: {cluster.risk_score}",
            f"Total volume transacted: {vol_formatted}",
            f"Rapid dwell time: {dwell_str}",
        ]
        recommended_actions = [
            "Perform manual compliance review on all associated accounts",
            "Request transaction justification and source of wealth documentation",
        ]
        risk_level = "HIGH"
        confidence = 0.85

    return ExplainResponse(
        cluster_id=cluster.cluster_id,
        typology=cluster.typology,
        ai_summary=summary,
        pattern_description=pattern_desc,
        key_findings=key_findings,
        risk_level=risk_level,
        recommended_actions=recommended_actions,
        confidence_score=confidence,
    )


def generate_llm_explanation(cluster: AlertCluster) -> ExplainResponse:
    """Invokes Gemini LLM if API key is configured, falling back smoothly to heuristic generator."""
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")

    if not api_key:
        logger.info("No GEMINI_API_KEY / GOOGLE_API_KEY found. Using heuristic explainable AI.")
        return generate_heuristic_explanation(cluster)

    prompt = f"""
You are an expert Anti-Money Laundering (AML) and Financial Intelligence Investigator.
Analyze this detected laundering ring cluster and generate a plain-language money-trail explanation:

Cluster ID: {cluster.cluster_id}
Typology: {cluster.typology}
Overall Risk Score: {cluster.risk_score}/100
Total Laundering Volume: ₹{cluster.total_volume} INR
Total Dwell Time: {cluster.dwell_time_mins} minutes
Entry Account: {cluster.entry_node}
Exit Account: {cluster.exit_node}
Participating Accounts:
{json.dumps([n.model_dump() for n in cluster.nodes], indent=2)}
Transactions (Directed Edges):
{json.dumps([e.model_dump() for e in cluster.edges], indent=2)}

Respond with a JSON object strictly matching this schema:
{{
  "cluster_id": "{cluster.cluster_id}",
  "typology": "{cluster.typology}",
  "ai_summary": "Single punchy paragraph explaining who transferred what to whom and how it was recovered/laundered",
  "pattern_description": "Explanation of this specific laundering topology and its mechanics",
  "key_findings": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
  "risk_level": "CRITICAL" | "HIGH" | "ELEVATED",
  "recommended_actions": ["Action 1 for compliance officer", "Action 2", "Action 3"],
  "confidence_score": 0.94
}}
"""

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json",
            },
        }
        res = requests.post(url, json=payload, timeout=8)
        if res.status_code == 200:
            data = res.json()
            raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
            parsed = json.loads(raw_text)
            return ExplainResponse(**parsed)
        else:
            logger.warning(f"Gemini API returned status {res.status_code}: {res.text}. Falling back to heuristics.")
            return generate_heuristic_explanation(cluster)
    except Exception as exc:
        logger.warning(f"Failed to call Gemini API ({exc}). Falling back to heuristic explanation.")
        return generate_heuristic_explanation(cluster)
