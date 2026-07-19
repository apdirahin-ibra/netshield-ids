from datetime import datetime, timedelta, timezone
import json
import os
from pathlib import Path
import sqlite3

from app.security import hash_password, hash_session_token


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
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def utc_now():
    return datetime.now(timezone.utc).isoformat()


def public_user(row):
    if row is None:
        return None
    user = dict(row)
    user.pop("password_hash", None)
    return user


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

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE COLLATE NOCASE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('ADMIN', 'SECURITY_ANALYST')),
            status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Disabled')),
            last_login TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS auth_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            token_hash TEXT NOT NULL UNIQUE,
            user_id INTEGER NOT NULL,
            expires_at TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS manual_predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            user_name TEXT NOT NULL,
            user_email TEXT NOT NULL,
            prediction TEXT NOT NULL,
            confidence REAL NOT NULL,
            status TEXT NOT NULL,
            reason TEXT NOT NULL,
            features_json TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
    """)

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_token ON auth_sessions(token_hash)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_manual_predictions_created ON manual_predictions(id DESC)")

    cursor.execute("SELECT COUNT(*) AS total FROM users")
    if cursor.fetchone()["total"] == 0:
        now = utc_now()
        default_users = (
            (
                "System Administrator",
                "admin@netshield.local",
                os.getenv("NETSHIELD_ADMIN_PASSWORD", "Admin123!"),
                "ADMIN",
            ),
            (
                "Security Analyst",
                "analyst@netshield.local",
                os.getenv("NETSHIELD_ANALYST_PASSWORD", "Analyst123!"),
                "SECURITY_ANALYST",
            ),
        )
        cursor.executemany(
            """
            INSERT INTO users (name, email, password_hash, role, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'Active', ?, ?)
            """,
            [
                (name, email, hash_password(password), role, now, now)
                for name, email, password, role in default_users
            ],
        )

    conn.commit()
    conn.close()


def get_user_by_email(email):
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM users WHERE email = ? COLLATE NOCASE",
            (email.strip().lower(),),
        ).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def get_user_by_id(user_id):
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def list_users():
    conn = get_connection()
    try:
        rows = conn.execute(
            """
            SELECT id, name, email, role, status, last_login, created_at, updated_at
            FROM users
            ORDER BY CASE role WHEN 'ADMIN' THEN 0 ELSE 1 END, name COLLATE NOCASE
            """
        ).fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


def create_user(name, email, password_hash, role, status):
    now = utc_now()
    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            INSERT INTO users (name, email, password_hash, role, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (name.strip(), email.strip().lower(), password_hash, role, status, now, now),
        )
        conn.commit()
        return public_user(get_user_by_id(cursor.lastrowid))
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def update_user(user_id, name, email, role, status, password_hash=None):
    now = utc_now()
    conn = get_connection()
    try:
        if password_hash:
            conn.execute(
                """
                UPDATE users
                SET name = ?, email = ?, role = ?, status = ?, password_hash = ?, updated_at = ?
                WHERE id = ?
                """,
                (
                    name.strip(),
                    email.strip().lower(),
                    role,
                    status,
                    password_hash,
                    now,
                    user_id,
                ),
            )
            conn.execute("DELETE FROM auth_sessions WHERE user_id = ?", (user_id,))
        else:
            conn.execute(
                """
                UPDATE users
                SET name = ?, email = ?, role = ?, status = ?, updated_at = ?
                WHERE id = ?
                """,
                (name.strip(), email.strip().lower(), role, status, now, user_id),
            )
        conn.commit()
        return public_user(get_user_by_id(user_id))
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def delete_user(user_id):
    conn = get_connection()
    try:
        cursor = conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()
        return cursor.rowcount > 0
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def count_active_admins():
    conn = get_connection()
    try:
        return conn.execute(
            "SELECT COUNT(*) AS total FROM users WHERE role = 'ADMIN' AND status = 'Active'"
        ).fetchone()["total"]
    finally:
        conn.close()


def create_auth_session(user_id, token, remember=False):
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=30 if remember else 1)
    conn = get_connection()
    try:
        conn.execute(
            "DELETE FROM auth_sessions WHERE expires_at <= ?",
            (now.isoformat(),),
        )
        conn.execute(
            """
            INSERT INTO auth_sessions (token_hash, user_id, expires_at, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (hash_session_token(token), user_id, expires_at.isoformat(), now.isoformat()),
        )
        conn.execute(
            "UPDATE users SET last_login = ?, updated_at = ? WHERE id = ?",
            (now.isoformat(), now.isoformat(), user_id),
        )
        conn.commit()
        return expires_at.isoformat()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def get_user_for_session(token):
    conn = get_connection()
    try:
        now = utc_now()
        row = conn.execute(
            """
            SELECT users.*
            FROM auth_sessions
            JOIN users ON users.id = auth_sessions.user_id
            WHERE auth_sessions.token_hash = ?
              AND auth_sessions.expires_at > ?
              AND users.status = 'Active'
            """,
            (hash_session_token(token), now),
        ).fetchone()
        return public_user(row)
    finally:
        conn.close()


def delete_auth_session(token):
    conn = get_connection()
    try:
        conn.execute(
            "DELETE FROM auth_sessions WHERE token_hash = ?",
            (hash_session_token(token),),
        )
        conn.commit()
    finally:
        conn.close()


def change_user_password(user_id, password_hash, current_token):
    conn = get_connection()
    try:
        now = utc_now()
        conn.execute(
            "UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?",
            (password_hash, now, user_id),
        )
        conn.execute(
            "DELETE FROM auth_sessions WHERE user_id = ? AND token_hash != ?",
            (user_id, hash_session_token(current_token)),
        )
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def save_manual_prediction(user, data):
    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            INSERT INTO manual_predictions (
                user_id, user_name, user_email, prediction, confidence,
                status, reason, features_json, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user["id"],
                user["name"],
                user["email"],
                data["prediction"],
                data["confidence"],
                data["status"],
                data["reason"],
                json.dumps(data["features_used"], sort_keys=True),
                utc_now(),
            ),
        )
        conn.commit()
        return cursor.lastrowid
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def get_manual_prediction_history(limit=200):
    conn = get_connection()
    try:
        rows = conn.execute(
            """
            SELECT id, user_id, user_name, user_email, prediction, confidence,
                   status, reason, features_json, created_at
            FROM manual_predictions
            ORDER BY id DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()
        history = []
        for row in rows:
            item = dict(row)
            item["features_used"] = json.loads(item.pop("features_json"))
            history.append(item)
        return history
    finally:
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
