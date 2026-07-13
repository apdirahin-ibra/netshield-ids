import os


LOCAL_CORS_ORIGINS = (
    "http://localhost:5173",
    "http://127.0.0.1:5173",
)


def env_flag(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def get_cors_origins() -> list[str]:
    configured = os.getenv("CORS_ORIGINS", "")
    origins = [
        origin.strip().rstrip("/")
        for origin in configured.split(",")
        if origin.strip()
    ]
    return origins or list(LOCAL_CORS_ORIGINS)


DEMO_MODE = env_flag("NETSHIELD_DEMO_MODE")
LIVE_CAPTURE_ENABLED = (
    env_flag("NETSHIELD_CAPTURE_ENABLED", default=True) and not DEMO_MODE
)
