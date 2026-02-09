/**
 * 私有路由守卫 - 验证用户登录状态
 */
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
// No imports needed

interface PrivateRouteProps {
  children?: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const token = localStorage.getItem('access_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children || <Outlet />}</>;
};

export default PrivateRoute;
