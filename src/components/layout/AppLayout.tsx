import React, { useState } from 'react';
import { Layout, Menu, Button, theme, Avatar, Dropdown } from 'antd';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { 
  UserIcon, 
  Users, 
  Briefcase, 
  Settings, 
  LogOut, 
  Menu as MenuIcon,
  X,
  LayoutDashboardIcon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermission } from '../../contexts/PermissionContext';

const { Header, Sider, Content } = Layout;

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { hasPermission } = usePermission();
  const navigate = useNavigate();
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserIcon size={16} />,
      onClick: () => navigate('/profile'),
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogOut size={16} />,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          if (broken) {
            setCollapsed(true);
          }
        }}
      >
        <div className="p-4 h-16 flex items-center justify-center">
          <h1 className="text-white text-xl font-bold">
            {collapsed ? 'RBAC' : 'RBAC Admin'}
          </h1>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['5']}
          items={[
            hasPermission('users', 'view') && {
              key: '5',
              icon: <LayoutDashboardIcon size={16} />,
              label: <Link to="/">Dashboard</Link>,
            },
            hasPermission('users', 'view') && {
              key: '1',
              icon: <UserIcon size={16} />,
              label: <Link to="/users">Users</Link>,
            },
            hasPermission('employees', 'view') && {
              key: '2',
              icon: <Users size={16} />,
              label: <Link to="/employees">Employees</Link>,
            },
            hasPermission('projects', 'view') && {
              key: '3',
              icon: <Briefcase size={16} />,
              label: <Link to="/projects">Projects</Link>,
            },
            hasPermission('roles', 'view') && {
              key: '4',
              icon: <Settings size={16} />,
              label: <Link to="/roles">Roles & Permissions</Link>,
            },
          ].filter((item) => item)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <div className="flex justify-between items-center px-4 h-full">
            <Button
              type="text"
              icon={collapsed ? <MenuIcon /> : <X />}
              onClick={() => setCollapsed(!collapsed)}
              className="lg:block"
            />
            <div className="flex items-center">
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div className="flex items-center cursor-pointer">
                  <Avatar style={{ backgroundColor: '#1890ff' }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <span className="ml-2 mr-4">{user?.name}</span>
                </div>
              </Dropdown>
            </div>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'auto'
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;