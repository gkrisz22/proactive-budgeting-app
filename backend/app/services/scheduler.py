"""
APScheduler setup.

Jobs:
  - pace_alert_job: every 6 hours — checks spending pace for all users
"""

import os

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.db.database import SessionLocal
from app.services.alert_service import run_all_alerts_for_all_users

scheduler = BackgroundScheduler(timezone="UTC")

_SCHEDULER_WORKER = os.environ.get("SCHEDULER_WORKER", "1")
_THIS_WORKER = os.environ.get("WEB_WORKER_ID", "1")
_SCHEDULER_ENABLED = (_THIS_WORKER == _SCHEDULER_WORKER)


def _pace_alert_job():
    db = SessionLocal()
    try:
        run_all_alerts_for_all_users(db)
    finally:
        db.close()


def start_scheduler():
    if not _SCHEDULER_ENABLED:
        print(f"APScheduler skipped: WEB_WORKER_ID={_THIS_WORKER} is not the designated scheduler worker.")
        return
    scheduler.add_job(
        _pace_alert_job,
        trigger=IntervalTrigger(hours=6),
        id="pace_alert_job",
        replace_existing=True,
    )
    scheduler.start()
    print("APScheduler started: pace alerts every 6 h")


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
        print("APScheduler stopped")
