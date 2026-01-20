import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { UserOutlined, LockOutlined, CoffeeOutlined } from "@ant-design/icons";
import { authApi } from "../api/auth.api";

const { Title, Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const response = await authApi.login(values);
      if (response.success && response.data) {
        const { accessToken, refreshToken, user } = response.data;
        // Save to localStorage
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
        message.success("Đăng nhập thành công!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Card
        style={{
          width: 400,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <CoffeeOutlined style={{ fontSize: 48, color: "#667eea" }} />
          <Title level={2} style={{ marginTop: 16, marginBottom: 8 }}>
            Coffee Shop Manager
          </Title>
          <Text type="secondary">Đăng nhập để tiếp tục</Text>
        </div>

        <Form name="login" onFinish={onFinish} autoComplete="off" size="large">
          <Form.Item
            name="username"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: 40 }}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Admin mặc định: admin / admin123
          </Text>
        </div>
      </Card>
    </div>
  );
}
