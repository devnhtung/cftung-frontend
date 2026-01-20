import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Typography,
  Card,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { Role } from "../../types";
import axiosInstance from "../../api/axios";

const { Title } = Typography;

export default function RoleList() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/roles");
      setRoles(response.data);
    } catch (error) {
      console.error("Failed to load roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingRole) {
        await axiosInstance.put(`/roles/${editingRole.id}`, values);
        message.success("Cập nhật vai trò thành công");
      } else {
        await axiosInstance.post("/roles", values);
        message.success("Tạo vai trò thành công");
      }
      setModalVisible(false);
      setEditingRole(null);
      form.resetFields();
      loadRoles();
    } catch (error) {
      console.error("Failed to save role:", error);
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    form.setFieldsValue(role);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await axiosInstance.delete(`/roles/${id}`);
      message.success("Xóa vai trò thành công");
      loadRoles();
    } catch (error) {
      console.error("Failed to delete role:", error);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
    },
    {
      title: "Tên vai trò",
      dataIndex: "name",
      width: 150,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      ellipsis: true,
    },
    {
      title: "Lương cơ bản/giờ",
      dataIndex: "baseHourlySalary",
      width: 150,
      render: (val: number) => `${val.toLocaleString()}đ`,
    },
    {
      title: "Số nhân viên",
      width: 120,
      render: (_: any, record: any) => (
        <Space>
          <TeamOutlined />
          {record.employeeCount || 0}
        </Space>
      ),
    },
    {
      title: "Hành động",
      width: 150,
      render: (_: any, record: Role) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa vai trò?"
            description="Không thể xóa nếu còn nhân viên"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
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
          Quản lý vai trò
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingRole(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Thêm vai trò
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={roles}
          loading={loading}
          rowKey="id"
          pagination={false}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingRole ? "Cập nhật vai trò" : "Thêm vai trò"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingRole(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editingRole ? "Cập nhật" : "Tạo"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên vai trò"
            rules={[{ required: true, message: "Vui lòng nhập tên vai trò" }]}
          >
            <Input placeholder="Ví dụ: Phục vụ, Pha chế..." />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả chi tiết vai trò..." />
          </Form.Item>
          <Form.Item
            name="baseHourlySalary"
            label="Lương cơ bản/giờ (VNĐ)"
            rules={[
              { required: true, message: "Vui lòng nhập lương cơ bản" },
              { type: "number", min: 0, message: "Lương phải lớn hơn 0" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
