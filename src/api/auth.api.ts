// api/auth.api.ts

import axiosInstance from "./axios";
import type { ApiResponse, User } from "../types";

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: async (
    credentials: LoginCredentials
  ): Promise<ApiResponse<LoginResponse>> => {
    return axiosInstance.post("/auth/login", credentials);
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    return axiosInstance.get("/auth/me");
  },

  changePassword: async (data: {
    oldPassword: string;
    newPassword: string;
  }): Promise<ApiResponse> => {
    return axiosInstance.post("/auth/change-password", data);
  },

  logout: () => {
    localStorage.clear();
    window.location.href = "/login";
  },
};
