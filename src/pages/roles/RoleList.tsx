import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Checkbox, message, Card, Tabs, Collapse } from 'antd';
import { Edit } from 'lucide-react';
import { getApi, putApi } from '../../api/api';
import { Role, Permission } from '../../types/types';
import { usePermission } from '../../contexts/PermissionContext';

const { TabPane } = Tabs;
const { Panel } = Collapse;

const RoleList: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);
  const { hasPermission } = usePermission();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [rolesResponse, permissionsResponse] = await Promise.all([
          getApi('/roles'),
          getApi('/permissions')
        ]);
        setRoles(rolesResponse.data);
        setPermissions(permissionsResponse.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        message.error('Failed to load roles and permissions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const permissionsByRole = permissions.reduce((acc: any, permission) => {
    if (!acc[permission.roleId]) {
      acc[permission.roleId] = {};
    }
    
    if (!acc[permission.roleId][permission.module]) {
      acc[permission.roleId][permission.module] = [];
    }
    
    acc[permission.roleId][permission.module] = permission.actions;
    return acc;
  }, {});

  const handleEdit = (role: Role) => {
    setEditingId(role.id);
    
    const rolePermissions = permissionsByRole[role.id] || {};
    const formValues: any = {
      name: role.name,
      description: role.description,
    };
    
    Object.keys(rolePermissions).forEach(module => {
      rolePermissions[module].forEach((action: string) => {
        formValues[`${module}_${action}`] = true;
      });
    });
    
    form.setFieldsValue(formValues);
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (!editingId) return;
      
      const roleData = {
        name: values.name,
        description: values.description
      };
      
      await putApi(`/roles/${editingId}`, roleData);
      
      setRoles(roles.map(role => 
        role.id === editingId ? { ...role, ...roleData } : role
      ));
      
      const modules = ['users', 'employees', 'projects', 'roles'];
      const actions = ['view', 'add', 'edit', 'delete'];
      
      const updatedPermissions = modules.map(module => {
        const permissionId = permissions.find(
          p => p.roleId === editingId && p.module === module
        )?.id;
        
        if (!permissionId) return null;
        
        const selectedActions = actions.filter(action => 
          values[`${module}_${action}`]
        );
        
        return {
          id: permissionId,
          roleId: editingId,
          module,
          actions: selectedActions
        };
      }).filter(Boolean) as Permission[];
      
      for (const permission of updatedPermissions) {
        await putApi(`/permissions/${permission.id}`, permission);
      }
      
      setPermissions(permissions.map(permission => {
        const updated = updatedPermissions.find(p => p.id === permission.id);
        return updated || permission;
      }));
      
      message.success('Role and permissions updated successfully');
      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update role and permissions:', error);
      message.error('Failed to update role and permissions');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Role) => (
        hasPermission('roles', 'edit') ? (
          <Button 
            type="text" 
            icon={<Edit size={16} />} 
            onClick={() => handleEdit(record)}
          />
        ) : null
      ),
    },
  ];

  // Render permission details
  const renderPermissionDetails = (roleId: number) => {
    const rolePermissions = permissionsByRole[roleId] || {};
    
    return (
      <Collapse>
        {Object.keys(rolePermissions).map(module => (
          <Panel header={module.charAt(0).toUpperCase() + module.slice(1)} key={module}>
            <ul className="list-disc pl-5">
              {rolePermissions[module].map((action: string) => (
                <li key={action}>{action.charAt(0).toUpperCase() + action.slice(1)}</li>
              ))}
              {rolePermissions[module].length === 0 && (
                <li className="text-gray-400">No permissions</li>
              )}
            </ul>
          </Panel>
        ))}
      </Collapse>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Roles & Permissions</h1>

      <Tabs defaultActiveKey="table">
        <TabPane tab="Roles Table" key="table">
          <Table 
            columns={columns} 
            dataSource={roles} 
            rowKey="id" 
            loading={loading}
            expandable={{
              expandedRowRender: record => renderPermissionDetails(record.id),
              rowExpandable: record => true,
            }}
          />
        </TabPane>
        <TabPane tab="Permissions Matrix" key="matrix">
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2">Module/Action</th>
                    {roles.map(role => (
                      <th key={role.id} className="border p-2">{role.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {['users', 'employees', 'projects', 'roles'].map(module => (
                    <React.Fragment key={module}>
                      <tr className="bg-gray-100">
                        <td colSpan={roles.length + 1} className="border p-2 font-bold">
                          {module.charAt(0).toUpperCase() + module.slice(1)}
                        </td>
                      </tr>
                      {['view', 'add', 'edit', 'delete'].map(action => (
                        <tr key={`${module}_${action}`}>
                          <td className="border p-2">{action.charAt(0).toUpperCase() + action.slice(1)}</td>
                          {roles.map(role => (
                            <td key={`${role.id}_${module}_${action}`} className="border p-2 text-center">
                              {permissionsByRole[role.id]?.[module]?.includes(action) ? '✓' : ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title="Edit Role Permissions"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingId(null);
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Role Name"
            rules={[{ required: true, message: 'Please enter role name' }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>
          
          <h3 className="font-bold mb-2">Permissions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['users', 'employees', 'projects', 'roles'].map(module => (
              <Card title={module.charAt(0).toUpperCase() + module.slice(1)} key={module} size="small">
                <Form.Item name={`${module}_view`} valuePropName="checked">
                  <Checkbox>View</Checkbox>
                </Form.Item>
                <Form.Item name={`${module}_add`} valuePropName="checked">
                  <Checkbox>Add</Checkbox>
                </Form.Item>
                <Form.Item name={`${module}_edit`} valuePropName="checked">
                  <Checkbox>Edit</Checkbox>
                </Form.Item>
                <Form.Item name={`${module}_delete`} valuePropName="checked">
                  <Checkbox>Delete</Checkbox>
                </Form.Item>
              </Card>
            ))}
          </div>
          
          <Form.Item className="mt-4">
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
                Update
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoleList;