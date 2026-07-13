from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class FlowBase(BaseModel):
    src_ip: str
    dst_ip: str
    src_port: int
    dst_port: int
    protocol: str = "TCP"
    flow_duration: float = 0.0
    total_fwd_packets: int = 0
    total_bwd_packets: int = 0
    total_length_fwd: float = 0.0
    total_length_bwd: float = 0.0


class FlowPrediction(FlowBase):
    prediction: str
    confidence: float
    is_attack: bool


class FlowRecordOut(FlowPrediction):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True


class AlertOut(BaseModel):
    id: int
    timestamp: datetime
    severity: str
    attack_type: str
    src_ip: Optional[str] = None
    dst_ip: Optional[str] = None
    src_port: Optional[int] = None
    dst_port: Optional[int] = None
    confidence: float
    message: str
    acknowledged: bool

    class Config:
        from_attributes = True


class AlertAck(BaseModel):
    acknowledged: bool = True


class MonitorStatus(BaseModel):
    running: bool
    mode: str
    packets_captured: int
    flows_processed: int
    attacks_detected: int


class DashboardStats(BaseModel):
    total_flows: int
    total_alerts: int
    attacks_today: int
    benign_ratio: float
    top_attack_types: list[dict[str, Any]] = Field(default_factory=list)


class ReportSummary(BaseModel):
    period: str
    total_flows: int
    total_attacks: int
    alert_count: int
    attack_breakdown: dict[str, int]


class ModelInfo(BaseModel):
    model_type: str
    feature_count: int
    features: list[str]
    model_loaded: bool
    scaler_loaded: bool
    last_trained: Optional[str] = None
