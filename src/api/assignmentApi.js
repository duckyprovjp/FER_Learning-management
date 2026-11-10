import axiosClient from './axiosClient';

const assignmentApi = {
  // Lấy danh sách bài tập của một khóa học
  getByCourse: async (courseId) => {
    return await axiosClient.get('/assignments', {
      params: { courseId },
    });
  },

  // Lấy chi tiết một bài tập
  getById: async (id) => {
    return await axiosClient.get(`/assignments/${id}`);
  },

  // Tạo bài tập mới
  create: async (assignmentData) => {
    return await axiosClient.post('/assignments', {
      ...assignmentData,
      courseId: Number(assignmentData.courseId),
      maxScore: Number(assignmentData.maxScore) || 10,
    });
  },

  // Cập nhật bài tập
  update: async (id, assignmentData) => {
    const formattedData = { ...assignmentData };
    if (formattedData.courseId) formattedData.courseId = Number(formattedData.courseId);
    if (formattedData.maxScore) formattedData.maxScore = Number(formattedData.maxScore);
    return await axiosClient.patch(`/assignments/${id}`, formattedData);
  },

  // Xóa bài tập
  delete: async (id) => {
    return await axiosClient.delete(`/assignments/${id}`);
  },
};

export default assignmentApi;
