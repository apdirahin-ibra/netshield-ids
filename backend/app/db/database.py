from datetime import datetime
import os
from pathlib import Path
import sqlite3


BACKEND_DIR = Path(__file__).resolve().parents[2]
configured_data_dir = Path(os.getenv("NETSHIELD_DATA_DIR", "data")).expanduser()
DATA_DIR = (
    configured_data_dir
    if configured_data_dir.is_absolute()
    else BACKEND_DIR / configured_data_dir
).resolve()
DB_PATH = DATA_DIR / "netshield.db"

DATA_DIR.mkdir(parents=True, exist_ok=True)


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            flow_key TEXT,
            packets INTEGER,
            src_ip TEXT,
            dst_ip TEXT,
            protocol TEXT,
            prediction TEXT,
            confidence REAL,
            created_at TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            alert_id TEXT,
            timestamp TEXT,
            alert_type TEXT,
            severity TEXT,
            flow_key TEXT,
            source TEXT,
            destination TEXT,
            total_packets INTEGER,
            total_bytes INTEGER,
            prediction TEXT,
            confidence REAL,
            created_at TEXT
        )
    """)

    conn.commit()
    conn.close()


def save_prediction(data):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO predictions (
            timestamp,
            flow_key,
            packets,
            src_ip,
            dst_ip,
            protocol,
            prediction,
            confidence,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.get("timestamp"),
        data.get("flow_key"),
        data.get("packets"),
        data.get("src_ip"),
        data.get("dst_ip"),
        data.get("protocol"),
        data.get("prediction"),
        data.get("confidence"),
        datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ))

    conn.commit()
    conn.close()


def save_alert(data):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO alerts (
            alert_id,
            timestamp,
            alert_type,
            severity,
            flow_key,
            source,
            destination,
            total_packets,
            total_bytes,
            prediction,
            confidence,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.get("alert_id"),
        data.get("timestamp"),
        data.get("alert_type"),
        data.get("severity"),
        data.get("flow_key"),
        data.get("source"),
        data.get("destination"),
        data.get("total_packets"),
        data.get("total_bytes"),
        data.get("prediction"),
        data.get("confidence"),
        datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ))

    conn.commit()
    conn.close()


def get_recent_predictions(limit=20):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM predictions
        ORDER BY id DESC
        LIMIT ?
    """, (limit,))

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


def get_recent_alerts(limit=20):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM alerts
        ORDER BY id DESC
        LIMIT ?
    """, (limit,))

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


def get_dashboard_stats():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) AS total FROM predictions")
    total_predictions = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) AS total FROM predictions WHERE prediction = 'BENIGN'")
    benign_count = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) AS total FROM predictions WHERE prediction = 'DDoS'")
    ddos_count = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) AS total FROM alerts")
    alert_count = cursor.fetchone()["total"]

    cursor.execute("""
        SELECT AVG(confidence) AS avg_confidence
        FROM predictions
        WHERE confidence IS NOT NULL
    """)
    avg_confidence = cursor.fetchone()["avg_confidence"]

    conn.close()

    return {
        "total_predictions": total_predictions,
        "benign_count": benign_count,
        "ddos_count": ddos_count,
        "alert_count": alert_count,
        "average_confidence": round(avg_confidence, 4) if avg_confidence else 0
    }


def clear_dashboard_data():
    """Delete all saved predictions and alerts in one transaction."""
    conn = get_connection()

    try:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) AS total FROM predictions")
        deleted_predictions = cursor.fetchone()["total"]
        cursor.execute("SELECT COUNT(*) AS total FROM alerts")
        deleted_alerts = cursor.fetchone()["total"]

        cursor.execute("DELETE FROM alerts")
        cursor.execute("DELETE FROM predictions")
        cursor.execute(
            "DELETE FROM sqlite_sequence WHERE name IN ('predictions', 'alerts')"
        )
        conn.commit()

        return {
            "deleted_predictions": deleted_predictions,
            "deleted_alerts": deleted_alerts,
        }
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
