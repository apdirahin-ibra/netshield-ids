from pathlib import Path
from datetime import datetime
import json
import os


BACKEND_DIR = Path(__file__).resolve().parents[2]
configured_log_dir = Path(os.getenv("NETSHIELD_LOG_DIR", "logs")).expanduser()
LOG_DIR = (
    configured_log_dir
    if configured_log_dir.is_absolute()
    else BACKEND_DIR / configured_log_dir
).resolve()

LOG_DIR.mkdir(parents=True, exist_ok=True)


def _write_json_line(filename, data):
    """
    Write one JSON record per line into a log file.
    """

    log_path = LOG_DIR / filename

    payload = dict(data)
    payload["logged_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    with open(log_path, "a", encoding="utf-8") as file:
        file.write(json.dumps(payload, default=str) + "\n")


def log_prediction(data):
    """
    Save prediction result to predictions.log.
    """

    _write_json_line("predictions.log", data)


def log_alert(data):
    """
    Save DDoS alert to alerts.log.
    """

    _write_json_line("alerts.log", data)


def log_system(message, level="INFO"):
    """
    Save system events to system.log.
    """

    data = {
        "level": level,
        "message": message
    }

    _write_json_line("system.log", data)
