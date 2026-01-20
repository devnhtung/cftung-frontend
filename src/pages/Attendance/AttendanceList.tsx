import { useEffect, useState } from "react";
import { Table, Typography, Card, DatePicker, Space, Tag, Select } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import type { Attendance } from "../../types";
import dayjs from "dayjs";
import axiosInstance from "../../api/axios";

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function AttendanceList() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [dateRange, setDateRange] = useState<any>([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<number>();

  useEffect(() => {
    loadEmployees();
    loadAttendances();
  }, [pagination.current, dateRange, selectedEmployee]);

  const loadEmployees = async () => {
    try {
      const response = await axiosInstance.get("/employees", {
        params: { limit: 100 },
      });
      setEmployees(response.data || []);
    } catch (error) {
      console.error("Failed to load employees:", error);
    }
  };

  const loadAttendances = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/attendances", {
        params: {
          startDate: dateRange?.[0]?.format("YYYY-MM-DD"),
          endDate: dateRange?.[1]?.format("YYYY-MM-DD"),
          employeeId: selectedEmployee,
          page: pagination.current,
          limit: pagination.pageSize,
        },
      });

      setAttendances(response.data || []);
      setPagination({
        ...pagination,
        total: response.pagination?.total || 0,
      });
    } catch (error) {
      console.error("Failed to load attendances:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Nhân viên",
      width: 150,
      render: (_: any, record: Attendance) =>
        record.shiftRegistration?.employee?.fullName,
    },
    {
      title: "Ngày",
      width: 120,
      render: (_: any, record: Attendance) =>
        dayjs(record.shiftRegistration?.shift?.date).format("DD/MM/YYYY"),
    },
    {
      title: "Ca",
      width: 100,
      render: (_: any, record: Attendance) => (
        <Tag color="blue">
          {record.shiftRegistration?.shift?.shiftType?.name}
        </Tag>
      ),
    },
    {
      title: "Check-in",
      dataIndex: "checkInTime",
      width: 150,
      render: (time: string) => (
        <Space>
          <ClockCircleOutlined />
          {time ? dayjs(time).format("HH:mm:ss") : "-"}
        </Space>
      ),
    },
    {
      title: "Check-out",
      dataIndex: "checkOutTime",
      width: 150,
      render: (time: string) => (
        <Space>
          <ClockCircleOutlined />
          {time ? dayjs(time).format("HH:mm:ss") : "-"}
        </Space>
      ),
    },
    {
      title: "Giờ làm",
      dataIndex: "actualHours",
      width: 100,
      // render: (hours: number) => (
      //   <strong>{hours ? hours.toFixed(2) : "-"} giờ</strong>
      // ),
    },
    {
      title: "GPS",
      dataIndex: "verified",
      width: 100,
      render: (verified: boolean) => (
        <Tag
          color={verified ? "success" : "error"}
          icon={verified ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        >
          {verified ? "Hợp lệ" : "Không hợp lệ"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      width: 120,
      render: (_: any, record: Attendance) => {
        if (record.checkOutTime) {
          return <Tag color="success">Hoàn thành</Tag>;
        } else if (record.checkInTime) {
          return <Tag color="processing">Đang làm</Tag>;
        }
        return <Tag>Chưa check-in</Tag>;
      },
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Title level={2} style={{ margin: 0 }}>
        Lịch sử chấm công
      </Title>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            format="DD/MM/YYYY"
          />
          <Select
            placeholder="Lọc theo nhân viên"
            style={{ width: 200 }}
            value={selectedEmployee}
            onChange={setSelectedEmployee}
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {employees.map((emp) => (
              <Select.Option key={emp.id} value={emp.id}>
                {emp.fullName}
              </Select.Option>
            ))}
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={attendances}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            onChange: (page) => setPagination({ ...pagination, current: page }),
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </Space>
  );
}
