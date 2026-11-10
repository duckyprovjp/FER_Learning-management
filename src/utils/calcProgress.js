/**
 * Tính toán phần trăm tiến độ hoàn thành khóa học
 * @param {number} completedCount Số bài học đã hoàn thành
 * @param {number} totalLessons Tổng số bài học của khóa
 * @returns {number} Phần trăm từ 0 đến 100
 */
export function calcProgress(completedCount = 0, totalLessons = 0) {
  if (!totalLessons || totalLessons <= 0) return 0;
  const percent = Math.round((completedCount / totalLessons) * 100);
  return Math.min(Math.max(percent, 0), 100);
}

export default calcProgress;
