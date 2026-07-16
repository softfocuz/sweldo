"""Add optional message field to payrolls

Revision ID: a1f3c9d02b7e
Revises: 8d411f9360da
Create Date: 2026-07-16 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1f3c9d02b7e'
down_revision: Union[str, Sequence[str], None] = '8d411f9360da'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'payrolls',
        sa.Column('message', sa.String(length=500), nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('payrolls', 'message')
