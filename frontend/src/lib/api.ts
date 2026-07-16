import axios from "axios";
import type {
  AssetRecord,
  BackendUser,
  Claim,
  ClaimXdrResponse,
  DistributionType,
  EmployeeProfile,
  EmployerProfile,
  Payroll,
  ProcessPayrollResponse,
  TransactionRecord,
  WalletRecord
} from "@/types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: BASE_URL
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("sweldo_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("sweldo_token");
    }
    return Promise.reject(error);
  }
);

export const endpoints = {
  login: "/auth/login",
  users: "/users/",
  employers: "/employers/",
  employees: "/employees/",
  wallets: "/wallets/",
  assets: "/assets/",
  payrolls: "/payrolls/",
  claims: "/claims",
  transactions: "/transactions/"
};

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export function login(email: string, password: string) {
  return apiClient.post<LoginResponse>(endpoints.login, { email, password });
}

export function createUser(email: string, password: string, role: "EMPLOYER" | "EMPLOYEE") {
  return apiClient.post<BackendUser>(endpoints.users, { email, password, role });
}

export function getUser(userId: string) {
  return apiClient.get<BackendUser>(`${endpoints.users}${userId}`);
}

export function createEmployerProfile(userId: string, name: string) {
  return apiClient.post<EmployerProfile>(endpoints.employers, { user_id: userId, name });
}

export function updateEmployerProfile(employerId: string, name: string) {
  return apiClient.put<EmployerProfile>(`${endpoints.employers}${employerId}`, { name });
}

export function createEmployeeProfile(userId: string, name: string) {
  return apiClient.post<EmployeeProfile>(endpoints.employees, { user_id: userId, name });
}

export function updateEmployeeProfile(employeeId: string, name: string) {
  return apiClient.put<EmployeeProfile>(`${endpoints.employees}${employeeId}`, { name });
}

export async function findEmployerByUserId(userId: string) {
  const response = await apiClient.get<EmployerProfile[]>(endpoints.employers);
  return response.data.find((employer) => employer.user_id === userId) ?? null;
}

export async function findEmployeeByUserId(userId: string) {
  const response = await apiClient.get<EmployeeProfile[]>(endpoints.employees);
  return response.data.find((employee) => employee.user_id === userId) ?? null;
}

export function listEmployees() {
  return apiClient.get<EmployeeProfile[]>(endpoints.employees);
}

export function listAssets() {
  return apiClient.get<AssetRecord[]>(endpoints.assets);
}

export function createWallet(employeeId: string, publicKey: string, network = "TESTNET") {
  return apiClient.post<WalletRecord>(endpoints.wallets, {
    employee_id: employeeId,
    public_key: publicKey,
    network
  });
}

export function listWallets() {
  return apiClient.get<WalletRecord[]>(endpoints.wallets);
}

export interface CreatePayrollInput {
  employer_id: string;
  employee_id: string;
  asset_id: string;
  title: string;
  amount: number;
  distribution_type: DistributionType;
  start_date: string;
  milestones?: string[];
}

export function createPayroll(input: CreatePayrollInput) {
  return apiClient.post<Payroll>(endpoints.payrolls, input);
}

export function listPayrolls() {
  return apiClient.get<Payroll[]>(endpoints.payrolls);
}

export function processPayroll(payrollId: string) {
  return apiClient.post<ProcessPayrollResponse>(`${endpoints.payrolls}${payrollId}/process`);
}

export function confirmPayrollTransaction(payrollId: string, transactionHash: string) {
  return apiClient.post(`${endpoints.payrolls}${payrollId}/confirm`, {
    transaction_hash: transactionHash
  });
}

export function listClaimsForEmployee(employeeId: string) {
  return apiClient.get<Claim[]>(`${endpoints.claims}/${employeeId}`);
}

export function requestClaimXdr(claimId: string) {
  return apiClient.post<ClaimXdrResponse>(`${endpoints.claims}/${claimId}/claim`);
}

export function confirmClaimTransaction(claimId: string, transactionHash: string) {
  return apiClient.post(`${endpoints.claims}/${claimId}/confirm`, {
    transaction_hash: transactionHash
  });
}

export function listTransactions() {
  return apiClient.get<TransactionRecord[]>(endpoints.transactions);
}
