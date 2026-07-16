from apscheduler.schedulers.background import BackgroundScheduler

from app.core.database import SessionLocal
from app.services.scheduler import scheduler


class SchedulerService:

    def __init__(self):
        self.scheduler = BackgroundScheduler()

    def process_payrolls(self):
        db = SessionLocal()

        try:
            scheduler.run(db)
        finally:
            db.close()

    def start(self):
        if self.scheduler.running:
            # Guards against a second startup event (e.g. an
            # accidental double app-init) spinning up a second
            # in-process scheduler, which would process every due
            # payroll twice and create duplicate on-chain payouts.
            return

        self.scheduler.add_job(
            self.process_payrolls,
            "interval",
            minutes=1,
            id="payroll_scheduler",
            replace_existing=True,
            max_instances=1,
            coalesce=True,
        )

        self.scheduler.start()

    def shutdown(self):
        self.scheduler.shutdown()


scheduler_service = SchedulerService()