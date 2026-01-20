import { useEffect, useState } from "react";
import {
  Table,
  Typography,
  Card,
  Tag,
  Space,
  Select,
  DatePicker,
  Modal,
  Form,
  Rate,
  Input,
  message,
  Image,
  Button,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  StarOutlined,
} from "@ant-design/icons";
import type { ChecklistCompletion } from "../../types";
import dayjs from "dayjs";
import axiosInstance from "../../api/axios";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function ChecklistReview() {
  const [completions, setCompletions] = useState<ChecklistCompletion[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [dateRange, setDateRange] = useState<any>([
    dayjs().startOf("week"),
    dayjs().endOf("week"),
  ]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<number>();
  const [selectedStatus, setSelectedStatus] = useState<string>();
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedCompletion, setSelectedCompletion] =
    useState<ChecklistCompletion | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadEmployees();
    loadCompletions();
  }, [pagination.current, dateRange, selectedEmployee, selectedStatus]);

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

  const loadCompletions = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/checklist-completions", {
        params: {
          startDate: dateRange?.[0]?.format("YYYY-MM-DD"),
          endDate: dateRange?.[1]?.format("YYYY-MM-DD"),
          employeeId: selectedEmployee,
          status: selectedStatus,
          page: pagination.current,
          limit: pagination.pageSize,
        },
      });

      setCompletions(response.data || []);
      setPagination({
        ...pagination,
        total: response.pagination?.total || 0,
      });
    } catch (error) {
      console.error("Failed to load completions:", error);
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (completion: ChecklistCompletion) => {
    setSelectedCompletion(completion);
    form.setFieldsValue({
      managerRating: completion.managerRating || 5,
      managerNotes: completion.managerNotes,
    });
    setReviewModalVisible(true);
  };

  const handleReview = async (values: any) => {
    if (!selectedCompletion) return;
    try {
      await axiosInstance.post(
        `/checklist-completions/${selectedCompletion.id}/review`,
        values
      );
      message.success("Đánh giá thành công");
      setReviewModalVisible(false);
      form.resetFields();
      loadCompletions();
    } catch (error) {
      console.error("Failed to review:", error);
    }
  };

  const statusConfig: any = {
    in_progress: {
      color: "default",
      icon: <SyncOutlined spin />,
      label: "Đang làm",
    },
    completed: {
      color: "success",
      icon: <CheckCircleOutlined />,
      label: "Hoàn thành",
    },
    redo: { color: "warning", icon: <SyncOutlined />, label: "Làm lại" },
    unable: {
      color: "error",
      icon: <CloseCircleOutlined />,
      label: "Không làm được",
    },
  };

  const columns = [
    {
      title: "Nhân viên",
      width: 150,
      render: (_: any, record: ChecklistCompletion) =>
        record.shiftRegistration?.employee?.fullName,
    },
    {
      title: "Ngày",
      width: 120,
      render: (_: any, record: ChecklistCompletion) =>
        dayjs(record.shiftRegistration?.shift?.date).format("DD/MM/YYYY"),
    },
    {
      title: "Ca",
      width: 100,
      render: (_: any, record: ChecklistCompletion) => (
        <Tag color="blue">
          {record.shiftRegistration?.shift?.shiftType?.name}
        </Tag>
      ),
    },
    {
      title: "Công việc",
      dataIndex: "task",
      ellipsis: true,
      render: (task: any) => (
        <Space direction="vertical" size={0}>
          <Text>{task?.description}</Text>
          {task?.isMandatory && (
            <Tag color="red" style={{ fontSize: 10 }}>
              Bắt buộc
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 120,
      render: (status: string) => {
        const config = statusConfig[status] || statusConfig.in_progress;
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: "Thời gian hoàn thành",
      dataIndex: "completionTime",
      width: 150,
      render: (time: string) =>
        time ? dayjs(time).format("DD/MM/YYYY HH:mm") : "-",
    },
    {
      title: "Ảnh",
      dataIndex: "completionImageUrl",
      width: 80,
      render: (url: string) =>
        url ? (
          <Image
            src={url}
            width={50}
            height={50}
            style={{ objectFit: "cover" }}
          />
        ) : (
          "-"
        ),
    },
    {
      title: "Đánh giá",
      dataIndex: "managerRating",
      width: 120,
      render: (rating: number) =>
        rating ? (
          <Space>
            <Rate
              disabled
              value={rating / 2}
              count={5}
              style={{ fontSize: 14 }}
            />
            <Text type="secondary">({rating}/10)</Text>
          </Space>
        ) : (
          <Text type="secondary">Chưa đánh giá</Text>
        ),
    },
    {
      title: "Hành động",
      width: 100,
      render: (_: any, record: ChecklistCompletion) =>
        record.status === "completed" && (
          <Button
            type="link"
            icon={<StarOutlined />}
            size="small"
            onClick={() => openReviewModal(record)}
          >
            {record.managerRating ? "Sửa đánh giá" : "Đánh giá"}
          </Button>
        ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Title level={2} style={{ margin: 0 }}>
        Đánh giá công việc
      </Title>

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
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
          <Select
            placeholder="Lọc theo trạng thái"
            style={{ width: 150 }}
            value={selectedStatus}
            onChange={setSelectedStatus}
            allowClear
          >
            <Select.Option value="in_progress">Đang làm</Select.Option>
            <Select.Option value="completed">Hoàn thành</Select.Option>
            <Select.Option value="redo">Làm lại</Select.Option>
            <Select.Option value="unable">Không làm được</Select.Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={completions}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            onChange: (page) => setPagination({ ...pagination, current: page }),
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* Review Modal */}
      <Modal
        title="Đánh giá công việc"
        open={reviewModalVisible}
        onCancel={() => {
          setReviewModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Lưu đánh giá"
        cancelText="Hủy"
        width={600}
      >
        {selectedCompletion && (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Card size="small" title="Thông tin công việc">
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text>
                  <strong>Nhân viên:</strong>{" "}
                  {selectedCompletion.shiftRegistration?.employee?.fullName}
                </Text>
                <Text>
                  <strong>Công việc:</strong>{" "}
                  {selectedCompletion.task?.description}
                </Text>
                <Text>
                  <strong>Ghi chú nhân viên:</strong>{" "}
                  {selectedCompletion.notes || "Không có"}
                </Text>
                {selectedCompletion.completionImageUrl && (
                  <div>
                    <Text strong>Ảnh chứng minh:</Text>
                    <br />
                    <Image
                      src={selectedCompletion.completionImageUrl}
                      width={200}
                      style={{ marginTop: 8 }}
                    />
                  </div>
                )}
              </Space>
            </Card>

            <Form form={form} layout="vertical" onFinish={handleReview}>
              <Form.Item
                name="managerRating"
                label="Điểm đánh giá (1-10)"
                rules={[{ required: true, message: "Vui lòng chọn điểm" }]}
              >
                <Rate count={10} allowHalf />
              </Form.Item>
              <Form.Item name="managerNotes" label="Ghi chú đánh giá">
                <Input.TextArea
                  rows={4}
                  placeholder="Nhận xét về chất lượng công việc..."
                />
              </Form.Item>
            </Form>
          </Space>
        )}
      </Modal>
    </Space>
  );
}
