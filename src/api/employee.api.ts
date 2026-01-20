import axiosInstance from "./axios";
import type { ApiResponse, PaginatedResponse, Employee } from "../types";

export const employeeApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    roleId?: number;
    active?: boolean;
  }): Promise<ApiResponse<PaginatedResponse<Employee>>> => {
    return axiosInstance.get("/employees", { params });
  },

  getById: async (id: number): Promise<ApiResponse<Employee>> => {
    return axiosInstance.get(`/employees/${id}`);
  },

  update: async (
    id: number,
    data: Partial<Employee>
  ): Promise<ApiResponse<Employee>> => {
    return axiosInstance.put(`/employees/${id}`, data);
  },

  deactivate: async (id: number): Promise<ApiResponse> => {
    return axiosInstance.post(`/employees/${id}/deactivate`);
  },

  activate: async (id: number): Promise<ApiResponse> => {
    return axiosInstance.post(`/employees/${id}/activate`);
  },

  delete: async (id: number): Promise<ApiResponse> => {
    return axiosInstance.delete(`/employees/${id}`);
  },

  getStats: async (): Promise<ApiResponse> => {
    return axiosInstance.get("/employees/stats");
  },
};
