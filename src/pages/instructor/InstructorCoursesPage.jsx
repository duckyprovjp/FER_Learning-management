import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Badge, Button, Row, Col, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import courseApi from '../../api/courseApi';
import lessonApi from '../../api/lessonApi';
import enrollmentApi from '../../api/enrollmentApi';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import InstructorCourseModal from '../../components/instructor/InstructorCourseModal';
import { formatDate } from '../../utils/formatDate';

const InstructorCoursesPage = () => {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [extraData, setExtraData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMyCourses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const myCourses = await courseApi.getByInstructor(user.id);
      setCourses(myCourses);

      // Lấy số lượng bài học và số học viên cho từng khóa học
      const extraInfo = {};
      await Promise.all(
        myCourses.map(async (c) => {
          const [lessons, enrollments] = await Promise.all([
            lessonApi.getByCourse(c.id),
            enrollmentApi.getByCourse(c.id),
          ]);
          extraInfo[c.id] = {
            lessonsCount: lessons.length,
            studentsCount: enrollments.length,
          };
        })
      );
      setExtraData(extraInfo);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách khóa học của bạn');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyCourses();
  }, [fetchMyCourses]);

  const handleCreate = () => {
    setCourseToEdit(null);
    setShowCourseModal(true);
  };

  const handleEdit = (course) => {
    setCourseToEdit(course);
    setShowCourseModal(true);
  };

  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    setActionLoading(true);
    try {
      await courseApi.delete(courseToDelete.id);
      toast.success(`Đã xóa khóa học "${courseToDelete.title}" thành công!`);
      setShowConfirmModal(false);
      setCourseToDelete(null);
      fetchMyCourses();
    } catch (err) {
      toast.error(err.message || 'Xóa khóa học thất bại!');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Khóa Học Của Tôi</h4>
          <p className="text-muted small mb-0">
            Quản lý các lớp học do bạn trực tiếp phụ trách và giảng dạy
          </p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          + Tạo Khóa Học Mới
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Đang tải danh sách khóa học của bạn..." />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : courses.length === 0 ? (
        <Card className="text-center py-5 border-0 shadow-sm">
          <Card.Body>
            <i className="bi bi-journal-x display-4 text-muted mb-3 d-block"></i>
            <h5 className="fw-bold text-secondary">Bạn chưa phụ trách khóa học nào</h5>
            <p className="text-muted small mb-3">
              Bắt đầu tạo khóa học đầu tiên để chia sẻ kiến thức với sinh viên!
            </p>
            <Button variant="primary" onClick={handleCreate}>
              Tạo Khóa Học Ngay
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3" style={{ minWidth: '260px' }}>
                      Khóa học
                    </th>
                    <th>Danh mục</th>
                    <th>Bài học</th>
                    <th>Học viên</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th className="text-end pe-3" style={{ minWidth: '240px' }}>
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => {
                    const extra = extraData[course.id] || {
                      lessonsCount: 0,
                      studentsCount: 0,
                    };
                    return (
                      <tr key={course.id}>
                        <td className="ps-3">
                          <div className="d-flex align-items-center">
                            <img
                              src={
                                course.thumbnail ||
                                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'
                              }
                              alt=""
                              className="rounded me-3 border"
                              width="50"
                              height="38"
                              style={{ objectFit: 'cover' }}
                            />
                            <div>
                              <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '220px' }}>
                                {course.title}
                              </div>
                              <div className="text-muted small">Cấp độ: {course.level}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge bg="primary">{course.category}</Badge>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {extra.lessonsCount} bài
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {extra.studentsCount} học viên
                          </span>
                        </td>
                        <td>
                          <Badge
                            bg={course.status === 'published' ? 'success' : 'secondary'}
                          >
                            {course.status === 'published' ? 'Công khai' : 'Bản nháp'}
                          </Badge>
                        </td>
                        <td className="text-muted small">
                          {formatDate(course.createdAt)}
                        </td>
                        <td className="text-end pe-3">
                          <div className="d-flex justify-content-end gap-1 flex-wrap">
                            <Button
                              as={Link}
                              to={`/instructor/courses/${course.id}`}
                              variant="outline-primary"
                              size="sm"
                              title="Quản lý Bài học & Học viên"
                            >
                              <i className="bi bi-journal-text me-1"></i> Nội dung
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleEdit(course)}
                              title="Chỉnh sửa thông tin"
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteClick(course)}
                              title="Xóa khóa học"
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Modal Thêm / Sửa khóa học */}
      <InstructorCourseModal
        show={showCourseModal}
        onHide={() => setShowCourseModal(false)}
        onSuccess={fetchMyCourses}
        courseToEdit={courseToEdit}
      />

      {/* Modal Xác nhận Xóa */}
      <ConfirmModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa khóa học"
        message={`Bạn có chắc chắn muốn xóa khóa học "${courseToDelete?.title}" không? Toàn bộ bài học của khóa cũng sẽ bị xóa theo.`}
        confirmText="Xóa Khóa Học"
        confirmVariant="danger"
        loading={actionLoading}
      />
    </div>
  );
};

export default InstructorCoursesPage;
