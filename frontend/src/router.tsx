import { Route, Routes } from "react-router-dom";
import { LandingPage } from "@/pages/landing/LandingPage";
import { ChooseRolePage } from "@/pages/auth/ChooseRolePage";
import { EmployerSignupPage } from "@/pages/auth/EmployerSignupPage";
import { EmployeeSignupPage } from "@/pages/auth/EmployeeSignupPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { EmployerDashboardPage } from "@/pages/employer/EmployerDashboardPage";
import { CreatePayrollPage } from "@/pages/employer/CreatePayrollPage";
import { PayrollsPage } from "@/pages/employer/PayrollsPage";
import { EmployerWalletPage } from "@/pages/employer/WalletPage";
import { EmployeesPage } from "@/pages/employer/EmployeesPage";
import { AssetsPage } from "@/pages/employer/AssetsPage";
import { TransactionsPage as EmployerTransactionsPage } from "@/pages/employer/TransactionsPage";
import { SettingsPage as EmployerSettingsPage } from "@/pages/employer/SettingsPage";
import { EmployeeDashboardPage } from "@/pages/employee/EmployeeDashboardPage";
import { ClaimsPage } from "@/pages/employee/ClaimsPage";
import { EmployeeWalletPage } from "@/pages/employee/WalletPage";
import { PayrollsPage as EmployeePayrollsPage } from "@/pages/employee/PayrollsPage";
import { TransactionsPage as EmployeeTransactionsPage } from "@/pages/employee/TransactionsPage";
import { SettingsPage as EmployeeSettingsPage } from "@/pages/employee/SettingsPage";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<ChooseRolePage />} />
      <Route path="/signup/employer" element={<EmployerSignupPage />} />
      <Route path="/signup/employee" element={<EmployeeSignupPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/employer"
        element={
          <ProtectedRoute role="employer">
            <EmployerDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/employees"
        element={
          <ProtectedRoute role="employer">
            <EmployeesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/payrolls"
        element={
          <ProtectedRoute role="employer">
            <PayrollsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/payrolls/new"
        element={
          <ProtectedRoute role="employer">
            <CreatePayrollPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/assets"
        element={
          <ProtectedRoute role="employer">
            <AssetsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/wallet"
        element={
          <ProtectedRoute role="employer">
            <EmployerWalletPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/transactions"
        element={
          <ProtectedRoute role="employer">
            <EmployerTransactionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/settings"
        element={
          <ProtectedRoute role="employer">
            <EmployerSettingsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee"
        element={
          <ProtectedRoute role="employee">
            <EmployeeDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/payrolls"
        element={
          <ProtectedRoute role="employee">
            <EmployeePayrollsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/claims"
        element={
          <ProtectedRoute role="employee">
            <ClaimsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/wallet"
        element={
          <ProtectedRoute role="employee">
            <EmployeeWalletPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/transactions"
        element={
          <ProtectedRoute role="employee">
            <EmployeeTransactionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/settings"
        element={
          <ProtectedRoute role="employee">
            <EmployeeSettingsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
