import { Layout, Menu, Typography } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { mainMenuItems, getSelectedMenuKey, getOpenKeys } from "./menuConfig";

const { Sider } = Layout;
const { Text } = Typography;

interface AppSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export default function AppSidebar({ collapsed, onCollapse }: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey = getSelectedMenuKey(location.pathname);
  const defaultOpenKeys = getOpenKeys(location.pathname);

  const handleMenuClick = ({ key }: { key: string }) => {
    // Ignore clicks on submenu parents
    if (key.endsWith("-menu")) return;
    navigate(key);
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      theme="light"
      width={240}
      style={{
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        borderRight: "1px solid #f0f0f0",
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid #f0f0f0",
          transition: "all 0.2s",
        }}
      >
        {!collapsed && (
          <Text
            strong
            style={{
              marginLeft: 12,
              fontSize: 16,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Coffee Shop
          </Text>
        )}
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        defaultOpenKeys={defaultOpenKeys}
        items={mainMenuItems}
        onClick={handleMenuClick}
        style={{
          borderRight: 0,
          paddingTop: 8,
        }}
      />
    </Sider>
  );
}
