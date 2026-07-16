from enum import Enum


class UserRole(str, Enum):
    EMPLOYER = "EMPLOYER"
    EMPLOYEE = "EMPLOYEE"


class DistributionType(str, Enum):
    ONE_TIME = "ONE_TIME"
    MONTHLY = "MONTHLY"
    MILESTONE = "MILESTONE"


class PayrollStatus(str, Enum):
    PENDING = "PENDING"
    FUNDED = "FUNDED"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class ClaimStatus(str, Enum):
    PENDING = "PENDING"
    CLAIMABLE = "CLAIMABLE"
    CLAIMED = "CLAIMED"
    FAILED = "FAILED"

class MilestoneStatus(str, Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"


class TransactionStatus(str, Enum):
    FUNDED = "FUNDED"
    CLAIMED = "CLAIMED"
    FAILED = "FAILED"