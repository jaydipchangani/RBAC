import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { Users, Briefcase, Settings, User } from 'lucide-react';
import { usePermission } from '../contexts/PermissionContext';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermission();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="mb-6">
        <Card>
          <h2 className="text-lg font-semibold mb-2">Welcome, {user?.name}!</h2>
          <p>You are logged in as <strong>{user?.role}</strong></p>
        </Card>
      </div>
      
      <Row gutter={[16, 16]}>
        {hasPermission('users', 'view') && (
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Users"
                value={4}
                prefix={<User size={20} />}
              />
            </Card>
          </Col>
        )}
        
        {hasPermission('employees', 'view') && (
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Employees"
                value={3}
                prefix={<Users size={20} />}
              />
            </Card>
          </Col>
        )}
        
        {hasPermission('projects', 'view') && (
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Projects"
                value={3}
                prefix={<Briefcase size={20} />}
              />
            </Card>
          </Col>
        )}
        
        {hasPermission('roles', 'view') && (
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Roles"
                value={4}
                prefix={<Settings size={20} />}
              />
            </Card>
          </Col>
        )}
      </Row>
      
      <div className="mt-8">
        <Card title="Your Access Permissions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Users Module</h3>
              <ul className="list-disc pl-5">
                {hasPermission('users', 'view') && <li>View Users</li>}
                {hasPermission('users', 'add') && <li>Add Users</li>}
                {hasPermission('users', 'edit') && <li>Edit Users</li>}
                {hasPermission('users', 'delete') && <li>Delete Users</li>}
                {!hasPermission('users', 'view') && 
                 !hasPermission('users', 'add') && 
                 !hasPermission('users', 'edit') && 
                 !hasPermission('users', 'delete') && 
                 <li className="text-gray-400">No permissions</li>}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Employees Module</h3>
              <ul className="list-disc pl-5">
                {hasPermission('employees', 'view') && <li>View Employees</li>}
                {hasPermission('employees', 'add') && <li>Add Employees</li>}
                {hasPermission('employees', 'edit') && <li>Edit Employees</li>}
                {hasPermission('employees', 'delete') && <li>Delete Employees</li>}
                {!hasPermission('employees', 'view') && 
                 !hasPermission('employees', 'add') && 
                 !hasPermission('employees', 'edit') && 
                 !hasPermission('employees', 'delete') && 
                 <li className="text-gray-400">No permissions</li>}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Projects Module</h3>
              <ul className="list-disc pl-5">
                {hasPermission('projects', 'view') && <li>View Projects</li>}
                {hasPermission('projects', 'add') && <li>Add Projects</li>}
                {hasPermission('projects', 'edit') && <li>Edit Projects</li>}
                {hasPermission('projects', 'delete') && <li>Delete Projects</li>}
                {!hasPermission('projects', 'view') && 
                 !hasPermission('projects', 'add') && 
                 !hasPermission('projects', 'edit') && 
                 !hasPermission('projects', 'delete') && 
                 <li className="text-gray-400">No permissions</li>}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Roles Module</h3>
              <ul className="list-disc pl-5">
                {hasPermission('roles', 'view') && <li>View Roles</li>}
                {hasPermission('roles', 'edit') && <li>Edit Roles</li>}
                {!hasPermission('roles', 'view') && 
                 !hasPermission('roles', 'edit') && 
                 <li className="text-gray-400">No permissions</li>}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;