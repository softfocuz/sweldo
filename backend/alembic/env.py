from logging.config import fileConfig

from sqlalchemy import create_engine
from alembic import context

from app.core.config import settings
from app.models.base import Base

from app.models.user import User
from app.models.employer import Employer
from app.models.employee import Employee
from app.models.wallet import Wallet
from app.models.asset import Asset
from app.models.payroll import Payroll
from app.models.claim import Claim
from app.models.transaction import Transaction

config = context.config

config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline():
    context.configure(
        url=settings.DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = create_engine(settings.DATABASE_URL)

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()