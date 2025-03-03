import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginCredentials } from '../types/types';
import { LockIcon, MailIcon } from 'lucide-react';

const { Title } = Typography;

const Login: React.FC = () => {
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: LoginCredentials) => {
    setLoading(true);
    try {
      await login(values);
      navigate('/');
    } catch (err) {
      message.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Clear any previous errors when component mounts
  React.useEffect(() => {
    clearError();
  }, []);

  // Show error message if there is one
  React.useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <Title level={2}>RBAC Admin</Title>
          <p className="text-gray-500">Sign in to your account</p>
        </div>

        <Form
          name="login"
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Please input your email!' }]}
          >
            <Input 
              prefix={<MailIcon size={16} className="mr-2 text-gray-400" />} 
              placeholder="Email" 
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password 
              prefix={<LockIcon size={16} className="mr-2 text-gray-400" />} 
              placeholder="Password" 
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              className="w-full"
            >
              Sign in
            </Button>
          </Form.Item>
        </Form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Demo Accounts:
          </p>
          <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-500">
            <div>
              <p><strong>Admin:</strong> admin@example.com</p>
              <p>Password: admin123</p>
            </div>
            <div>
              <p><strong>HR:</strong> hr@example.com</p>
              <p>Password: hr123</p>
            </div>
            <div>
              <p><strong>Supervisor:</strong> supervisor@example.com</p>
              <p>Password: supervisor123</p>
            </div>
            <div>
              <p><strong>Manager:</strong> manager@example.com</p>
              <p>Password: manager123</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;