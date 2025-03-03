
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

export interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
}

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

export interface UserPermissions {
  [module: string]: string[];
}

export interface PermissionContextType {
  permissions: UserPermissions;
  loading: boolean;
  hasPermission: (module: string, action: string) => boolean;
}
export interface ProtectedRouteProps {
  module: string;
  action: string;
  element: React.ReactNode;
}

export interface PermissionContextType {
  permissions: UserPermissions;
  loading: boolean;
  hasPermission: (module: string, action: string) => boolean;
  updatePermissions: () => Promise<void>; // Add updatePermissions function
}