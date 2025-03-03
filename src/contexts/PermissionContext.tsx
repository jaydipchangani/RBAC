import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApi } from '../api/api';
import { useAuth } from './AuthContext';
import { Permission, PermissionContextType, UserPermissions } from '../types/types';

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState<UserPermissions>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (isAuthenticated && user) {
        try {
          setLoading(true);

          const rolesResponse = await getApi('/roles');
          const roles = rolesResponse.data;
          const userRole = roles.find((role: any) => role.name === user.role);
          
          if (userRole) {

            const permissionsResponse = await getApi('/permissions', { roleId: userRole.id });
            const rolePermissions = permissionsResponse.data;

            const formattedPermissions: UserPermissions = {};
            
            rolePermissions.forEach((permission: Permission) => {
              formattedPermissions[permission.module] = permission.actions;
            });
            
            setPermissions(formattedPermissions);
          }
        } catch (error) {
          console.error('Failed to fetch permissions:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setPermissions({});
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [isAuthenticated, user]);

  const hasPermission = (module: string, action: string): boolean => {
    if (!isAuthenticated || loading) return false;
    
    return permissions[module]?.includes(action) || false;
  };

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        loading,
        hasPermission,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = () => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
};