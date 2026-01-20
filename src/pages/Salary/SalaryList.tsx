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
  Select,
  InputNumber,
  message,
  Drawer,
  Descriptions,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import type { Salary, SalaryShiftDetail } from "../../types";
import dayjs from "dayjs";
import axiosInstance from "../../api/axios";

const { Title, Text } = Typography;

export default function SalaryList() {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null);
  const [shiftDetails, setShiftDetails] = useState<SalaryShiftDetail[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [generateForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [selectedMonth, setSelectedMonth] = useState<any>(dayjs());

  useEffect(() => {
    loadEmployees();
    loadSalaries();
  }, [pagination.current, selectedMonth]);

  const loadEmployees = async () => {
    try {
      const response = await axiosInstance.get("/employees", {
        params: { limit: 100, active: true },
      });
      setEmployees(response.data || []);
    } catch (error) {
      console.error("Failed to load employees:", error);
    }
  };

  const loadSalaries = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/salaries", {
        params: {
          month: selectedMonth?.month() + 1,
          year: selectedMonth?.year(),
          page: pagination.current,
          limit: pagination.pageSize,
        },
      });

      setSalaries(response.data || []);
      setPagination({
        ...pagination,
        total: response.pagination?.total || 0,
      });
    } catch (error) {
      console.error("Failed to load salaries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (values: any) => {
    try {
      await axiosInstance.post("/salaries/generate", {
        employeeId: values.employeeId,
        month: values.month.month() + 1,
        year: values.month.year(),
      });
      message.success("Tạo bảng lương thành công");
      setGenerateModalVisible(false);
      generateForm.resetFields();
      loadSalaries();
    } catch (error) {
      console.error("Failed to generate salary:", error);
    }
  };

  const handleUpdate = async (values: any) => {
    if (!selectedSalary) return;
    try {
      await axiosInstance.put(`/salaries/${selectedSalary.id}`, values);
      message.success("Cập nhật lương thành công");
      setEditModalVisible(false);
      editForm.resetFields();
      loadSalaries();
    } catch (error) {
      console.error("Failed to update salary:", error);
    }
  };

  const handleMarkPaid = async (id: number) => {
    try {
      await axiosInstance.post(`/salaries/${id}/mark-paid`);
      message.success("Đánh dấu đã thanh toán thành công");
      loadSalaries();
    } catch (error) {
      console.error("Failed to mark as paid:", error);
    }
  };

  const viewDetails = async (salary: Salary) => {
    try {
      const response = await axiosInstance.get(`/salaries/${salary.id}`);
      setSelectedSalary(response.data);
      setShiftDetails(response.data.shiftDetails || []);
      setDetailDrawerVisible(true);
    } catch (error) {
      console.error("Failed to load salary details:", error);
    }
  };

  const openEditModal = (salary: Salary) => {
    setSelectedSalary(salary);
    editForm.setFieldsValue({
      bonus: salary.bonus,
      penalty: salary.penalty,
      notes: salary.notes,
    });
    setEditModalVisible(true);
  };

  const columns = [
    {
      title: "Nhân viên",
      width: 150,
      render: (_: any, record: Salary) => record.employee?.fullName,
    },
    {
      title: "Vai trò",
      width: 120,
      render: (_: any, record: Salary) => record.employee?.role?.name,
    },
    {
      title: "Tháng",
      dataIndex: "monthYear",
      width: 100,
      render: (date: string) => dayjs(date).format("MM/YYYY"),
    },
    {
      title: "Lương cơ bản",
      dataIndex: "baseSalary",
      width: 120,
      render: (val: number) => <Text strong>{val.toLocaleString()}đ</Text>,
    },
    {
      title: "Thưởng",
      dataIndex: "bonus",
      width: 100,
      render: (val: number) => (
        <Text style={{ color: "#52c41a" }}>+{val.toLocaleString()}đ</Text>
      ),
    },
    {
      title: "Phạt",
      dataIndex: "penalty",
      width: 100,
      render: (val: number) => (
        <Text style={{ color: "#ff4d4f" }}>-{val.toLocaleString()}đ</Text>
      ),
    },
    {
      title: "Ứng lương",
      dataIndex: "advancesTotal",
      width: 100,
      render: (val: number) => (
        <Text style={{ color: "#faad14" }}>-{val.toLocaleString()}đ</Text>
      ),
    },
    {
      title: "Tổng lương",
      dataIndex: "finalSalary",
      width: 150,
      render: (val: number) => (
        <Text strong style={{ fontSize: 16, color: "#1890ff" }}>
          {val.toLocaleString()}đ
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 120,
      render: (status: string) => (
        <Tag color={status === "paid" ? "success" : "warning"}>
          {status === "paid" ? "Đã trả" : "Chưa trả"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      width: 200,
      render: (_: any, record: Salary) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => viewDetails(record)}
          >
            Chi tiết
          </Button>
          {record.status === "pending" && (
            <>
              <Button
                type="link"
                icon={<EditOutlined />}
                size="small"
                onClick={() => openEditModal(record)}
              >
                Sửa
              </Button>
              <Button
                type="link"
                icon={<CheckCircleOutlined />}
                size="small"
                onClick={() => handleMarkPaid(record.id)}
              >
                Đã trả
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const shiftDetailColumns = [
    {
      title: "Ngày",
      dataIndex: "shiftDate",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Ca",
      dataIndex: "shiftTypeName",
    },
    {
      title: "Giờ làm",
      dataIndex: "actualHours",
      render: (hours: number) => `${hours} giờ`,
    },
    {
      title: "Lương/giờ",
      dataIndex: "baseHourlySalary",
      render: (val: number) => `${val.toLocaleString()}đ`,
    },
    {
      title: "Hệ số",
      dataIndex: "salaryCoefficient",
    },
    {
      title: "Lương ca",
      dataIndex: "shiftSalary",
      render: (val: number) => <Text strong>{val.toLocaleString()}đ</Text>,
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
          Quản lý lương
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setGenerateModalVisible(true)}
        >
          Tạo bảng lương
        </Button>
      </div>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <DatePicker
            picker="month"
            value={selectedMonth}
            onChange={setSelectedMonth}
            format="MM/YYYY"
          />
        </Space>

        <Table
          columns={columns}
          dataSource={salaries}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            onChange: (page) => setPagination({ ...pagination, current: page }),
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* Generate Modal */}
      <Modal
        title="Tạo bảng lương"
        open={generateModalVisible}
        onCancel={() => setGenerateModalVisible(false)}
        onOk={() => generateForm.submit()}
        okText="Tạo"
        cancelText="Hủy"
      >
        <Form form={generateForm} layout="vertical" onFinish={handleGenerate}>
          <Form.Item
            name="employeeId"
            label="Nhân viên"
            rules={[{ required: true, message: "Vui lòng chọn nhân viên" }]}
          >
            <Select
              placeholder="Chọn nhân viên"
              showSearch
              optionFilterProp="children"
            >
              {employees.map((emp) => (
                <Select.Option key={emp.id} value={emp.id}>
                  {emp.fullName} - {emp.role?.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="month"
            label="Tháng"
            rules={[{ required: true, message: "Vui lòng chọn tháng" }]}
            initialValue={dayjs().subtract(1, "month")}
          >
            <DatePicker
              picker="month"
              style={{ width: "100%" }}
              format="MM/YYYY"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Cập nhật lương"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={() => editForm.submit()}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          <Form.Item name="bonus" label="Thưởng (VNĐ)">
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
          <Form.Item name="penalty" label="Phạt (VNĐ)">
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Drawer */}
      <Drawer
        title="Chi tiết bảng lương"
        width={800}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
      >
        {selectedSalary && (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Card title="Thông tin chung" size="small">
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Nhân viên">
                  {selectedSalary.employee?.fullName}
                </Descriptions.Item>
                <Descriptions.Item label="Vai trò">
                  {selectedSalary.employee?.role?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Tháng">
                  {dayjs(selectedSalary.monthYear).format("MM/YYYY")}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag
                    color={
                      selectedSalary.status === "paid" ? "success" : "warning"
                    }
                  >
                    {selectedSalary.status === "paid" ? "Đã trả" : "Chưa trả"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Lương cơ bản">
                  <Text strong>
                    {selectedSalary.baseSalary.toLocaleString()}đ
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Thưởng">
                  <Text style={{ color: "#52c41a" }}>
                    +{selectedSalary.bonus.toLocaleString()}đ
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Phạt">
                  <Text style={{ color: "#ff4d4f" }}>
                    -{selectedSalary.penalty.toLocaleString()}đ
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Ứng lương">
                  <Text style={{ color: "#faad14" }}>
                    -{selectedSalary.advancesTotal.toLocaleString()}đ
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Tổng lương" span={2}>
                  <Text strong style={{ fontSize: 18, color: "#1890ff" }}>
                    {selectedSalary.finalSalary.toLocaleString()}đ
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="Chi tiết từng ca" size="small">
              <Table
                columns={shiftDetailColumns}
                dataSource={shiftDetails}
                rowKey="id"
                pagination={false}
                size="small"
                scroll={{ x: 800 }}
              />
            </Card>
          </Space>
        )}
      </Drawer>
    </Space>
  );
}
