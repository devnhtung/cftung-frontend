import { Layout, Avatar, Dropdown, Typography, Space, Badge } from "antd";
import { BellOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/auth.api";
import { userMenuItems } from "./menuConfig";
import { useMemo } from "react";

const { Header } = Layout;
const { Text } = Typography;

interface AppHeaderProps {
  collapsed: boolean;
}

export default function AppHeader({ collapsed }: AppHeaderProps) {
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const handleMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case "logout":
        authApi.logout();
        break;
      case "profile":
        navigate("/profile");
        break;
      default:
        break;
    }
  };

  return (
    <Header
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        left: collapsed ? 80 : 240,
        zIndex: 999,
        background: "#fff",
        padding: "0 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #f0f0f0",
        boxShadow: "0 1px 4px rgba(0,21,41,.08)",
        transition: "all 0.2s",
      }}
    >
      {/* Page Title */}
      <Text strong style={{ fontSize: 18 }}>
        Quản lý quán cà phê
      </Text>

      {/* Right Section */}
      <Space size="large">
        {/* Notifications */}
        <Badge count={0} showZero={false}>
          <BellOutlined
            style={{
              fontSize: 18,
              cursor: "pointer",
              color: "#666",
            }}
          />
        </Badge>

        {/* User Menu */}
        <Dropdown
          menu={{
            items: userMenuItems,
            onClick: handleMenuClick,
          }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <div
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: "4px 12px",
              borderRadius: 8,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f5f5f5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <Avatar
              icon={<UserOutlined />}
              style={{
                backgroundColor: "#667eea",
                cursor: "pointer",
              }}
              size="default"
            />
            <Space direction="vertical" size={0} style={{ marginLeft: 12 }}>
              <Text strong style={{ fontSize: 14 }}>
                {user.username || "User"}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {user.userType === "admin" ? "Quản lý" : "Nhân viên"}
              </Text>
            </Space>
          </div>
        </Dropdown>
      </Space>
    </Header>
  );
}
