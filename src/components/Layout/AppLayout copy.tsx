import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Layout, Menu, Avatar, Dropdown, Typography } from "antd";
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
  CoffeeOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { authApi } from "../../api/auth.api";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const menuItems = [
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

  const userMenuItems = [
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

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === "logout") {
      authApi.logout();
    } else {
      navigate(key);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
        style={{
          borderRight: "1px solid #f0f0f0",
        }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <CoffeeOutlined style={{ fontSize: 24, color: "#667eea" }} />
          {!collapsed && (
            <Text strong style={{ marginLeft: 12, fontSize: 16 }}>
              Coffee Shop
            </Text>
          )}
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={["/dashboard"]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Text strong style={{ fontSize: 18 }}>
            Quản lý quán cà phê
          </Text>

          <Dropdown
            menu={{
              items: userMenuItems,
              onClick: handleMenuClick,
            }}
            placement="bottomRight"
          >
            <div
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Avatar
                icon={<UserOutlined />}
                style={{ backgroundColor: "#667eea" }}
              />
              <Text style={{ marginLeft: 12 }}>{user.username}</Text>
            </div>
          </Dropdown>
        </Header>

        <Content
          style={{
            margin: 24,
            padding: 24,
            background: "#fff",
            borderRadius: 8,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
