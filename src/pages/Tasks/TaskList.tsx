import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Typography,
  Card,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import type { Task } from "../../types";
import axiosInstance from "../../api/axios";

const { Title } = Typography;

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [duplicateModalVisible, setDuplicateModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [shiftTypes, setShiftTypes] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<number>();
  const [selectedShiftType, setSelectedShiftType] = useState<number>();
  const [form] = Form.useForm();
  const [duplicateForm] = Form.useForm();

  useEffect(() => {
    loadRoles();
    loadShiftTypes();
    loadTasks();
  }, [selectedRole, selectedShiftType]);

  const loadRoles = async () => {
    try {
      const response = await axiosInstance.get("/roles");
      setRoles(response.data);
    } catch (error) {
      console.error("Failed to load roles:", error);
    }
  };

  const loadShiftTypes = async () => {
    try {
      const response = await axiosInstance.get("/shift-types");
      setShiftTypes(response.data);
    } catch (error) {
      console.error("Failed to load shift types:", error);
    }
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/tasks", {
        params: {
          roleId: selectedRole,
          shiftTypeId: selectedShiftType,
        },
      });
      setTasks(response.data);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingTask) {
        await axiosInstance.put(`/tasks/${editingTask.id}`, values);
        message.success("Cập nhật công việc thành công");
      } else {
        await axiosInstance.post("/tasks", values);
        message.success("Tạo công việc thành công");
      }
      setModalVisible(false);
      setEditingTask(null);
      form.resetFields();
      loadTasks();
    } catch (error) {
      console.error("Failed to save task:", error);
    }
  };

  const handleDuplicate = async (values: any) => {
    try {
      await axiosInstance.post("/tasks/duplicate", values);
      message.success("Sao chép công việc thành công");
      setDuplicateModalVisible(false);
      duplicateForm.resetFields();
      loadTasks();
    } catch (error) {
      console.error("Failed to duplicate tasks:", error);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    form.setFieldsValue({
      roleId: task.roleId || undefined,
      shiftTypeId: task.shiftTypeId,
      description: task.description,
      isMandatory: task.isMandatory,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await axiosInstance.delete(`/tasks/${id}`);
      message.success("Xóa công việc thành công");
      loadTasks();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      width: 120,
      render: (role: any) => (
        <Tag color={role ? "blue" : "default"}>{role?.name || "Chung"}</Tag>
      ),
    },
    {
      title: "Loại ca",
      dataIndex: "shiftType",
      width: 120,
      render: (shiftType: any) => <Tag color="green">{shiftType?.name}</Tag>,
    },
    {
      title: "Mô tả công việc",
      dataIndex: "description",
      ellipsis: true,
    },
    {
      title: "Bắt buộc",
      dataIndex: "isMandatory",
      width: 100,
      render: (mandatory: boolean) => (
        <Tag color={mandatory ? "red" : "default"}>
          {mandatory ? "Bắt buộc" : "Tùy chọn"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      width: 150,
      render: (_: any, record: Task) => (
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
            title="Xác nhận xóa công việc?"
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
          Quản lý công việc
        </Title>
        <Space>
          <Button
            icon={<CopyOutlined />}
            onClick={() => setDuplicateModalVisible(true)}
          >
            Sao chép
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingTask(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            Thêm công việc
          </Button>
        </Space>
      </div>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Select
            placeholder="Lọc theo vai trò"
            style={{ width: 200 }}
            value={selectedRole}
            onChange={setSelectedRole}
            allowClear
          >
            <Select.Option value={0}>Công việc chung</Select.Option>
            {roles.map((role) => (
              <Select.Option key={role.id} value={role.id}>
                {role.name}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Lọc theo loại ca"
            style={{ width: 200 }}
            value={selectedShiftType}
            onChange={setSelectedShiftType}
            allowClear
          >
            {shiftTypes.map((type) => (
              <Select.Option key={type.id} value={type.id}>
                {type.name}
              </Select.Option>
            ))}
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={tasks}
          loading={loading}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingTask ? "Cập nhật công việc" : "Thêm công việc"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingTask(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editingTask ? "Cập nhật" : "Tạo"}
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="roleId"
            label="Vai trò"
            tooltip="Để trống nếu là công việc chung cho tất cả vai trò"
          >
            <Select
              placeholder="Chọn vai trò (hoặc để trống cho công việc chung)"
              allowClear
            >
              {roles.map((role) => (
                <Select.Option key={role.id} value={role.id}>
                  {role.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="shiftTypeId"
            label="Loại ca"
            rules={[{ required: true, message: "Vui lòng chọn loại ca" }]}
          >
            <Select placeholder="Chọn loại ca">
              {shiftTypes.map((type) => (
                <Select.Option key={type.id} value={type.id}>
                  {type.name} ({type.startTime} - {type.endTime})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả công việc"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Ví dụ: Dọn dẹp bàn ghế, kiểm tra thiết bị..."
            />
          </Form.Item>
          <Form.Item
            name="isMandatory"
            label="Bắt buộc"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Bắt buộc" unCheckedChildren="Tùy chọn" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Duplicate Modal */}
      <Modal
        title="Sao chép công việc"
        open={duplicateModalVisible}
        onCancel={() => setDuplicateModalVisible(false)}
        onOk={() => duplicateForm.submit()}
        okText="Sao chép"
        cancelText="Hủy"
      >
        <Form form={duplicateForm} layout="vertical" onFinish={handleDuplicate}>
          <Form.Item
            name="fromShiftTypeId"
            label="Từ loại ca"
            rules={[{ required: true, message: "Vui lòng chọn loại ca nguồn" }]}
          >
            <Select placeholder="Chọn loại ca nguồn">
              {shiftTypes.map((type) => (
                <Select.Option key={type.id} value={type.id}>
                  {type.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="toShiftTypeId"
            label="Sang loại ca"
            rules={[{ required: true, message: "Vui lòng chọn loại ca đích" }]}
          >
            <Select placeholder="Chọn loại ca đích">
              {shiftTypes.map((type) => (
                <Select.Option key={type.id} value={type.id}>
                  {type.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
