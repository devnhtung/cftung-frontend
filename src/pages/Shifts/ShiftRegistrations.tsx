import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Typography,
  Card,
  Tag,
  message,
  Tabs,
  Badge,
} from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { shiftRegistrationApi } from "../../api/shiftRegistration.api";
import type { ShiftRegistration } from "../../types";
import dayjs from "dayjs";

const { Title } = Typography;

export default function ShiftRegistrations() {
  const [registrations, setRegistrations] = useState<ShiftRegistration[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const format = (time?: string) => {
    if (!time) return "--";
    const [h, m] = time.split(":");
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`.slice(0, 5);
  };
  const [activeTab, setActiveTab] = useState("pending");
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    loadStats();
    loadRegistrations();
  }, [pagination.current, activeTab]);

  const loadStats = async () => {
    try {
      const response = await shiftRegistrationApi.getStats();
      setStats(response.data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const response = await shiftRegistrationApi.getAll({
        status: activeTab as any,
        page: pagination.current,
        limit: pagination.pageSize,
      });

      setRegistrations(response.data || []);
      setPagination({
        ...pagination,
        total: response.pagination?.total || 0,
      });
    } catch (error) {
      console.error("Failed to load registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await shiftRegistrationApi.approve(id);
      message.success("Duyệt đăng ký thành công");
      loadStats();
      loadRegistrations();
    } catch (error) {
      console.error("Failed to approve:", error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await shiftRegistrationApi.reject(id);
      message.success("Từ chối đăng ký thành công");
      loadStats();
      loadRegistrations();
    } catch (error) {
      console.error("Failed to reject:", error);
    }
  };

  const columns = [
    {
      title: "Nhân viên",
      dataIndex: "employee",
      width: 150,
      render: (employee: any) => employee?.fullName,
    },
    {
      title: "Vai trò",
      width: 120,
      render: (_: any, record: ShiftRegistration) =>
        record.employee?.role?.name || "-",
    },
    {
      title: "Ngày làm",
      width: 120,
      render: (_: any, record: ShiftRegistration) =>
        dayjs(record.shift?.date).format("DD/MM/YYYY"),
    },
    {
      title: "Ca",
      width: 120,
      render: (_: any, record: ShiftRegistration) => (
        <Tag color="blue">{record.shift?.shiftType?.name}</Tag>
      ),
    },
    {
      title: "Thời gian",
      width: 150,
      render: (_: any, record: ShiftRegistration) => {
        const start = record.shift?.shiftType?.startTime; // ví dụ: "1970-01-01T08:00:00.000Z"
        const end = record.shift?.shiftType?.endTime;

        const format = (iso?: string) => {
          if (!iso) return "--";
          // Lấy phần sau 'T' và trước '.' hoặc 'Z'
          const timePart = iso.split("T")[1]?.split(/[Z.]/)[0] || "";
          return timePart.slice(0, 5); // "08:00"
        };

        return (
          <span>
            {format(start)} – {format(end)}
          </span>
        );
      },
    },
    {
      title: "Ngày đăng ký",
      dataIndex: "registrationDate",
      width: 150,
      render: (date: string) => dayjs(date).format("HH:mm-DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 120,
      render: (status: string) => {
        const colors: any = {
          pending: "warning",
          approved: "success",
          rejected: "error",
        };
        const labels: any = {
          pending: "Chờ duyệt",
          approved: "Đã duyệt",
          rejected: "Từ chối",
        };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      },
    },
    {
      title: "Hành động",
      width: 150,
      render: (_: any, record: ShiftRegistration) =>
        record.status === "pending" ? (
          <Space size="small">
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleApprove(record.id)}
            >
              Duyệt
            </Button>
            <Button
              danger
              size="small"
              icon={<CloseOutlined />}
              onClick={() => handleReject(record.id)}
            >
              Từ chối
            </Button>
          </Space>
        ) : (
          <span>-</span>
        ),
    },
  ];

  const tabItems = [
    {
      key: "pending",
      label: (
        <Badge count={stats.pending} offset={[10, 0]}>
          <span>Chờ duyệt</span>
        </Badge>
      ),
    },
    {
      key: "approved",
      label: (
        <Badge count={stats.approved} offset={[10, 0]} color="green">
          <span>Đã duyệt</span>
        </Badge>
      ),
    },
    {
      key: "rejected",
      label: (
        <Badge count={stats.rejected} offset={[10, 0]} color="red">
          <span>Từ chối</span>
        </Badge>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Title level={2} style={{ margin: 0 }}>
        Duyệt đăng ký ca
      </Title>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

        <Table
          columns={columns}
          dataSource={registrations}
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
