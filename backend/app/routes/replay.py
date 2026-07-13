from fastapi import APIRouter, Query
from app.services.replay_engine import replay_engine


router = APIRouter(prefix="/api/replay", tags=["Replay Demo"])


@router.post("/benign")
def replay_benign(count: int = Query(default=20, ge=1, le=50)):
    return replay_engine.replay("BENIGN", count)


@router.post("/ddos")
def replay_ddos(count: int = Query(default=20, ge=1, le=50)):
    return replay_engine.replay("DDOS", count)


@router.post("/mixed")
def replay_mixed(
    benign_count: int = Query(default=10, ge=1, le=25),
    ddos_count: int = Query(default=10, ge=1, le=25),
):
    benign_result = replay_engine.replay("BENIGN", benign_count)
    ddos_result = replay_engine.replay("DDOS", ddos_count)

    return {
        "status": "success",
        "benign": benign_result,
        "ddos": ddos_result
    }

@router.get("/random-sample")
def random_sample(traffic_type: str = "MIXED"):
    return replay_engine.get_random_sample(traffic_type)
