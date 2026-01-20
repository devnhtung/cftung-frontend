export interface User {
  id: number;
  username: string;
  userType: "admin" | "employee" | "customer";
  employeeId?: number;
}

export interface Employee {
  id: number;
  fullName: string;
  phone?: string;
  address?: string;
  dob?: string;
  cccd?: string;
  joinDate?: string;
  salaryCoefficient?: number | string;
  roleId?: number;
  active?: boolean;
  role?: Role;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  baseHourlySalary: number;
}

export interface ShiftType {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
}

export interface Shift {
  id: number;
  date: string;
  shiftTypeId: number;
  notes?: string;
  shiftType?: ShiftType;
  registrations?: ShiftRegistration[];
}

export interface ShiftRegistration {
  id: number;
  shiftId: number;
  employeeId: number;
  status: "pending" | "approved" | "rejected";
  registrationDate: string;
  approvalDate?: string;
  shift?: Shift;
  employee?: Employee;
}

export interface Attendance {
  id: number;
  shiftRegistrationId: number;
  checkInTime?: string;
  checkOutTime?: string;
  checkInLat?: number;
  checkInLong?: number;
  checkOutLat?: number;
  checkOutLong?: number;
  verified: boolean;
  actualHours?: number;
  shiftRegistration?: ShiftRegistration;
}

export interface Task {
  id: number;
  roleId?: number;
  shiftTypeId: number;
  description: string;
  isMandatory: boolean;
  role?: Role;
  shiftType?: ShiftType;
}

export interface ChecklistCompletion {
  id: number;
  shiftRegistrationId: number;
  taskId: number;
  status: "in_progress" | "completed" | "redo" | "unable";
  completionTime?: string;
  managerRating?: number;
  completionImageUrl?: string;
  notes?: string;
  managerNotes?: string;
  task?: Task;
}

export interface Salary {
  id: number;
  employeeId: number;
  monthYear: string;
  baseSalary: number;
  advancesTotal: number;
  bonus: number;
  penalty: number;
  finalSalary: number;
  status: "pending" | "paid";
  paymentDate?: string;
  notes?: string;
  employee?: Employee;
  shiftDetails?: SalaryShiftDetail[];
}

export interface SalaryShiftDetail {
  id: number;
  salaryId: number;
  shiftDate: string;
  shiftTypeName: string;
  actualHours: number;
  baseHourlySalary: number;
  salaryCoefficient: number;
  shiftSalary: number;
  bonus: number;
  penalty: number;
}

export interface SalaryAdvance {
  id: number;
  employeeId: number;
  amount: number;
  requestDate: string;
  approvalDate?: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  employee?: Employee;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
