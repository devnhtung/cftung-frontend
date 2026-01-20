import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  DatePicker,
  Space,
  Select,
  Statistic,
  Table,
  Progress,
} from "antd";
import {
  BarChartOutlined,
  TrophyOutlined,
  TeamOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axiosInstance from "../../api/axios";

const { Title, Text } = Typography;

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<any>([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);
  const [employeeStats, setEmployeeStats] = useState<any[]>([]);
  const [summaryStats, setSummaryStats] = useState<any>({});

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const startDate = dateRange?.[0]?.format("YYYY-MM-DD");
      const endDate = dateRange?.[1]?.format("YYYY-MM-DD");

      // Load tổng hợp stats
      const [attendanceStats, checklistStats, salaryStats, employees] =
        await Promise.all([
          axiosInstance.get("/attendances/stats", {
            params: { startDate, endDate },
          }),
          axiosInstance.get("/checklist-completions/stats", {
            params: { startDate, endDate },
          }),
          axiosInstance.get("/salaries/stats", {
            params: {
              month: dateRange?.[0]?.month() + 1,
              year: dateRange?.[0]?.year(),
            },
          }),
          axiosInstance.get("/employees", {
            params: { limit: 100, active: true },
          }),
        ]);

      setSummaryStats({
        attendance: attendanceStats.data,
        checklist: checklistStats.data,
        salary: salaryStats.data,
      });

      // Load stats từng nhân viên
      const employeeData = await Promise.all(
        (employees.data || []).slice(0, 10).map(async (emp: any) => {
          const [attendance, performance] = await Promise.all([
            axiosInstance.get("/attendances/stats", {
              params: { employeeId: emp.id, startDate, endDate },
            }),
            axiosInstance.get("/checklist-completions/performance", {
              params: { employeeId: emp.id, startDate, endDate },
            }),
          ]);

          return {
            id: emp.id,
            name: emp.fullName,
            role: emp.role?.name,
            totalShifts: attendance.data.completedShifts || 0,
            totalHours: attendance.data.totalHours || 0,
            completionRate: performance.data.completionRate || 0,
            averageRating: performance.data.averageRating || 0,
          };
        })
      );

      setEmployeeStats(employeeData);
    } catch (error) {
      console.error("Failed to load reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const employeeColumns = [
    {
      title: "Xếp hạng",
      width: 80,
      render: (_: any, __: any, index: number) => (
        <Space>
          {index < 3 && (
            <TrophyOutlined
              style={{ color: ["#FFD700", "#C0C0C0", "#CD7F32"][index] }}
            />
          )}
          <Text strong>#{index + 1}</Text>
        </Space>
      ),
    },
    {
      title: "Nhân viên",
      dataIndex: "name",
      width: 150,
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      width: 120,
    },
    {
      title: "Số ca",
      dataIndex: "totalShifts",
      width: 100,
      sorter: (a: any, b: any) => a.totalShifts - b.totalShifts,
    },
    {
      title: "Tổng giờ",
      dataIndex: "totalHours",
      width: 100,
      render: (hours: number) => `${hours.toFixed(1)}h`,
      sorter: (a: any, b: any) => a.totalHours - b.totalHours,
    },
    {
      title: "Hoàn thành công việc",
      dataIndex: "completionRate",
      width: 180,
      render: (rate: number) => (
        <Progress
          percent={rate}
          size="small"
          status={rate >= 90 ? "success" : rate >= 70 ? "normal" : "exception"}
        />
      ),
      sorter: (a: any, b: any) => a.completionRate - b.completionRate,
    },
    {
      title: "Đánh giá TB",
      dataIndex: "averageRating",
      width: 120,
      render: (rating: number) => (
        <Space>
          <Text
            strong
            style={{
              color:
                rating >= 8 ? "#52c41a" : rating >= 6 ? "#faad14" : "#ff4d4f",
            }}
          >
            {rating ? rating.toFixed(1) : "-"}
          </Text>
          <Text type="secondary">/10</Text>
        </Space>
      ),
      sorter: (a: any, b: any) => a.averageRating - b.averageRating,
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Báo cáo tổng hợp
        </Title>
        <DatePicker.RangePicker
          value={dateRange}
          onChange={setDateRange}
          format="DD/MM/YYYY"
          presets={[
            {
              label: "Tuần này",
              value: [dayjs().startOf("week"), dayjs().endOf("week")],
            },
            {
              label: "Tháng này",
              value: [dayjs().startOf("month"), dayjs().endOf("month")],
            },
            {
              label: "Tháng trước",
              value: [
                dayjs().subtract(1, "month").startOf("month"),
                dayjs().subtract(1, "month").endOf("month"),
              ],
            },
          ]}
        />
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng ca hoàn thành"
              value={summaryStats.attendance?.completedShifts || 0}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng giờ làm"
              value={summaryStats.attendance?.totalHours || 0}
              suffix="giờ"
              precision={1}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Tỷ lệ hoàn thành CV"
              value={summaryStats.checklist?.completionRate || 0}
              suffix="%"
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng lương tháng"
              value={(summaryStats.salary?.totalFinalSalary || 0) / 1000000}
              suffix="triệu"
              precision={1}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Employee Performance Table */}
      <Card
        title={
          <Space>
            <TeamOutlined />
            <Text strong>Bảng xếp hạng nhân viên</Text>
          </Space>
        }
      >
        <Table
          columns={employeeColumns}
          dataSource={employeeStats}
          loading={loading}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </Space>
  );
}
