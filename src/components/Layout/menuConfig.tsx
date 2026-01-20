import {
  DashboardOutlined,
  TeamOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckSquareOutlined,
  DollarOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { MenuProps } from "antd";

export type MenuItem = Required<MenuProps>["items"][number];

export const mainMenuItems: MenuItem[] = [
  {
    key: "/dashboard",
    icon: <DashboardOutlined />,
    label: "Dashboard",
  },
  {
    key: "/employees",
    icon: <TeamOutlined />,
    label: "Nhân viên",
  },
  {
    key: "shifts-menu",
    icon: <CalendarOutlined />,
    label: "Ca làm việc",
    children: [
      { key: "/shifts", label: "Danh sách ca" },
      { key: "/shifts/registrations", label: "Duyệt đăng ký" },
    ],
  },
  {
    key: "/attendance",
    icon: <ClockCircleOutlined />,
    label: "Chấm công",
  },
  {
    key: "tasks-menu",
    icon: <CheckSquareOutlined />,
    label: "Công việc",
    children: [
      { key: "/tasks", label: "Quản lý công việc" },
      { key: "/tasks/review", label: "Đánh giá checklist" },
    ],
  },
  {
    key: "/salaries",
    icon: <DollarOutlined />,
    label: "Lương",
  },
  {
    key: "/reports",
    icon: <BarChartOutlined />,
    label: "Báo cáo",
  },
  {
    key: "settings-menu",
    icon: <SettingOutlined />,
    label: "Cài đặt",
    children: [
      { key: "/settings/roles", label: "Vai trò" },
      { key: "/settings/shift-types", label: "Loại ca" },
    ],
  },
];

export const userMenuItems: MenuItem[] = [
  {
    key: "profile",
    icon: <UserOutlined />,
    label: "Thông tin cá nhân",
  },
  {
    type: "divider",
  },
  {
    key: "logout",
    icon: <LogoutOutlined />,
    label: "Đăng xuất",
    danger: true,
  },
];

// Helper function to get current selected menu key from pathname
export const getSelectedMenuKey = (pathname: string): string => {
  // Remove trailing slash
  const cleanPath =
    pathname.endsWith("/") && pathname !== "/"
      ? pathname.slice(0, -1)
      : pathname;

  // Check if current path matches any menu item
  const findKey = (items: MenuItem[], path: string): string | null => {
    for (const item of items) {
      if (item && typeof item === "object" && "key" in item) {
        if (item.key === path) return item.key as string;

        if ("children" in item && item.children) {
          const childKey = findKey(item.children as MenuItem[], path);
          if (childKey) return childKey;
        }
      }
    }
    return null;
  };

  return findKey(mainMenuItems, cleanPath) || "/dashboard";
};

// Helper to get open keys for submenu
export const getOpenKeys = (pathname: string): string[] => {
  if (pathname.startsWith("/shifts")) return ["shifts-menu"];
  if (pathname.startsWith("/tasks")) return ["tasks-menu"];
  if (pathname.startsWith("/settings")) return ["settings-menu"];
  return [];
};
