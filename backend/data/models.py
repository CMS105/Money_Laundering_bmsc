from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class TypologyType(str, Enum):
    NORMAL = "NORMAL"
    SMURFING = "SMURFING"
    FAN_IN = "FAN_IN"
    FAN_OUT = "FAN_OUT"
    ROUNDTRIP_CYCLE = "ROUNDTRIP_CYCLE"
    MULE_CHAIN = "MULE_CHAIN"


class Transaction(BaseModel):
    transaction_id: str = Field(..., description="Unique transaction ID")
    timestamp: int = Field(..., description="Unix epoch timestamp in seconds")
    source_account: str = Field(..., description="Originating account ID")
    target_account: str = Field(..., description="Destination account ID")
    amount: float = Field(..., gt=0.0, description="Transaction monetary value")
    currency: str = Field(default="USD", description="Currency ISO code")
    is_laundering: bool = Field(default=False, description="Ground truth laundering label")
    typology: TypologyType = Field(default=TypologyType.NORMAL, description="Laundering typology category")
    pattern_id: Optional[str] = Field(default=None, description="Identifier of the specific ring or cluster")


class DatasetSummary(BaseModel):
    total_transactions: int
    total_accounts: int
    total_volume: float
    laundering_transactions: int
    laundering_ratio: float
    smurfing_rings: int
    cycle_rings: int
    mule_chains: int

