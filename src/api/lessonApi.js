import axiosClient from './axiosClient';

const lessonApi = {
  // Lấy danh sách bài học thuộc một khóa học, sắp xếp theo thứ tự order tăng dần
  getByCourse: async (courseId) => {
    return await axiosClient.get('/lessons', {
      params: {
        courseId,
        _sort: 'order',
        _order: 'asc',
      },
    });
  },

  // Lấy chi tiết một bài học
  getById: async (id) => {
    return await axiosClient.get(`/lessons/${id}`);
  },

  // Tạo bài học mới
  create: async (lessonData) => {
    return await axiosClient.post('/lessons', {
      ...lessonData,
      courseId: Number(lessonData.courseId),
      order: Number(lessonData.order) || 1,
    });
  },

  // Cập nhật bài học
  update: async (id, lessonData) => {
    const formattedData = { ...lessonData };
    if (formattedData.courseId) formattedData.courseId = Number(formattedData.courseId);
    if (formattedData.order) formattedData.order = Number(formattedData.order);
    return await axiosClient.patch(`/lessons/${id}`, formattedData);
  },

  // Xóa bài học
  delete: async (id) => {
    return await axiosClient.delete(`/lessons/${id}`);
  },
};

export default lessonApi;
