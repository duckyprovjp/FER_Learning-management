import axiosClient from './axiosClient';

const progressApi = {
  // Lấy danh sách tiến độ học các bài của một sinh viên trong một khóa học
  getByStudentAndCourse: async (studentId, courseId) => {
    return await axiosClient.get('/progress', {
      params: {
        studentId: Number(studentId),
        courseId: Number(courseId),
      },
    });
  },

  // Lấy toàn bộ tiến độ của sinh viên trong tất cả khóa học
  getByStudent: async (studentId) => {
    return await axiosClient.get('/progress', {
      params: {
        studentId: Number(studentId),
      },
    });
  },

  // Đánh dấu hoàn thành hoặc bỏ đánh dấu hoàn thành bài học
  toggleLessonProgress: async ({ studentId, courseId, lessonId, completed }) => {
    const records = await axiosClient.get('/progress', {
      params: {
        studentId: Number(studentId),
        courseId: Number(courseId),
        lessonId: Number(lessonId),
      },
    });

    if (records && records.length > 0) {
      const existing = records[0];
      return await axiosClient.patch(`/progress/${existing.id}`, {
        completed,
        completedAt: completed ? new Date().toISOString() : null,
      });
    }

    return await axiosClient.post('/progress', {
      studentId: Number(studentId),
      courseId: Number(courseId),
      lessonId: Number(lessonId),
      completed,
      completedAt: completed ? new Date().toISOString() : null,
    });
  },
};

export default progressApi;
