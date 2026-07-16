export type UserRole = "EMPLOYER" | "EMPLOYEE";

export type AppRole = "employer" | "employee";

export interface BackendUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface EmployerProfile {
  id: string;
  user_id: string;
  name: string;
}

export interface EmployeeProfile {
  id: string;
  user_id: string;
  name: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  profileId: string;
  walletAddress: string | null;
}

export interface WalletRecord {
  id: string;
  employee_id: string;
  public_key: string;
  network: string;
}

export type DistributionType = "ONE_TIME" | "MONTHLY" | "MILESTONE";

export type PayrollStatus = "PENDING" | "FUNDED" | "COMPLETED" | "FAILED";

export interface AssetRecord {
  id: string;
  name: string;
  code: string;
  issuer: string | null;
  decimals: number;
  is_native: boolean;
  is_active: boolean;
}

export interface Payroll {
  id: string;
  employer_id: string;
  employee_id: string;
  asset_id: string;
  title: string;
  amount: number;
  distribution_type: DistributionType;
  status: PayrollStatus;
  stellar_transaction_hash: string | null;
  start_date: string;
}

export type ClaimStatus = "PENDING" | "CLAIMABLE" | "CLAIMED" | "FAILED";

export interface Claim {
  id: string;
  payroll_id: string;
  employee_id: string;
  claimable_balance_id: string;
  status: ClaimStatus;
}

export interface ProcessPayrollWaiting {
  status: "waiting";
  message: string;
}

export interface ProcessPayrollFunded {
  claimable_balance_id: string | null;
  transaction_hash: string | null;
  status: "created" | "repaired" | "already_funded";
}

export type ProcessPayrollResponse = ProcessPayrollWaiting | ProcessPayrollFunded;

export type TransactionStatus = "FUNDED" | "CLAIMED" | "FAILED";

export interface TransactionRecord {
  id: string;
  claim_id: string;
  stellar_tx_hash: string;
  ledger: number;
  status: TransactionStatus;
}

export interface ClaimXdrResponse {
  claim_id: string;
  xdr: string;
}
