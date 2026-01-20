import axiosInstance from "./axios";
import type { ApiResponse, PaginatedResponse, Shift } from "../types";

export const shiftApi = {
  getAll: async (params?: {
    startDate?: string;
    endDate?: string;
    shiftTypeId?: number;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<Shift>>> => {
    return axiosInstance.get("/shifts", { params });
  },

  getById: async (id: number): Promise<ApiResponse<Shift>> => {
    return axiosInstance.get(`/shifts/${id}`);
  },

  getWeekSchedule: async (startDate: string): Promise<ApiResponse> => {
    return axiosInstance.get("/shifts/week-schedule", {
      params: { startDate },
    });
  },

  create: async (data: {
    date: string;
    shiftTypeId: number;
    notes?: string;
  }): Promise<ApiResponse<Shift>> => {
    return axiosInstance.post("/shifts", data);
  },

  createBulk: async (data: {
    startDate: string;
    endDate: string;
    shiftTypeIds: number[];
  }): Promise<ApiResponse> => {
    return axiosInstance.post("/shifts/bulk", data);
  },

  update: async (
    id: number,
    data: { notes?: string }
  ): Promise<ApiResponse<Shift>> => {
    return axiosInstance.put(`/shifts/${id}`, data);
  },

  delete: async (id: number): Promise<ApiResponse> => {
    return axiosInstance.delete(`/shifts/${id}`);
  },
};
