import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message } from 'antd';
import { PlusCircle, Edit, Trash2, Search } from 'lucide-react';
import { getApi, postApi, putApi, deleteApi } from '../../api/api';
import { User, Role } from '../../types/types';
import bcrypt from 'bcryptjs';
import { usePermission } from '../../contexts/PermissionContext';
import PermissionButton from '../../components/common/PermissionButton';

const { Search: SearchInput } = Input;

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const { hasPermission } = usePermission();

  // Fetch users and roles
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersResponse, rolesResponse] = await Promise.all([
          getApi('/users'),
          getApi('/roles')
        ]);
        setUsers(usersResponse.data);
        setRoles(rolesResponse.data);
        setFilteredUsers(usersResponse.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        message.error('Failed to load users');
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
        // Update existing user
        if (values.password) {
          values.password = await bcrypt.hash(values.password, 10);
        }
        await putApi(`/users/${editingId}`, values);
        setUsers(users.map(user => 
          user.id === editingId ? { ...user, ...values } : user
        ));
        message.success('User updated successfully');
      } else {
        // Create new user
        values.password = await bcrypt.hash(values.password, 10);
        const response = await postApi('/users', values);
        setUsers([...users, response.data]);
        message.success('User created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
    } catch (error) {
      console.error('Failed to save user:', error);
      message.error('Failed to save user');
    }
  };

  // Handle user deletion
  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this user?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await deleteApi(`/users/${id}`);
          setUsers(users.filter(user => user.id !== id));
          setFilteredUsers(filteredUsers.filter(user => user.id !== id));
          message.success('User deleted successfully');
        } catch (error) {
          console.error('Failed to delete user:', error);
          message.error('Failed to delete user');
        }
      }
    });
  };

  // Handle edit button click
  const handleEdit = (record: User) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      password: record.password,
      role: record.role
    });
    setModalVisible(true);
  };

  // Handle add button click
  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchText(value);
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(value.toLowerCase()) ||
      user.email.toLowerCase().includes(value.toLowerCase()) ||
      user.role.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  // Table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space size="middle">
          {hasPermission('users', 'edit') && (
            <Button 
              type="text" 
              icon={<Edit size={16} />} 
              onClick={() => handleEdit(record)}
            />
          )}
          {hasPermission('users', 'delete') && (
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
        <h1 className="text-2xl font-bold">Users</h1>
        <PermissionButton 
          module="users" 
          action="add" 
          type="primary" 
          icon={<PlusCircle size={16} />}
          onClick={handleAdd}
        >
          Add User
        </PermissionButton>
      </div>

      <div className="mb-4">
        <SearchInput
          placeholder="Search users"
          enterButton={<Search />}
          value={searchText}
          onChange={e => handleSearch(e.target.value)}
          onSearch={handleSearch}
        />
      </div>

      <Table 
        columns={columns} 
        dataSource={filteredUsers} 
        rowKey="id" 
        loading={loading}
      />

      <Modal
        title={editingId ? 'Edit User' : 'Add User'}
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
            rules={[{ required: true, message: 'Please enter name' },
              { pattern: /^[A-Za-z\s]+$/, message: 'Name must contain only letters and spaces' }
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
            name="password"
            label="Password"
            rules={[
              { required: !editingId, message: 'Please enter password' },
              { min: 8, message: 'Password must be at least 8 characters' },
              { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select>
              {roles.map(role => (
                <Select.Option key={role.id} value={role.name}>
                  {role.name}
                </Select.Option>
              ))}
            </Select>
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

export default UserList;