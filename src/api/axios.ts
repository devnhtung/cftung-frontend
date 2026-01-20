import axios from "axios";
import { message } from "antd";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem("accessToken", accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Show error message
    const errorMessage = error.response?.data?.message || "Đã có lỗi xảy ra";
    message.error(errorMessage);

    return Promise.reject(error);
  }
);

export default axiosInstance;
