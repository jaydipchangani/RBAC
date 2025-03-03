import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, DatePicker, Select, message } from 'antd';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { getApi, postApi, putApi, deleteApi } from '../../api/api';
import { Project } from '../../types/types';
import { usePermission } from '../../contexts/PermissionContext';
import PermissionButton from '../../components/common/PermissionButton';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);
  const { hasPermission } = usePermission();
  const [searchProject, setSearchProject] = useState('');

  // Fetch projects
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getApi('/projects');
        setProjects(response.data);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        message.error('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      // Format dates
      const formattedValues = {
        ...values,
        startDate: values.dates[0].format('YYYY-MM-DD'),
        endDate: values.dates[1].format('YYYY-MM-DD'),
      };
      
      // Remove the dates array
      delete formattedValues.dates;
      
      if (editingId) {
        // Update existing project
        await putApi(`/projects/${editingId}`, formattedValues);
        setProjects(projects.map(project => 
          project.id === editingId ? { ...project, ...formattedValues } : project
        ));
        message.success('Project updated successfully');
      } else {
        // Create new project
        const response = await postApi('/projects', formattedValues);
        setProjects([...projects, response.data]);
        message.success('Project created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
    } catch (error) {
      console.error('Failed to save project:', error);
      message.error('Failed to save project');
    }
  };

  // Handle project deletion
  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this project?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await deleteApi(`/projects/${id}`);
          setProjects(projects.filter(project => project.id !== id));
          message.success('Project deleted successfully');
        } catch (error) {
          console.error('Failed to delete project:', error);
          message.error('Failed to delete project');
        }
      }
    });
  };

  // Handle edit button click
  const handleEdit = (record: Project) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      dates: [dayjs(record.startDate), dayjs(record.endDate)],
      status: record.status
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
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Project) => (
        <Space size="middle">
          {hasPermission('projects', 'edit') && (
            <Button 
              type="text" 
              icon={<Edit size={16} />} 
              onClick={() => handleEdit(record)}
            />
          )}
          {hasPermission('projects', 'delete') && (
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
        <h1 className="text-2xl font-bold">Projects</h1>
        <PermissionButton 
          module="projects" 
          action="add" 
          type="primary" 
          icon={<PlusCircle size={16} />}
          onClick={handleAdd}
        >
          Add Project
        </PermissionButton>
      </div>

      <Input
              placeholder="Search Projects"
              value={searchProject}
              onChange={(e1) => setSearchProject(e1.target.value)}
              className="mb-4"
            />

      <Table 
        columns={columns} 
        dataSource={projects} 
        rowKey="id" 
        loading={loading}
      />

      <Modal
        title={editingId ? 'Edit Project' : 'Add Project'}
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
            rules={[{ required: true, message: 'Please enter project name' },
              { pattern: /^[A-Za-z\s]+$/, message: 'Name must contain only letters and spaces' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' },
              { pattern: /^[A-Za-z\s]+$/, message: 'Name must contain only letters and spaces' }
            ]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="dates"
            label="Project Duration"
            rules={[
              { required: true, message: 'Please select project duration' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || value[0].isBefore(value[1])) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Start date should be less than end date'));
                },
              }),
            ]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select>
              <Select.Option value="Planned">Planned</Select.Option>
              <Select.Option value="In Progress">In Progress</Select.Option>
              <Select.Option value="Completed">Completed</Select.Option>
              <Select.Option value="On Hold">On Hold</Select.Option>
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

export default ProjectList;