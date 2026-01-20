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
  TimePicker,
  message,
  Popconfirm,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import type { ShiftType } from "../../types";
import dayjs from "dayjs";
import axiosInstance from "../../api/axios";

const { Title } = Typography;

export default function ShiftTypeList() {
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingType, setEditingType] = useState<ShiftType | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadShiftTypes();
  }, []);

  const loadShiftTypes = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/shift-types");
      setShiftTypes(response.data);
    } catch (error) {
      console.error("Failed to load shift types:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        name: values.name,
        startTime: values.time[0].format("HH:mm:ss"),
        endTime: values.time[1].format("HH:mm:ss"),
      };
      console.log(data);
      if (editingType) {
        await axiosInstance.put(`/shift-types/${editingType.id}`, data);
        message.success("Cập nhật loại ca thành công");
      } else {
        await axiosInstance.post("/shift-types", data);
        message.success("Tạo loại ca thành công");
      }
      setModalVisible(false);
      setEditingType(null);
      form.resetFields();
      loadShiftTypes();
    } catch (error) {
      console.error("Failed to save shift type:", error);
    }
  };

  const handleEdit = (shiftType: ShiftType) => {
    setEditingType(shiftType);
    form.setFieldsValue({
      name: shiftType.name,
      time: [
        dayjs(shiftType.startTime, "HH:mm:ss"),
        dayjs(shiftType.endTime, "HH:mm:ss"),
      ],
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await axiosInstance.delete(`/shift-types/${id}`);
      message.success("Xóa loại ca thành công");
      loadShiftTypes();
    } catch (error) {
      console.error("Failed to delete shift type:", error);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
    },
    {
      title: "Tên loại ca",
      dataIndex: "name",
      width: 150,
      render: (name: string) => <Tag color="blue">{name}</Tag>,
    },
    {
      title: "Giờ bắt đầu",
      dataIndex: "startTime",
      width: 120,
    },
    {
      title: "Giờ kết thúc",
      dataIndex: "endTime",
      width: 120,
    },
    {
      title: "Thời lượng",
      width: 120,
      render: (_: any, record: ShiftType) => {
        const start = dayjs(record.startTime, "HH:mm:ss");
        const end = dayjs(record.endTime, "HH:mm:ss");
        const duration = end.diff(start, "hour", true);
        return `${duration} giờ`;
      },
    },
    {
      title: "Số ca làm",
      width: 100,
      render: (_: any, record: any) => (
        <Space>
          <CalendarOutlined />
          {record.shiftCount || 0}
        </Space>
      ),
    },
    {
      title: "Số công việc",
      width: 120,
      render: (_: any, record: any) => (
        <Space>{record.taskCount || 0} công việc</Space>
      ),
    },
    {
      title: "Hành động",
      width: 150,
      render: (_: any, record: ShiftType) => (
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
            title="Xác nhận xóa loại ca?"
            description="Không thể xóa nếu còn ca làm việc"
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
          Quản lý loại ca
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingType(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Thêm loại ca
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={shiftTypes}
          loading={loading}
          rowKey="id"
          pagination={false}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingType ? "Cập nhật loại ca" : "Thêm loại ca"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingType(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editingType ? "Cập nhật" : "Tạo"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên loại ca"
            rules={[{ required: true, message: "Vui lòng nhập tên loại ca" }]}
          >
            <Input placeholder="Ví dụ: Ca sáng, Ca chiều..." />
          </Form.Item>
          <Form.Item
            name="time"
            label="Thời gian ca"
            rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
          >
            <TimePicker.RangePicker
              style={{ width: "100%" }}
              format="HH:mm"
              placeholder={["Giờ bắt đầu", "Giờ kết thúc"]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
