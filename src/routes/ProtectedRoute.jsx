import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * Component bảo vệ đường dẫn theo trạng thái đăng nhập và vai trò (Role-based Authorization)
 * @param {Array<string>} roles Danh sách vai trò được phép truy cập (vd: ['admin'], ['instructor'])
 * @param {React.ReactNode} children Component con nếu truyền trực tiếp
 */
const ProtectedRoute = ({ roles = [], children }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // 1. Chưa đăng nhập -> Chuyển hướng về trang đăng nhập và lưu lại vị trí trước đó
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Tài khoản bị khóa (phòng trường hợp bị khóa trong lúc đang sử dụng)
  if (user.status === 'locked') {
    return <Navigate to="/login" replace />;
  }

  // 3. Đã đăng nhập nhưng không đủ quyền theo vai trò -> Chuyển hướng về trang 403 Không có quyền
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Hợp lệ -> Hiển thị children hoặc Outlet
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
