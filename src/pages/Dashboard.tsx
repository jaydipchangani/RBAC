import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Spin } from "antd";
import { Users, Briefcase, Settings, User } from "lucide-react";
import { usePermission } from "../contexts/PermissionContext";
import { useAuth } from "../contexts/AuthContext";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermission();

  // State for storing counts
  const [counts, setCounts] = useState({
    users: 0,
    employees: 0,
    projects: 0,
    roles: 0,
  });

  const [loading, setLoading] = useState(true);

  // Fetch data from JSON Server
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [usersRes, employeesRes, projectsRes, rolesRes] = await Promise.all([
          fetch("http://localhost:3001/users"),
          fetch("http://localhost:3001/employees"),
          fetch("http://localhost:3001/projects"),
          fetch("http://localhost:3001/roles"),
        ]);

        const users = await usersRes.json();
        const employees = await employeesRes.json();
        const projects = await projectsRes.json();
        const roles = await rolesRes.json();

        setCounts({
          users: users.length,
          employees: employees.length,
          projects: projects.length,
          roles: roles.length,
        });

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="mb-6">
        <Card>
          <h2 className="text-lg font-semibold mb-2">Welcome, {user?.name}!</h2>
          <p>You are logged in as <strong>{user?.role}</strong></p>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {hasPermission("users", "view") && (
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic title="Users" value={counts.users} prefix={<User size={20} />} />
              </Card>
            </Col>
          )}

          {hasPermission("employees", "view") && (
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic title="Employees" value={counts.employees} prefix={<Users size={20} />} />
              </Card>
            </Col>
          )}

          {hasPermission("projects", "view") && (
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic title="Projects" value={counts.projects} prefix={<Briefcase size={20} />} />
              </Card>
            </Col>
          )}

          {hasPermission("roles", "view") && (
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic title="Roles" value={counts.roles} prefix={<Settings size={20} />} />
              </Card>
            </Col>
          )}
        </Row>
      )}
    </div>
  );
};

export default Dashboard;
