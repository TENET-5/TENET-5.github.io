#!/usr/bin/env python3
"""Phase 80-84 — LIRIL & NATS System Telemetry Generators"""
import sys, os, json, time, random, math
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
SEED = 118400
random.seed(SEED)

DOMAINS = ["ART", "TECHNOLOGY", "SCIENCE", "REASONING", "ETHICS", "MATHEMATICS", "NATURE", "TEMPORAL", "PROGRAMMING"]

def generate_phase80():
    """Phase 80: NATS Message Rate Monitor"""
    top_subjects = [
        {"subject": "tenet5.liril.classify", "rate_per_s": 14.2, "total": 142500},
        {"subject": "tenet5.liril.train", "rate_per_s": 5.8, "total": 58200},
        {"subject": "tenet5.aurora.ingest", "rate_per_s": 3.1, "total": 31500},
        {"subject": "tenet5.nemoclaw.status", "rate_per_s": 2.0, "total": 20400},
        {"subject": "tenet5.liril.route", "rate_per_s": 1.5, "total": 15000},
    ]
    data = {
        "metadata": {"version": "Phase 80: NATS Monitor", "seed": SEED},
        "total_msgs": 267600,
        "subjects_seen": 42,
        "top_subjects": top_subjects,
        "uptime_s": 86400 * 2.5,  # 2.5 days
        "server_in_msgs": 280100,
        "server_out_msgs": 560200,
        "server_in_bytes": 1024 * 1024 * 850, # 850 MB
        "server_connections": 14,
        "server_subscriptions": 128,
        "ts": time.time(),
    }
    (DATA_DIR / "osint_phase80_nats.json").write_text(json.dumps(data, indent=2))
    return data

def generate_phase81():
    """Phase 81: LIRIL Streaming WebSocket Chat"""
    data = {
        "metadata": {"version": "Phase 81: LIRIL WS Chat", "seed": SEED},
        "active_sessions": 8,
        "total_msgs": 4250,
        "total_tokens": 128500,
        "uptime_s": 86400 * 2.5,
        "ts": time.time()
    }
    (DATA_DIR / "osint_phase81_chat.json").write_text(json.dumps(data, indent=2))
    return data

def generate_phase82():
    """Phase 82: NemoClaw Request Queue"""
    data = {
        "metadata": {"version": "Phase 82: NemoClaw Queue", "seed": SEED},
        "total_tasks_sent": 8500,
        "total_done": 8495,
        "total_fail": 2,
        "queue_depth": 3,
        "gpus": {
            "gpu0": {
                "label": "GPU 0",
                "model": "Nemotron-9B",
                "queue_depth": 0,
                "total_reqs": 6200,
                "total_ok": 6200,
                "total_fail": 0,
                "throughput_rpm": 45.2,
                "last_latency_ms": 120.5,
                "state": "idle",
                "warmup": True,
                "last_ts": time.time() - 2,
            },
            "gpu1": {
                "label": "GPU 1",
                "model": "Mistral-12B",
                "queue_depth": 3,
                "total_reqs": 2300,
                "total_ok": 2295,
                "total_fail": 2,
                "throughput_rpm": 12.5,
                "last_latency_ms": 1450.2,
                "state": "processing",
                "warmup": True,
                "last_ts": time.time() - 1,
            }
        },
        "ts": time.time()
    }
    (DATA_DIR / "osint_phase82_nemoclaw.json").write_text(json.dumps(data, indent=2))
    return data

def generate_phase83():
    """Phase 83: LIRIL Confidence Tracker"""
    per_domain = {}
    histogram = {}
    total_classifications = 0
    drift_alerts = {}
    for d in DOMAINS:
        count = random.randint(10, 200)
        total_classifications += count
        histogram[d] = count
        config_val = random.uniform(0.70, 0.99)
        per_domain[d] = {
            "avg_confidence": round(config_val, 3),
            "count_5min": random.randint(1, 15),
            "ema": round(config_val + random.uniform(-0.02, 0.02), 3),
            "drift_alert": config_val < 0.75,
        }
        if config_val < 0.75:
            drift_alerts[d] = random.randint(10, 120)

    data = {
        "metadata": {"version": "Phase 83: LIRIL Confidence", "seed": SEED},
        "total_classifications": total_classifications + 142000,
        "total_trains": 58000,
        "window_s": 300,
        "sample_rate_rpm": round((total_classifications+142000)/ (86400*2.5/60), 2),
        "npu_count": 140000,
        "gpu_count": 2000 + total_classifications,
        "npu_pct": 98.5,
        "top_domain": max(histogram, key=histogram.get),
        "per_domain": per_domain,
        "histogram": histogram,
        "drift_alerts": drift_alerts,
        "ts": time.time()
    }
    (DATA_DIR / "osint_phase83_confidence.json").write_text(json.dumps(data, indent=2))
    return data

def generate_phase84():
    """Phase 84: LIRIL Heatmap Tracker"""
    per_domain = {}
    total = 0
    now = time.time()
    stale_domains = []
    
    for d in DOMAINS:
        domain_total = random.randint(1000, 15000)
        total += domain_total
        hourly = [random.randint(0, domain_total // 24 * 2) for _ in range(24)]
        daily = [random.randint(domain_total // 10, domain_total // 5) for _ in range(7)]
        stale = random.random() < 0.15
        stale_hours = random.randint(7, 48) if stale else None
        if stale:
            stale_domains.append(d)
        
        per_domain[d] = {
            "total": domain_total,
            "hourly": hourly,
            "daily_7d": daily,
            "last_trained": now - (stale_hours * 3600 if stale else random.randint(0, 3600)),
            "acc_ema": round(random.uniform(0.75, 0.99), 3),
            "stale": stale,
            "stale_hours": stale_hours
        }

    data = {
        "metadata": {"version": "Phase 84: LIRIL Heatmap", "seed": SEED},
        "grand_total": total,
        "velocity_rpm": round(random.uniform(10.0, 50.0), 2),
        "most_active": max(per_domain.keys(), key=lambda k: per_domain[k]["total"]),
        "stale_domains": stale_domains,
        "per_domain": per_domain,
        "uptime_s": 86400 * 2.5,
        "ts": time.time()
    }
    (DATA_DIR / "osint_phase84_heatmap.json").write_text(json.dumps(data, indent=2))
    return data

def main():
    p80 = generate_phase80()
    print(f"Phase 80: {p80['total_msgs']} NATS msgs, {len(p80['top_subjects'])} top subjects tracked.")
    p81 = generate_phase81()
    print(f"Phase 81: {p81['active_sessions']} WS chats, {p81['total_tokens']} tokens.")
    p82 = generate_phase82()
    print(f"Phase 82: {p82['total_tasks_sent']} tasks sent, Queue Depth {p82['queue_depth']}.")
    p83 = generate_phase83()
    print(f"Phase 83: {p83['npu_pct']}% NPU routing, {len(p83['drift_alerts'])} drift alerts.")
    p84 = generate_phase84()
    print(f"Phase 84: {p84['velocity_rpm']} rpm training velocity, {len(p84['stale_domains'])} stale domains.")

if __name__ == "__main__":
    main()
