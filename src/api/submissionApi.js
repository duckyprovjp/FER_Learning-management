import axiosClient from './axiosClient';

const submissionApi = {
  // Lấy các bài nộp theo bài tập
  getByAssignment: async (assignmentId) => {
    return await axiosClient.get('/submissions', {
      params: { assignmentId },
    });
  },

  // Lấy danh sách bài nộp của một sinh viên
  getByStudent: async (studentId) => {
    return await axiosClient.get('/submissions', {
      params: { studentId },
    });
  },

  // Lấy bài nộp của một sinh viên cho một bài tập cụ thể
  getByAssignmentAndStudent: async (assignmentId, studentId) => {
    const list = await axiosClient.get('/submissions', {
      params: { assignmentId, studentId },
    });
    return list.length > 0 ? list[0] : null;
  },

  // Nộp bài hoặc Nộp lại bài trước hạn
  submit: async ({ assignmentId, studentId, content }) => {
    const existing = await submissionApi.getByAssignmentAndStudent(
      assignmentId,
      studentId
    );

    if (existing) {
      // Cập nhật lại bài nộp cũ (nộp lại)
      return await axiosClient.patch(`/submissions/${existing.id}`, {
        content,
        submittedAt: new Date().toISOString(),
      });
    }

    // Nộp bài mới
    return await axiosClient.post('/submissions', {
      assignmentId: Number(assignmentId),
      studentId: Number(studentId),
      content,
      submittedAt: new Date().toISOString(),
      score: null,
      feedback: null,
      gradedAt: null,
    });
  },

  // Giảng viên chấm điểm bài làm
  grade: async (submissionId, { score, feedback }) => {
    return await axiosClient.patch(`/submissions/${submissionId}`, {
      score: Number(score),
      feedback: feedback ? feedback.trim() : '',
      gradedAt: new Date().toISOString(),
    });
  },

  // Lấy chi tiết một bài nộp
  getById: async (id) => {
    return await axiosClient.get(`/submissions/${id}`);
  },
};

export default submissionApi;
