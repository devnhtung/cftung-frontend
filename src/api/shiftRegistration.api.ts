import axiosInstance from "./axios";
import type {
  ApiResponse,
  PaginatedResponse,
  ShiftRegistration,
} from "../types";

export const shiftRegistrationApi = {
  getAll: async (params?: {
    status?: "pending" | "approved" | "rejected";
    employeeId?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<ShiftRegistration>>> => {
    return axiosInstance.get("/shift-registrations", { params });
  },

  approve: async (id: number): Promise<ApiResponse<ShiftRegistration>> => {
    return axiosInstance.post(`/shift-registrations/${id}/approve`);
  },

  reject: async (id: number): Promise<ApiResponse<ShiftRegistration>> => {
    return axiosInstance.post(`/shift-registrations/${id}/reject`);
  },

  cancel: async (id: number): Promise<ApiResponse> => {
    return axiosInstance.delete(`/shift-registrations/${id}`);
  },

  getStats: async (params?: { employeeId?: number }): Promise<ApiResponse> => {
    return axiosInstance.get("/shift-registrations/stats", { params });
  },
};
