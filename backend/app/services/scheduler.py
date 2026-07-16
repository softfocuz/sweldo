from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.logger import logger

from app.models.enums import (
    DistributionType,
    PayrollStatus,
)

from app.models.payroll import Payroll

from app.services.payroll_engine import (
    payroll_engine,
)

from app.crud.milestone import (
    milestone_crud,
)


class PayrollScheduler:

    def run(
        self,
        db: Session,
    ):
        payrolls = (
            db.query(Payroll)
            .filter(
                Payroll.status == PayrollStatus.PENDING
            )
            .all()
        )

        logger.info(
            f"Scheduler started. Found {len(payrolls)} pending payroll(s)."
        )

        processed = []

        for payroll in payrolls:

            try:
                due = self.should_process(
                    db,
                    payroll,
                )
            except Exception as e:
                logger.exception(
                    f"Could not evaluate schedule for payroll {payroll.id}: {e}"
                )
                continue

            if not due:
                logger.info(
                    f"Skipped payroll {payroll.id}"
                )
                continue

            logger.info(
                f"Processing payroll {payroll.id}"
            )

            try:

                result = payroll_engine.process(
                    db,
                    payroll,
                )

                processed.append(
                    {
                        "payroll": str(payroll.id),
                        "result": result,
                    }
                )

                logger.info(
                    f"Payroll {payroll.id} processed successfully."
                )

            except Exception as e:

                logger.exception(
                    f"Payroll {payroll.id} failed: {e}"
                )

        logger.info(
            "Scheduler finished."
        )

        return processed

    def should_process(
        self,
        db: Session,
        payroll: Payroll,
    ):

        now = datetime.now(timezone.utc)

        match payroll.distribution_type:

            case DistributionType.ONE_TIME:
                return True

            case DistributionType.MONTHLY:
                # Demo mode: "MONTHLY" fires on a short interval
                # (every MONTHLY_INTERVAL, see payroll_engine.py)
                # instead of waiting a real calendar month, so the
                # recurring-payout experience can actually be seen
                # end-to-end. The scheduling mechanism (next_run)
                # is unchanged from before -- only the cadence is
                # different.
                if payroll.next_run is None:
                    return False

                return payroll.next_run <= now

            case DistributionType.MILESTONE:

                return milestone_crud.all_completed(
                    db,
                    payroll.id,
                )

        return False


scheduler = PayrollScheduler()