import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Typography,
  Card,
  DatePicker,
  Select,
  Modal,
  Form,
  Input,
  message,
  Tag,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  CalendarOutlined,
  DeleteOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { shiftApi } from "../../api/shift.api";
import type { Shift } from "../../types";
import dayjs from "dayjs";
import axiosInstance from "../../api/axios";

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function ShiftList() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [dateRange, setDateRange] = useState<any>([
    dayjs(),
    dayjs().add(7, "day"),
  ]);
  const [shiftTypes, setShiftTypes] = useState<any[]>([]);
  const [selectedShiftType, setSelectedShiftType] = useState<number>();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [bulkForm] = Form.useForm();

  useEffect(() => {
    loadShiftTypes();
    loadShifts();
  }, [pagination.current, dateRange, selectedShiftType]);

  const loadShiftTypes = async () => {
    try {
      const response = await axiosInstance.get("/shift-types");
      setShiftTypes(response.data);
    } catch (error) {
      console.error("Failed to load shift types:", error);
    }
  };

  const loadShifts = async () => {
    setLoading(true);
    try {
      const response = await shiftApi.getAll({
        startDate: dateRange?.[0]?.format("YYYY-MM-DD"),
        endDate: dateRange?.[1]?.format("YYYY-MM-DD"),
        shiftTypeId: selectedShiftType,
        page: pagination.current,
        limit: pagination.pageSize,
      });

      setShifts(response.data || []);
      setPagination({
        ...pagination,
        total: response.pagination?.total || 0,
      });
    } catch (error) {
      console.error("Failed to load shifts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: any) => {
    try {
      await shiftApi.create({
        date: values.date.format("YYYY-MM-DD"),
        shiftTypeId: values.shiftTypeId,
        notes: values.notes,
      });
      message.success("Tạo ca làm việc thành công");
      setCreateModalVisible(false);
      form.resetFields();
      loadShifts();
    } catch (error) {
      console.error("Failed to create shift:", error);
    }
  };

  const handleBulkCreate = async (values: any) => {
    try {
      await shiftApi.createBulk({
        startDate: values.dateRange[0].format("YYYY-MM-DD"),
        endDate: values.dateRange[1].format("YYYY-MM-DD"),
        shiftTypeIds: values.shiftTypeIds,
      });
      message.success("Tạo ca hàng loạt thành công");
      setBulkModalVisible(false);
      bulkForm.resetFields();
      loadShifts();
    } catch (error) {
      console.error("Failed to create bulk shifts:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await shiftApi.delete(id);
      message.success("Xóa ca làm việc thành công");
      loadShifts();
    } catch (error) {
      console.error("Failed to delete shift:", error);
    }
  };

  const columns = [
    {
      title: "Ngày",
      dataIndex: "date",
      width: 120,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Thứ",
      dataIndex: "date",
      width: 100,
      render: (date: string) => {
        const weekday = dayjs(date).format("dddd");
        return weekday;
      },
    },
    {
      title: "Loại ca",
      dataIndex: "shiftType",
      width: 120,
      render: (shiftType: any) => <Tag color="blue">{shiftType?.name}</Tag>,
    },
    {
      title: "Thời gian",
      width: 150,
      render: (_: any, record: Shift) => (
        <span>
          {record.shiftType?.startTime} - {record.shiftType?.endTime}
        </span>
      ),
    },
    {
      title: "Đăng ký",
      dataIndex: "registrations",
      width: 100,
      render: (registrations: any[]) => (
        <Space>
          <TeamOutlined />
          <span>{registrations?.length || 0}</span>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      width: 120,
      render: (_: any, record: Shift) => {
        const approved =
          record.registrations?.filter((r) => r.status === "approved").length ||
          0;
        const pending =
          record.registrations?.filter((r) => r.status === "pending").length ||
          0;

        return (
          <Space>
            {approved > 0 && <Tag color="success">{approved} đã duyệt</Tag>}
            {pending > 0 && <Tag color="warning">{pending} chờ</Tag>}
          </Space>
        );
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Hành động",
      width: 100,
      render: (_: any, record: Shift) => (
        <Popconfirm
          title="Xác nhận xóa ca làm việc?"
          onConfirm={() => handleDelete(record.id)}
        >
          <Button type="link" danger icon={<DeleteOutlined />} size="small">
            Xóa
          </Button>
        </Popconfirm>
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
          Quản lý ca làm việc
        </Title>
        <Space>
          <Button
            icon={<CalendarOutlined />}
            onClick={() => setBulkModalVisible(true)}
          >
            Tạo hàng loạt
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Tạo ca đơn
          </Button>
        </Space>
      </div>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            format="DD/MM/YYYY"
          />
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
          dataSource={shifts}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            onChange: (page) => setPagination({ ...pagination, current: page }),
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Create Single Shift Modal */}
      <Modal
        title="Tạo ca làm việc"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onOk={() => form.submit()}
        okText="Tạo"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="date"
            label="Ngày"
            rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
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
          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Bulk Create Modal */}
      <Modal
        title="Tạo ca hàng loạt"
        open={bulkModalVisible}
        onCancel={() => setBulkModalVisible(false)}
        onOk={() => bulkForm.submit()}
        okText="Tạo"
        cancelText="Hủy"
        width={600}
      >
        <Form form={bulkForm} layout="vertical" onFinish={handleBulkCreate}>
          <Form.Item
            name="dateRange"
            label="Khoảng thời gian"
            rules={[
              { required: true, message: "Vui lòng chọn khoảng thời gian" },
            ]}
          >
            <RangePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item
            name="shiftTypeIds"
            label="Loại ca"
            rules={[
              { required: true, message: "Vui lòng chọn ít nhất 1 loại ca" },
            ]}
          >
            <Select mode="multiple" placeholder="Chọn loại ca">
              {shiftTypes.map((type) => (
                <Select.Option key={type.id} value={type.id}>
                  {type.name} ({type.startTime} - {type.endTime})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
