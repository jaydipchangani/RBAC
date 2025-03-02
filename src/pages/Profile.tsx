import React from 'react';
import { Card, Descriptions, Button, Form, Input, Modal, message } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { putApi } from '../api/api';
import bcrypt from 'bcryptjs';


const Profile: React.FC = () => {
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (values: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('New passwords do not match');
      return;
    }

    if (!user || !(await bcrypt.compare(values.currentPassword, user.password))) {
      message.error('Current password is incorrect');
      return;
    }

    setLoading(true);
    try {
      const hashedPassword = await bcrypt.hash(values.newPassword, 10);
      await putApi(`/users/${user.id}`, {
        ...user,
        password: hashedPassword
      });
      
      message.success('Password updated successfully');
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Failed to update password:', error);
      message.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      
      <Card className="mb-6">
        <Descriptions title="User Information" bordered>
          <Descriptions.Item label="Name" span={3}>{user?.name}</Descriptions.Item>
          <Descriptions.Item label="Email" span={3}>{user?.email}</Descriptions.Item>
          <Descriptions.Item label="Role" span={3}>{user?.role}</Descriptions.Item>
        </Descriptions>
        
        <div className="mt-4">
          <Button type="primary" onClick={() => setModalVisible(true)}>
            Change Password
          </Button>
        </div>
      </Card>
      
      <Modal
        title="Change Password"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[{ required: true, message: 'Please enter your current password' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'Please enter your new password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            rules={[
              { required: true, message: 'Please confirm your new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <div className="flex justify-end">
              <Button 
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Update Password
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;