import axiosClient from './axiosClient';

const userApi = {
  // Lấy danh sách người dùng kèm bộ lọc (role, status, q...)
  getAll: async (params = {}) => {
    return await axiosClient.get('/users', { params });
  },

  // Lấy chi tiết một người dùng
  getById: async (id) => {
    return await axiosClient.get(`/users/${id}`);
  },

  // Tạo người dùng mới (dành cho Admin)
  create: async (userData) => {
    const existing = await axiosClient.get('/users', {
      params: { email: userData.email },
    });
    if (existing && existing.length > 0) {
      throw new Error('Email này đã tồn tại trên hệ thống!');
    }
    return await axiosClient.post('/users', {
      ...userData,
      status: userData.status || 'active',
      avatar:
        userData.avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    });
  },

  // Cập nhật thông tin người dùng
  update: async (id, userData) => {
    return await axiosClient.patch(`/users/${id}`, userData);
  },

  // Khóa hoặc Mở khóa tài khoản
  toggleStatus: async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'locked' : 'active';
    return await axiosClient.patch(`/users/${id}`, { status: newStatus });
  },

  // Xóa người dùng
  delete: async (id) => {
    return await axiosClient.delete(`/users/${id}`);
  },
};

export default userApi;
