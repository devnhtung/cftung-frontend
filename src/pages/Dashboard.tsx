import { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Typography, Space } from "antd";
import {
  TeamOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import axiosInstance from "../api/axios";

const { Title } = Typography;

export default function Dashboard() {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [employeeStats, attendanceStats, salaryStats] = await Promise.all([
        axiosInstance.get("/employees/stats"),
        axiosInstance.get("/attendances/stats"),
        axiosInstance.get("/salaries/stats"),
      ]);

      setStats({
        employees: employeeStats.data,
        attendance: attendanceStats.data,
        salary: salaryStats.data,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Title level={2}>Dashboard</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng nhân viên"
              value={stats.employees?.total || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
              Đang hoạt động: {stats.employees?.active || 0}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Ca đã hoàn thành"
              value={stats.attendance?.completedShifts || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
              Đang làm: {stats.attendance?.inProgressShifts || 0}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng giờ làm"
              value={stats.attendance?.totalHours || 0}
              suffix="giờ"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng lương tháng"
              value={(stats.salary?.totalFinalSalary || 0) / 1000000}
              suffix="triệu"
              prefix={<DollarOutlined />}
              precision={1}
              valueStyle={{ color: "#fa8c16" }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
              Đã trả: {stats.salary?.totalPaid || 0}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Nhân viên theo vai trò" loading={loading}>
            {stats.employees?.byRole?.map((item: any) => (
              <div
                key={item.roleId}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <span>{item.roleName}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Thống kê lương" loading={loading}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Lương cơ bản:</span>
                <strong>
                  {((stats.salary?.totalBaseSalary || 0) / 1000000).toFixed(1)}M
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#52c41a" }}>
                  <ArrowUpOutlined /> Thưởng:
                </span>
                <strong style={{ color: "#52c41a" }}>
                  {((stats.salary?.totalBonus || 0) / 1000000).toFixed(1)}M
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#ff4d4f" }}>
                  <ArrowDownOutlined /> Phạt:
                </span>
                <strong style={{ color: "#ff4d4f" }}>
                  {((stats.salary?.totalPenalty || 0) / 1000000).toFixed(1)}M
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#faad14" }}>
                  <ArrowDownOutlined /> Ứng lương:
                </span>
                <strong style={{ color: "#faad14" }}>
                  {((stats.salary?.totalAdvances || 0) / 1000000).toFixed(1)}M
                </strong>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
