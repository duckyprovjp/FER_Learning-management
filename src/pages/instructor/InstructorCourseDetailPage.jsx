import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Nav, Tab, Button, Table, Badge, Alert, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import courseApi from '../../api/courseApi';
import lessonApi from '../../api/lessonApi';
import assignmentApi from '../../api/assignmentApi';
import enrollmentApi from '../../api/enrollmentApi';
import userApi from '../../api/userApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import LessonFormModal from '../../components/lesson/LessonFormModal';
import AssignmentFormModal from '../../components/assignment/AssignmentFormModal';
import { formatDate } from '../../utils/formatDate';

const InstructorCourseDetailPage = () => {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lesson Modal State
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonToEdit, setLessonToEdit] = useState(null);

  // Assignment Modal State
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState(null);

  // Confirm Delete State
  const [confirmModalConfig, setConfirmModalConfig] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null,
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Tải toàn bộ dữ liệu của khóa học
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [courseData, lessonList, assignmentList, enrollments, allUsers] =
        await Promise.all([
          courseApi.getById(id),
          lessonApi.getByCourse(id),
          assignmentApi.getByCourse(id),
          enrollmentApi.getByCourse(id),
          userApi.getAll(),
        ]);

      setCourse(courseData);
      setLessons(lessonList || []);
      setAssignments(assignmentList || []);

      // Ghép thông tin người dùng với danh sách enrollments
      const userMap = {};
      allUsers.forEach((u) => {
        userMap[u.id] = u;
      });

      const studentsData = enrollments.map((enr) => ({
        ...enr,
        student: userMap[enr.studentId],
      }));
      setEnrolledStudents(studentsData);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải dữ liệu chi tiết khóa học');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // --- QUẢN LÝ BÀI HỌC ---
  const handleCreateLesson = () => {
    setLessonToEdit(null);
    setShowLessonModal(true);
  };

  const handleEditLesson = (lesson) => {
    setLessonToEdit(lesson);
    setShowLessonModal(true);
  };

  const handleDeleteLesson = (lesson) => {
    setConfirmModalConfig({
      show: true,
      title: 'Xác nhận xóa bài học',
      message: `Bạn có chắc muốn xóa bài học "${lesson.title}" không?`,
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await lessonApi.delete(lesson.id);
          toast.success(`Đã xóa bài học "${lesson.title}" thành công!`);
          setConfirmModalConfig((prev) => ({ ...prev, show: false }));
          fetchAllData();
        } catch (err) {
          toast.error(err.message || 'Xóa bài học thất bại!');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // --- QUẢN LÝ BÀI TẬP ---
  const handleCreateAssignment = () => {
    setAssignmentToEdit(null);
    setShowAssignmentModal(true);
  };

  const handleEditAssignment = (assignment) => {
    setAssignmentToEdit(assignment);
    setShowAssignmentModal(true);
  };

  const handleDeleteAssignment = (assignment) => {
    setConfirmModalConfig({
      show: true,
      title: 'Xác nhận xóa bài tập',
      message: `Bạn có chắc muốn xóa bài tập "${assignment.title}" không? Toàn bộ bài nộp của học viên cho bài này cũng sẽ bị xóa.`,
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await assignmentApi.delete(assignment.id);
          toast.success(`Đã xóa bài tập "${assignment.title}" thành công!`);
          setConfirmModalConfig((prev) => ({ ...prev, show: false }));
          fetchAllData();
        } catch (err) {
          toast.error(err.message || 'Xóa bài tập thất bại!');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  if (loading) {
    return <LoadingSpinner text="Đang tải chi tiết nội dung khóa học..." />;
  }

  if (error || !course) {
    return (
      <Alert variant="danger" className="text-center">
        {error || 'Khóa học không tồn tại!'}
      </Alert>
    );
  }

  return (
    <div>
      {/* Tiêu đề & Breadcrumb */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-1">
              <li className="breadcrumb-item">
                <Link to="/instructor/courses" className="text-decoration-none">
                  Khóa học của tôi
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {course.title}
              </li>
            </ol>
          </nav>
          <h4 className="fw-bold mb-0 text-dark">{course.title}</h4>
        </div>
        <Button
          as={Link}
          to={`/instructor/courses/${course.id}/grading`}
          variant="success"
          size="sm"
        >
          <i className="bi bi-check2-square me-1"></i> Đến Bảng Chấm Điểm
        </Button>
      </div>

      {/* Thông tin tóm tắt khóa học */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-3">
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <Badge bg="primary">{course.category}</Badge>
            <Badge bg="secondary">Cấp độ: {course.level}</Badge>
            <Badge bg={course.status === 'published' ? 'success' : 'warning'}>
              {course.status === 'published' ? 'Công khai' : 'Bản nháp'}
            </Badge>
            <span className="text-muted small ms-auto">
              {lessons.length} bài học • {assignments.length} bài tập • {enrolledStudents.length} học viên
            </span>
          </div>
          <p className="text-muted small mb-0 mt-2">{course.description}</p>
        </Card.Body>
      </Card>

      {/* Các Tab chức năng */}
      <Tab.Container defaultActiveKey="lessons">
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white border-bottom-0 pt-3">
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="lessons" className="fw-semibold">
                  <i className="bi bi-journal-text me-1"></i> Quản Lý Bài Học ({lessons.length})
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="assignments" className="fw-semibold">
                  <i className="bi bi-file-earmark-check me-1"></i> Quản Lý Bài Tập ({assignments.length})
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="students" className="fw-semibold">
                  <i className="bi bi-people me-1"></i> Học Viên Đã Đăng Ký ({enrolledStudents.length})
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>

          <Card.Body className="p-4">
            <Tab.Content>
              {/* TAB 1: BÀI HỌC */}
              <Tab.Pane eventKey="lessons">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Danh sách các bài học</h6>
                  <Button variant="primary" size="sm" onClick={handleCreateLesson}>
                    + Thêm Bài Học Mới
                  </Button>
                </div>

                {lessons.length === 0 ? (
                  <p className="text-muted fst-italic text-center py-4">
                    Chưa có bài học nào. Hãy bấm "Thêm Bài Học Mới" để bắt đầu soạn đề cương!
                  </p>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: '60px' }}>STT</th>
                          <th>Tiêu đề bài học</th>
                          <th>Video URL</th>
                          <th>Thời lượng</th>
                          <th className="text-end">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lessons.map((lesson) => (
                          <tr key={lesson.id}>
                            <td className="fw-bold text-center text-primary">
                              #{lesson.order}
                            </td>
                            <td>
                              <div className="fw-semibold text-dark">
                                {lesson.title}
                              </div>
                              <div className="text-muted small truncate-2-lines">
                                {lesson.content}
                              </div>
                            </td>
                            <td>
                              {lesson.videoUrl ? (
                                <a
                                  href={lesson.videoUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-decoration-none small text-truncate d-inline-block"
                                  style={{ maxWidth: '200px' }}
                                >
                                  <i className="bi bi-play-circle me-1"></i> Xem Video
                                </a>
                              ) : (
                                <span className="text-muted small">Không có</span>
                              )}
                            </td>
                            <td>
                              <Badge bg="light" text="dark" className="border">
                                <i className="bi bi-clock me-1"></i>
                                {lesson.duration || 'N/A'}
                              </Badge>
                            </td>
                            <td className="text-end">
                              <div className="d-flex justify-content-end gap-1">
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => handleEditLesson(lesson)}
                                  title="Chỉnh sửa bài học"
                                >
                                  <i className="bi bi-pencil"></i>
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteLesson(lesson)}
                                  title="Xóa bài học"
                                >
                                  <i className="bi bi-trash"></i>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Tab.Pane>

              {/* TAB 2: BÀI TẬP */}
              <Tab.Pane eventKey="assignments">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Danh sách bài tập và yêu cầu nộp</h6>
                  <Button variant="primary" size="sm" onClick={handleCreateAssignment}>
                    + Thêm Bài Tập Mới
                  </Button>
                </div>

                {assignments.length === 0 ? (
                  <p className="text-muted fst-italic text-center py-4">
                    Chưa có bài tập nào. Hãy bấm "Thêm Bài Tập Mới" để tạo yêu cầu làm bài cho học viên!
                  </p>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Tiêu đề bài tập</th>
                          <th>Hạn nộp bài</th>
                          <th>Thang điểm tối đa</th>
                          <th className="text-end">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignments.map((assignment) => (
                          <tr key={assignment.id}>
                            <td>
                              <div className="fw-semibold text-dark">
                                {assignment.title}
                              </div>
                              <div className="text-muted small truncate-2-lines">
                                {assignment.content || assignment.description}
                              </div>
                            </td>
                            <td className="text-secondary small">
                              <i className="bi bi-calendar-event me-1"></i>
                              {formatDate(assignment.dueDate, true)}
                            </td>
                            <td>
                              <Badge bg="info">
                                {assignment.maxScore} điểm
                              </Badge>
                            </td>
                            <td className="text-end">
                              <div className="d-flex justify-content-end gap-1">
                                <Button
                                  as={Link}
                                  to={`/instructor/courses/${course.id}/grading?assignmentId=${assignment.id}`}
                                  variant="outline-success"
                                  size="sm"
                                  title="Xem bài nộp và chấm điểm"
                                >
                                  <i className="bi bi-check2-square me-1"></i> Chấm bài
                                </Button>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => handleEditAssignment(assignment)}
                                  title="Sửa bài tập"
                                >
                                  <i className="bi bi-pencil"></i>
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteAssignment(assignment)}
                                  title="Xóa bài tập"
                                >
                                  <i className="bi bi-trash"></i>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Tab.Pane>

              {/* TAB 3: HỌC VIÊN ĐÃ ĐĂNG KÝ */}
              <Tab.Pane eventKey="students">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Học viên đang theo học</h6>
                  <span className="badge bg-secondary">
                    Tổng số: {enrolledStudents.length} học viên
                  </span>
                </div>

                {enrolledStudents.length === 0 ? (
                  <p className="text-muted fst-italic text-center py-4">
                    Hiện tại chưa có học viên nào đăng ký khóa học này.
                  </p>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="ps-3">Học viên</th>
                          <th>Địa chỉ Email</th>
                          <th>Ngày đăng ký</th>
                          <th>Trạng thái học</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrolledStudents.map((enr) => (
                          <tr key={enr.id}>
                            <td className="ps-3">
                              <div className="d-flex align-items-center">
                                <img
                                  src={
                                    enr.student?.avatar ||
                                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
                                  }
                                  alt=""
                                  className="rounded-circle me-2 border"
                                  width="36"
                                  height="36"
                                  style={{ objectFit: 'cover' }}
                                />
                                <div>
                                  <div className="fw-semibold text-dark">
                                    {enr.student?.name || `ID #${enr.studentId}`}
                                  </div>
                                  <div className="text-muted small">
                                    Mã SV: #{enr.studentId}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="text-secondary">
                              {enr.student?.email || 'N/A'}
                            </td>
                            <td className="text-muted small">
                              {formatDate(enr.enrolledAt, true)}
                            </td>
                            <td>
                              <Badge
                                bg={enr.status === 'active' ? 'success' : 'secondary'}
                              >
                                {enr.status === 'active' ? 'Đang học' : 'Đã hủy'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Card>
      </Tab.Container>

      {/* Modal Quản lý Bài học */}
      <LessonFormModal
        show={showLessonModal}
        onHide={() => setShowLessonModal(false)}
        onSuccess={fetchAllData}
        courseId={id}
        lessonToEdit={lessonToEdit}
        nextOrder={lessons.length + 1}
      />

      {/* Modal Quản lý Bài tập */}
      <AssignmentFormModal
        show={showAssignmentModal}
        onHide={() => setShowAssignmentModal(false)}
        onSuccess={fetchAllData}
        courseId={id}
        assignmentToEdit={assignmentToEdit}
      />

      {/* Modal Xác nhận Xóa */}
      <ConfirmModal
        show={confirmModalConfig.show}
        onHide={() =>
          setConfirmModalConfig((prev) => ({ ...prev, show: false }))
        }
        onConfirm={confirmModalConfig.onConfirm}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        confirmText="Xác Nhận Xóa"
        confirmVariant="danger"
        loading={actionLoading}
      />
    </div>
  );
};

export default InstructorCourseDetailPage;
