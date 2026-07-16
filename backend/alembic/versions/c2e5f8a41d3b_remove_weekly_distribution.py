"""Remove WEEKLY distribution type

Revision ID: c2e5f8a41d3b
Revises: b7d4e1f93a2c
Create Date: 2026-07-16 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'c2e5f8a41d3b'
down_revision: Union[str, Sequence[str], None] = 'b7d4e1f93a2c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # WEEKLY distribution is no longer supported. Reassign any
    # existing WEEKLY payrolls to ONE_TIME before dropping the enum
    # value, since Postgres won't let us drop a value still
    # referenced by a row.
    op.execute(
        "UPDATE payrolls SET distribution_type = 'ONE_TIME' "
        "WHERE distribution_type = 'WEEKLY'"
    )

    op.execute("ALTER TYPE distributiontype RENAME TO distributiontype_old")
    op.execute(
        "CREATE TYPE distributiontype AS ENUM "
        "('ONE_TIME', 'MONTHLY', 'MILESTONE')"
    )
    op.execute(
        "ALTER TABLE payrolls ALTER COLUMN distribution_type "
        "TYPE distributiontype USING distribution_type::text::distributiontype"
    )
    op.execute("DROP TYPE distributiontype_old")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("ALTER TYPE distributiontype RENAME TO distributiontype_new")
    op.execute(
        "CREATE TYPE distributiontype AS ENUM "
        "('ONE_TIME', 'WEEKLY', 'MONTHLY', 'MILESTONE')"
    )
    op.execute(
        "ALTER TABLE payrolls ALTER COLUMN distribution_type "
        "TYPE distributiontype USING distribution_type::text::distributiontype"
    )
    op.execute("DROP TYPE distributiontype_new")
