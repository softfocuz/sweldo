"""Remove CUSTOM distribution type

Revision ID: b7d4e1f93a2c
Revises: a1f3c9d02b7e
Create Date: 2026-07-16 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'b7d4e1f93a2c'
down_revision: Union[str, Sequence[str], None] = 'a1f3c9d02b7e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # CUSTOM distribution is no longer supported. Reassign any existing
    # CUSTOM payrolls to ONE_TIME before dropping the enum value, since
    # Postgres won't let us drop a value still referenced by a row.
    op.execute(
        "UPDATE payrolls SET distribution_type = 'ONE_TIME' "
        "WHERE distribution_type = 'CUSTOM'"
    )

    op.execute("ALTER TYPE distributiontype RENAME TO distributiontype_old")
    op.execute(
        "CREATE TYPE distributiontype AS ENUM "
        "('ONE_TIME', 'WEEKLY', 'MONTHLY', 'MILESTONE')"
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
        "('ONE_TIME', 'WEEKLY', 'MONTHLY', 'MILESTONE', 'CUSTOM')"
    )
    op.execute(
        "ALTER TABLE payrolls ALTER COLUMN distribution_type "
        "TYPE distributiontype USING distribution_type::text::distributiontype"
    )
    op.execute("DROP TYPE distributiontype_new")
