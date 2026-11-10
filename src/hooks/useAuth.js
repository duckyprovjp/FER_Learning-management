import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook tùy biến truy cập nhanh dữ liệu xác thực từ AuthContext
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
}

export default useAuth;
