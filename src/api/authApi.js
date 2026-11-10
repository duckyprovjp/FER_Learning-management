import axiosClient from './axiosClient';

const authApi = {
  // Đăng nhập: tìm kiếm người dùng theo email và password
  login: async ({ email, password }) => {
    const users = await axiosClient.get('/users', {
      params: { email, password },
    });

    if (!users || users.length === 0) {
      throw new Error('Email hoặc mật khẩu không chính xác!');
    }

    const user = users[0];
    if (user.status === 'locked') {
      throw new Error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên!');
    }

    return user;
  },

  // Đăng ký tài khoản mới (mặc định vai trò student, trạng thái active)
  register: async (userData) => {
    // Kiểm tra xem email đã tồn tại hay chưa
    const existingUsers = await axiosClient.get('/users', {
      params: { email: userData.email },
    });

    if (existingUsers && existingUsers.length > 0) {
      throw new Error('Email này đã tồn tại trên hệ thống!');
    }

    const newUser = {
      ...userData,
      role: 'student',
      status: 'active',
      avatar:
        userData.avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    };

    return await axiosClient.post('/users', newUser);
  },

  // Lấy thông tin người dùng theo ID
  getCurrentUser: async (id) => {
    return await axiosClient.get(`/users/${id}`);
  },
};

export default authApi;
