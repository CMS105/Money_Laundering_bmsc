"""
LaunderGraph AML - SQLite Database Session & Repository Layer
Manages connection to aml_ledger.db and provides helper functions for persistence.
"""
import os
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path

from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker, Session

from backend.models import Base, Transaction, DetectedCluster, SARReport

# Local SQLite Database Path
DB_DIR = Path(__file__).resolve().parent.parent
DB_PATH = DB_DIR / "aml_ledger.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Initializes tables in aml_ledger.db if they do not already exist."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """FastAPI dependency for yielding database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def save_transactions_batch(records: List[Dict[str, Any]]) -> int:
    """Inserts or ignores a batch of transaction dictionaries into SQLite."""
    if not records:
        return 0
    init_db()
    db: Session = SessionLocal()
    saved = 0
    try:
        for r in records:
            tx_id = str(r.get("tx_id") or r.get("transaction_id") or "")
            if not tx_id:
                continue
            existing = db.query(Transaction).filter(Transaction.tx_id == tx_id).first()
            if not existing:
                tx = Transaction(
                    tx_id=tx_id,
                    source=str(r.get("source") or r.get("source_account") or ""),
                    target=str(r.get("target") or r.get("target_account") or ""),
                    from_bank=str(r.get("from_bank") or "000"),
                    to_bank=str(r.get("to_bank") or "000"),
                    amount=float(r.get("amount") or 0.0),
                    currency=str(r.get("currency") or "USD"),
                    payment_format=str(r.get("payment_format") or "Wire"),
                    timestamp=int(r.get("timestamp") or 0),
                    is_illicit=bool(r.get("is_illicit") or r.get("is_laundering") or False),
                    cluster_id=r.get("cluster_id"),
                )
                db.add(tx)
                saved += 1
        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()
    return saved


def save_detected_clusters(clusters: List[Dict[str, Any]]) -> int:
    """Upserts detected cluster records into SQLite."""
    if not clusters:
        return 0
    init_db()
    db: Session = SessionLocal()
    saved = 0
    try:
        for c in clusters:
            cid = str(c.get("cluster_id") or "")
            if not cid:
                continue
            feat_json = c.get("feature_contributions_json")
            if isinstance(feat_json, (dict, list)):
                feat_json = json.dumps(feat_json)

            existing = db.query(DetectedCluster).filter(DetectedCluster.cluster_id == cid).first()
            if existing:
                existing.typology = str(c.get("typology") or existing.typology)
                existing.risk_score = float(c.get("risk_score") or existing.risk_score)
                existing.ml_probability = float(c.get("ml_probability") or existing.ml_probability)
                existing.isolation_score = float(c.get("isolation_score") or existing.isolation_score)
                existing.total_volume = float(c.get("total_volume") or existing.total_volume)
                existing.entity_count = int(c.get("entity_count") or existing.entity_count)
                existing.duration_hours = float(c.get("duration_hours") or existing.duration_hours)
                existing.feature_contributions_json = feat_json or existing.feature_contributions_json
                existing.detected_at = datetime.utcnow()
            else:
                cluster = DetectedCluster(
                    cluster_id=cid,
                    typology=str(c.get("typology") or "UNKNOWN"),
                    risk_score=float(c.get("risk_score") or 0.0),
                    ml_probability=float(c.get("ml_probability") or 0.0),
                    isolation_score=float(c.get("isolation_score") or 0.0),
                    total_volume=float(c.get("total_volume") or 0.0),
                    entity_count=int(c.get("entity_count") or 0),
                    duration_hours=float(c.get("duration_hours") or 0.0),
                    feature_contributions_json=feat_json,
                    detected_at=datetime.utcnow(),
                )
                db.add(cluster)
            saved += 1
        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()
    return saved


def save_sar_report(sar_data: Dict[str, Any]) -> str:
    """Saves or updates a SAR Report narrative in SQLite."""
    init_db()
    db: Session = SessionLocal()
    sar_id = str(sar_data.get("sar_id") or "")
    try:
        existing = db.query(SARReport).filter(SARReport.sar_id == sar_id).first()
        if existing:
            existing.threat_level = str(sar_data.get("threat_level") or existing.threat_level)
            existing.narrative = str(sar_data.get("narrative") or existing.narrative)
        else:
            rec = SARReport(
                sar_id=sar_id,
                cluster_id=str(sar_data.get("cluster_id") or ""),
                threat_level=str(sar_data.get("threat_level") or "HIGH"),
                narrative=str(sar_data.get("narrative") or ""),
                created_at=datetime.utcnow(),
            )
            db.add(rec)
        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()
    return sar_id


def get_all_sars() -> List[Dict[str, Any]]:
    """Retrieves all SAR reports from SQLite, ordered by newest first."""
    init_db()
    db: Session = SessionLocal()
    try:
        reports = db.query(SARReport).order_by(SARReport.created_at.desc()).all()
        return [
            {
                "sar_id": r.sar_id,
                "cluster_id": r.cluster_id,
                "threat_level": r.threat_level,
                "narrative": r.narrative,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in reports
        ]
    finally:
        db.close()


def get_db_stats() -> Dict[str, int]:
    """Returns total row counts across transactions, clusters, and SAR reports."""
    init_db()
    db: Session = SessionLocal()
    try:
        tx_count = db.query(func.count(Transaction.id)).scalar() or 0
        cluster_count = db.query(func.count(DetectedCluster.id)).scalar() or 0
        sar_count = db.query(func.count(SARReport.id)).scalar() or 0
        return {
            "transactions": tx_count,
            "detected_clusters": cluster_count,
            "sar_reports": sar_count,
        }
    finally:
        db.close()

