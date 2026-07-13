from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text

from app.db.database import Base


class FlowRecord(Base):
    __tablename__ = "flow_records"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    src_ip = Column(String(45))
    dst_ip = Column(String(45))
    src_port = Column(Integer)
    dst_port = Column(Integer)
    protocol = Column(String(16))
    flow_duration = Column(Float)
    total_fwd_packets = Column(Integer)
    total_bwd_packets = Column(Integer)
    total_length_fwd = Column(Float)
    total_length_bwd = Column(Float)
    prediction = Column(String(64))
    confidence = Column(Float)
    is_attack = Column(Boolean, default=False)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    severity = Column(String(16), default="medium")
    attack_type = Column(String(64))
    src_ip = Column(String(45))
    dst_ip = Column(String(45))
    src_port = Column(Integer)
    dst_port = Column(Integer)
    confidence = Column(Float)
    message = Column(Text)
    acknowledged = Column(Boolean, default=False)
