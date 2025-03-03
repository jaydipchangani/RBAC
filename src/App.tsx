import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import { PermissionProvider } from './contexts/PermissionContext';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserList from './pages/users/UserList';
import EmployeeList from './pages/employees/EmployeeList';
import ProjectList from './pages/projects/ProjectList';
import RoleList from './pages/roles/RoleList';
import Profile from './pages/Profile';
import Unauthorized from './pages/Unauthorized';
import { AuthRoute, PermissionOutlet } from './components/ProtectedRoute';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <Router>
        <AuthProvider>
          <PermissionProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              <Route
                path="/"
                element={
                  <AuthRoute>
                    <AppLayout />
                  </AuthRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
                
                <Route
                  path="users"
                  element={<PermissionOutlet module="users" action="view" />}
                >
                  <Route index element={<UserList />} />
                </Route>
                
                <Route
                  path="employees"
                  element={<PermissionOutlet module="employees" action="view" />}
                >
                  <Route index element={<EmployeeList />} />
                </Route>
                
                <Route
                  path="projects"
                  element={<PermissionOutlet module="projects" action="view" />}
                >
                  <Route index element={<ProjectList />} />
                </Route>
                
                <Route
                  path="roles"
                  element={<PermissionOutlet module="roles" action="view" />}
                >
                  <Route index element={<RoleList />} />
                </Route>
              </Route>
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </PermissionProvider>
        </AuthProvider>
      </Router>
    </ConfigProvider>
  );
}




export default App;