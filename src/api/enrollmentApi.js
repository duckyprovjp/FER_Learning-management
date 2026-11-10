import axiosClient from './axiosClient';

const enrollmentApi = {
  // Lấy tất cả lượt đăng ký
  getAll: async (params = {}) => {
    return await axiosClient.get('/enrollments', { params });
  },

  // Lấy danh sách khóa học mà sinh viên đã đăng ký
  getByStudent: async (studentId) => {
    return await axiosClient.get('/enrollments', {
      params: { studentId, status: 'active' },
    });
  },

  // Lấy danh sách học viên đăng ký của một khóa học
  getByCourse: async (courseId) => {
    return await axiosClient.get('/enrollments', {
      params: { courseId, status: 'active' },
    });
  },

  // Kiểm tra xem sinh viên đã đăng ký khóa học này chưa
  checkEnrollment: async (studentId, courseId) => {
    const records = await axiosClient.get('/enrollments', {
      params: { studentId, courseId, status: 'active' },
    });
    return records.length > 0 ? records[0] : null;
  },

  // Đăng ký khóa học mới (kiểm tra chống đăng ký trùng lặp)
  enroll: async (studentId, courseId) => {
    const existing = await enrollmentApi.checkEnrollment(studentId, courseId);
    if (existing) {
      throw new Error('Bạn đã đăng ký khóa học này rồi!');
    }

    return await axiosClient.post('/enrollments', {
      studentId: Number(studentId),
      courseId: Number(courseId),
      enrolledAt: new Date().toISOString(),
      status: 'active',
    });
  },

  // Hủy đăng ký khóa học (xóa bản ghi enrollment hoặc đổi trạng thái)
  unenroll: async (id) => {
    return await axiosClient.delete(`/enrollments/${id}`);
  },

  // Hủy đăng ký theo studentId và courseId
  unenrollByStudentAndCourse: async (studentId, courseId) => {
    const records = await axiosClient.get('/enrollments', {
      params: { studentId, courseId, status: 'active' },
    });
    if (records.length > 0) {
      return await axiosClient.delete(`/enrollments/${records[0].id}`);
    }
    return null;
  },
};

export default enrollmentApi;
