// User related types
export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface Permission {
  id: number;
  roleId: number;
  module: string;
  actions: string[];
}

// Employee related types
export interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
}

// Project related types
export interface Project {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
}

// Auth related types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Permission context types
export interface UserPermissions {
  [module: string]: string[];
}

export interface PermissionContextType {
  permissions: UserPermissions;
  loading: boolean;
  hasPermission: (module: string, action: string) => boolean;
}

// Route types
export interface ProtectedRouteProps {
  module: string;
  action: string;
  element: React.ReactNode;
}