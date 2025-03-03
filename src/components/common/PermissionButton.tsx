import React from 'react';
import { Button } from 'antd';
import { usePermission } from '../../contexts/PermissionContext';

interface PermissionButtonProps {
  module: string;
  action: string;
  children: React.ReactNode;
  [key: string]: any; 
}

const PermissionButton: React.FC<PermissionButtonProps> = ({
  module,
  action,
  children,
  ...rest
}) => {
  const { hasPermission } = usePermission();

  if (!hasPermission(module, action)) {
    return null;
  }

  return <Button {...rest}>{children}</Button>;
};

export default PermissionButton;