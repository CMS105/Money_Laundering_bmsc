"""
LaunderGraph AML - SQLite Database Models
Defines SQLAlchemy ORM tables for transactions, detected clusters, and SAR reports.
"""
from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    Text,
)
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tx_id = Column(String(100), unique=True, index=True, nullable=False)
    source = Column(String(100), index=True, nullable=False)
    target = Column(String(100), index=True, nullable=False)
    from_bank = Column(String(50), nullable=True, default="000")
    to_bank = Column(String(50), nullable=True, default="000")
    amount = Column(Float, nullable=False, default=0.0)
    currency = Column(String(20), nullable=True, default="USD")
    payment_format = Column(String(50), nullable=True, default="Wire")
    timestamp = Column(Integer, index=True, nullable=False)  # Unix epoch
    is_illicit = Column(Boolean, default=False, index=True)
    cluster_id = Column(String(100), nullable=True, index=True)


class DetectedCluster(Base):
    __tablename__ = "detected_clusters"

    id = Column(Integer, primary_key=True, autoincrement=True)
    cluster_id = Column(String(100), unique=True, index=True, nullable=False)
    typology = Column(String(100), nullable=False)
    risk_score = Column(Float, nullable=False)
    ml_probability = Column(Float, nullable=False, default=0.0)
    isolation_score = Column(Float, nullable=False, default=0.0)
    total_volume = Column(Float, nullable=False, default=0.0)
    entity_count = Column(Integer, nullable=False, default=0)
    duration_hours = Column(Float, nullable=False, default=0.0)
    feature_contributions_json = Column(Text, nullable=True)
    detected_at = Column(DateTime, default=datetime.utcnow)


class SARReport(Base):
    __tablename__ = "sar_reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    sar_id = Column(String(100), unique=True, index=True, nullable=False)
    cluster_id = Column(String(100), index=True, nullable=False)
    threat_level = Column(String(50), nullable=False)
    narrative = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

