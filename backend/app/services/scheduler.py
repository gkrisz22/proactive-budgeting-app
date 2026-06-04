"""
APScheduler setup.

Jobs:
  - pace_alert_job: every 6 hours — checks spending pace for all users
  - event_reminder_job: daily at 08:00 — sends event reminder alerts

Multi-worker note:
  BackgroundScheduler runs in-process. With multiple uvicorn workers (or
  gunicorn) each process starts its own scheduler, causing jobs to fire N times
  concurrently.  For a single-worker setup this is fine.  To support multiple
  workers, replace BackgroundScheduler with a distributed task queue
  (e.g. Celery + Beat + Redis) or add an advisory-lock guard using PostgreSQL
  pg_try_advisory_lock() inside each job function.
"""

import os

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from app.db.database import SessionLocal
from app.services.alert_service import run_all_alerts_for_all_users, run_event_reminders_for_all_users

scheduler = BackgroundScheduler(timezone="UTC")

# When running multiple workers (e.g. WEB_CONCURRENCY > 1), only let the
# first worker (identified by an env flag set by the process manager) start
# the scheduler.  For a single-worker setup this env var is not set and the
# guard is a no-op.
_SCHEDULER_WORKER = os.environ.get("SCHEDULER_WORKER", "1")
_THIS_WORKER = os.environ.get("WEB_WORKER_ID", "1")
_SCHEDULER_ENABLED = (_THIS_WORKER == _SCHEDULER_WORKER)


def _pace_alert_job():
    db = SessionLocal()
    try:
        run_all_alerts_for_all_users(db)
    finally:
        db.close()


def _event_reminder_job():
    db = SessionLocal()
    try:
        run_event_reminders_for_all_users(db)
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
    scheduler.add_job(
        _event_reminder_job,
        trigger=CronTrigger(hour=8, minute=0),
        id="event_reminder_job",
        replace_existing=True,
    )
    scheduler.start()
    print("APScheduler started: pace alerts every 6 h, event reminders daily at 08:00 UTC")


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
        print("APScheduler stopped")
