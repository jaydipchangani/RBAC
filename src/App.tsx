import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import { PermissionProvider } from './contexts/PermissionContext';
import { setNavigate } from './api/api';

// Layouts
import AppLayout from './components/layout/AppLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserList from './pages/users/UserList';
import EmployeeList from './pages/employees/EmployeeList';
import ProjectList from './pages/projects/ProjectList';
import RoleList from './pages/roles/RoleList';
import Profile from './pages/Profile';
import Unauthorized from './pages/Unauthorized';

// Protected Routes
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
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Protected routes */}
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
                
                {/* Users module */}
                <Route
                  path="users"
                  element={<PermissionOutlet module="users" action="view" />}
                >
                  <Route index element={<UserList />} />
                </Route>
                
                {/* Employees module */}
                <Route
                  path="employees"
                  element={<PermissionOutlet module="employees" action="view" />}
                >
                  <Route index element={<EmployeeList />} />
                </Route>
                
                {/* Projects module */}
                <Route
                  path="projects"
                  element={<PermissionOutlet module="projects" action="view" />}
                >
                  <Route index element={<ProjectList />} />
                </Route>
                
                {/* Roles module */}
                <Route
                  path="roles"
                  element={<PermissionOutlet module="roles" action="view" />}
                >
                  <Route index element={<RoleList />} />
                </Route>
              </Route>
              
              {/* Redirect any unknown routes to dashboard or login */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </PermissionProvider>
        </AuthProvider>
      </Router>
    </ConfigProvider>
  );
}

// Set navigate for API interceptors
const AppWithNavigate: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="*"
          element={
            <NavigateSetter>
              <App />
            </NavigateSetter>
          }
        />
      </Routes>
    </Router>
  );
};

// Helper component to set navigate
const NavigateSetter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  React.useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);
  
  return <>{children}</>;
};

export default App;