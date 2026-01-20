import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import Login from "./pages/Login";
import AppLayout from "./components/Layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import EmployeeList from "./pages/Employees/EmployeeList";
import ShiftList from "./pages/Shifts/ShiftList";
import ShiftRegistrations from "./pages/Shifts/ShiftRegistrations";
import AttendanceList from "./pages/Attendance/AttendanceList";
import TaskList from "./pages/Tasks/TaskList";
import ChecklistReview from "./pages/Tasks/ChecklistReview";
import SalaryList from "./pages/Salary/SalaryList";
import RoleList from "./pages/Settings/RoleList";
import ShiftTypeList from "./pages/Settings/ShiftTypeList";
import ReportsPage from "./pages/Reports/ReportsPage";

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ConfigProvider locale={viVN}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="employees" element={<EmployeeList />} />
            <Route path="shifts">
              <Route index element={<ShiftList />} />
              <Route path="registrations" element={<ShiftRegistrations />} />
            </Route>
            <Route path="attendance" element={<AttendanceList />} />
            <Route path="tasks">
              <Route index element={<TaskList />} />
              <Route path="review" element={<ChecklistReview />} />
            </Route>
            <Route path="salaries" element={<SalaryList />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings">
              <Route path="roles" element={<RoleList />} />
              <Route path="shift-types" element={<ShiftTypeList />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
