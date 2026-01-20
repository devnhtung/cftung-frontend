// src/pages/Employees/EmployeeList.tsx

import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Tag,
  Typography,
  Modal,
  message,
  Card,
  Select,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { employeeApi } from "../../api/employee.api";
import type { Employee } from "../../types";
import dayjs from "dayjs";
import axiosInstance from "../../api/axios";

const { Title } = Typography;

export default function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [search, setSearch] = useState("");
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<number>();

  useEffect(() => {
    loadRoles();
    loadEmployees();
  }, [pagination.current, search, selectedRole]);

  const loadRoles = async () => {
    try {
      const response = await axiosInstance.get("/roles");
      setRoles(response.data);
    } catch (error) {
      console.error("Failed to load roles:", error);
    }
  };

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const response = await employeeApi.getAll({
        page: pagination.current,
        limit: pagination.pageSize,
        search,
        roleId: selectedRole,
      });
      setEmployees(response.data || []);
      console.log(response.data);
      setPagination({
        ...pagination,
        total: response.pagination?.total || 0,
      });
    } catch (error) {
      console.error("Failed to load employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await employeeApi.activate(id);
      message.success("Kích hoạt nhân viên thành công");
      loadEmployees();
    } catch (error) {
      console.error("Failed to activate:", error);
    }
  };

  const handleDeactivate = async (id: number) => {
    Modal.confirm({
      title: "Xác nhận vô hiệu hóa nhân viên?",
      content: "Nhân viên sẽ không thể đăng nhập và làm việc.",
      onOk: async () => {
        try {
          await employeeApi.deactivate(id);
          message.success("Vô hiệu hóa nhân viên thành công");
          loadEmployees();
        } catch (error) {
          console.error("Failed to deactivate:", error);
        }
      },
    });
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
      width: 150,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      width: 120,
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      width: 120,
      render: (role: any) => role?.name || "-",
    },
    {
      title: "Hệ số lương",
      dataIndex: "salaryCoefficient",
      width: 100,
      // render: (val: string) => val.toFixed(2),
    },
    {
      title: "Ngày vào làm",
      dataIndex: "joinDate",
      width: 120,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      width: 100,
      render: (active: boolean) => (
        <Tag color={active ? "success" : "error"}>
          {active ? "Hoạt động" : "Ngưng"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      width: 150,
      render: (_: any, record: Employee) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />} size="small">
            Sửa
          </Button>
          {record.active ? (
            <Button
              type="link"
              danger
              icon={<StopOutlined />}
              size="small"
              onClick={() => handleDeactivate(record.id)}
            >
              Ngưng
            </Button>
          ) : (
            <Button
              type="link"
              icon={<CheckCircleOutlined />}
              size="small"
              onClick={() => handleActivate(record.id)}
            >
              Kích hoạt
            </Button>
          )}
        </Space>
      ),
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
          Quản lý nhân viên
        </Title>
        <Button type="primary" icon={<PlusOutlined />}>
          Thêm nhân viên
        </Button>
      </div>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm kiếm theo tên, SĐT, CCCD"
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
          <Select
            placeholder="Lọc theo vai trò"
            style={{ width: 200 }}
            value={selectedRole}
            onChange={setSelectedRole}
            allowClear
          >
            {roles.map((role) => (
              <Select.Option key={role.id} value={role.id}>
                {role.name}
              </Select.Option>
            ))}
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={employees}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            onChange: (page) => setPagination({ ...pagination, current: page }),
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </Space>
  );
}
