import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message } from 'antd';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { getApi, postApi, putApi, deleteApi } from '../../api/api';
import { Employee } from '../../types/types';
import { usePermission } from '../../contexts/PermissionContext';
import PermissionButton from '../../components/common/PermissionButton';

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);
  const { hasPermission } = usePermission();

  // Fetch employees
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getApi('/employees');
        setEmployees(response.data);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
        message.error('Failed to load employees');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      if (editingId) {
        // Update existing employee
        await putApi(`/employees/${editingId}`, values);
        setEmployees(employees.map(employee => 
          employee.id === editingId ? { ...employee, ...values } : employee
        ));
        message.success('Employee updated successfully');
      } else {
        // Create new employee
        const response = await postApi('/employees', values);
        setEmployees([...employees, response.data]);
        message.success('Employee created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
    } catch (error) {
      console.error('Failed to save employee:', error);
      message.error('Failed to save employee');
    }
  };

  // Handle employee deletion
  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this employee?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await deleteApi(`/employees/${id}`);
          setEmployees(employees.filter(employee => employee.id !== id));
          message.success('Employee deleted successfully');
        } catch (error) {
          console.error('Failed to delete employee:', error);
          message.error('Failed to delete employee');
        }
      }
    });
  };

  // Handle edit button click
  const handleEdit = (record: Employee) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      position: record.position,
      department: record.department,
      email: record.email,
      phone: record.phone
    });
    setModalVisible(true);
  };

  // Handle add button click
  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Employee) => (
        <Space size="middle">
          {hasPermission('employees', 'edit') && (
            <Button 
              type="text" 
              icon={<Edit size={16} />} 
              onClick={() => handleEdit(record)}
            />
          )}
          {hasPermission('employees', 'delete') && (
            <Button 
              type="text" 
              danger
              icon={<Trash2 size={16} />} 
              onClick={() => handleDelete(record.id)}
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Employees</h1>
        <PermissionButton 
          module="employees" 
          action="add" 
          type="primary" 
          icon={<PlusCircle size={16} />}
          onClick={handleAdd}
        >
          Add Employee
        </PermissionButton>
      </div>

      <Table 
        columns={columns} 
        dataSource={employees} 
        rowKey="id" 
        loading={loading}
      />

      <Modal
        title={editingId ? 'Edit Employee' : 'Add Employee'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingId(null);
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[
              { required: true, message: 'Please enter name' },
              { pattern: /^[A-Za-z\s]+$/, message: 'Name must contain only letters and spaces' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="position"
            label="Position"
            rules={[
              { required: true, message: 'Please enter position' },
              { pattern: /^[A-Za-z\s]+$/, message: 'Position must contain only letters and spaces' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="department"
            label="Department"
            rules={[
              { required: true, message: 'Please enter department' },
              { pattern: /^[A-Za-z\s]+$/, message: 'Department must contain only letters and spaces' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[
              { required: true, message: 'Please enter phone number' },
              { pattern: /^\d{10}$/, message: 'Phone number must be 10 digits' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <div className="flex justify-end">
              <Button 
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                  setEditingId(null);
                }}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingId ? 'Update' : 'Create'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeeList;