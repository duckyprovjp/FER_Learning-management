import axiosClient from './axiosClient';

const courseApi = {
  // Lấy toàn bộ khóa học kèm mở rộng thông tin giảng viên (_expand: 'instructor' không hoạt động trực tiếp nếu tên field là instructorId, json-server 0.17 dùng _expand=user khi field là userId, nhưng ở đây field là instructorId nên ta có thể lấy danh sách khóa học và kết hợp hoặc dùng params). Để an toàn với json-server, hỗ trợ linh hoạt.
  getAll: async (params = {}) => {
    return await axiosClient.get('/courses', { params });
  },

  // Lấy chi tiết khóa học theo ID
  getById: async (id) => {
    return await axiosClient.get(`/courses/${id}`);
  },

  // Lấy danh sách khóa học của một giảng viên cụ thể
  getByInstructor: async (instructorId) => {
    return await axiosClient.get('/courses', {
      params: { instructorId },
    });
  },

  // Tạo khóa học mới
  create: async (courseData) => {
    return await axiosClient.post('/courses', {
      ...courseData,
      status: courseData.status || 'published',
      createdAt: new Date().toISOString(),
    });
  },

  // Cập nhật khóa học
  update: async (id, courseData) => {
    return await axiosClient.patch(`/courses/${id}`, courseData);
  },

  // Xóa khóa học
  delete: async (id) => {
    return await axiosClient.delete(`/courses/${id}`);
  },
};

export default courseApi;
