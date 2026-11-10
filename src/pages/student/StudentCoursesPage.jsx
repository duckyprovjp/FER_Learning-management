import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Badge, ProgressBar, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import enrollmentApi from '../../api/enrollmentApi';
import courseApi from '../../api/courseApi';
import lessonApi from '../../api/lessonApi';
import progressApi from '../../api/progressApi';
import userApi from '../../api/userApi';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import { calcProgress } from '../../utils/calcProgress';

const StudentCoursesPage = () => {
  const { user } = useAuth();

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal Hủy đăng ký
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [courseToUnenroll, setCourseToUnenroll] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEnrolledCourses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Lấy danh sách enrollments của student
      const enrollments = await enrollmentApi.getByStudent(user.id);

      if (enrollments.length === 0) {
        setEnrolledCourses([]);
        setLoading(false);
        return;
      }

      // 2. Lấy danh sách giảng viên để hiển thị tên
      const instructors = await userApi.getAll({ role: 'instructor' });
      const instructorMap = {};
      instructors.forEach((inst) => {
        instructorMap[inst.id] = inst;
      });

      // 3. Lấy thông tin chi tiết từng khóa học, bài học và tiến độ
      const detailedCourses = await Promise.all(
        enrollments.map(async (enr) => {
          const [courseData, lessonList, progressList] = await Promise.all([
            courseApi.getById(enr.courseId),
            lessonApi.getByCourse(enr.courseId),
            progressApi.getByStudentAndCourse(user.id, enr.courseId),
          ]);

          const totalLessons = lessonList ? lessonList.length : 0;
          const completedLessons = progressList
            ? progressList.filter((p) => p.completed).length
            : 0;
          const progressPercent = calcProgress(completedLessons, totalLessons);

          return {
            enrollmentId: enr.id,
            enrolledAt: enr.enrolledAt,
            course: courseData,
            instructor: courseData ? instructorMap[courseData.instructorId] : null,
            totalLessons,
            completedLessons,
            progressPercent,
          };
        })
      );

      // Lọc bỏ những bản ghi khóa học không tồn tại nếu có
      setEnrolledCourses(detailedCourses.filter((item) => item.course));
    } catch (err) {
      setError(err.message || 'Lỗi khi tải danh sách khóa học của bạn');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEnrolledCourses();
  }, [fetchEnrolledCourses]);

  const handleOpenUnenroll = (item) => {
    setCourseToUnenroll(item);
    setShowConfirmModal(true);
  };

  const handleConfirmUnenroll = async () => {
    if (!courseToUnenroll) return;
    setActionLoading(true);
    try {
      await enrollmentApi.unenroll(courseToUnenroll.enrollmentId);
      toast.success(
        `Đã hủy đăng ký khóa học "${courseToUnenroll.course.title}" thành công!`
      );
      setShowConfirmModal(false);
      setCourseToUnenroll(null);
      fetchEnrolledCourses();
    } catch (err) {
      toast.error(err.message || 'Hủy đăng ký thất bại!');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Container className="py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">
            <i className="bi bi-mortarboard me-2"></i>Khóa Học Của Tôi
          </h3>
          <p className="text-muted small mb-0">
            Theo dõi tiến trình học tập và hoàn thành các bài học của bạn
          </p>
        </div>
        <Button as={Link} to="/" variant="outline-primary" size="sm">
          <i className="bi bi-plus-lg me-1"></i>Khám Phá Thêm Khóa Học
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Đang tải các khóa học bạn đã đăng ký..." />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : enrolledCourses.length === 0 ? (
        <Card className="text-center py-5 border-0 shadow-sm">
          <Card.Body className="py-5">
            <i className="bi bi-journal-x display-4 text-muted mb-3 d-block"></i>
            <h5 className="fw-bold text-secondary">
              Bạn chưa đăng ký khóa học nào!
            </h5>
            <p className="text-muted small mb-4">
              Hãy dạo qua danh mục khóa học để lựa chọn kỹ năng bạn muốn phát triển ngay hôm nay.
            </p>
            <Button as={Link} to="/" variant="primary">
              Xem Danh Mục Khóa Học Ngay
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {enrolledCourses.map((item) => (
            <Col key={item.enrollmentId}>
              <Card className="h-100 border-0 shadow-sm card-hover d-flex flex-column">
                <div style={{ position: 'relative', height: '170px' }}>
                  <Card.Img
                    variant="top"
                    src={
                      item.course.thumbnail ||
                      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'
                    }
                    alt={item.course.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                    <Badge bg="primary">{item.course.category}</Badge>
                  </div>
                </div>

                <Card.Body className="d-flex flex-column p-3">
                  <Card.Title className="h6 fw-bold mb-2">
                    <Link
                      to={`/student/courses/${item.course.id}/learn`}
                      className="text-dark text-decoration-none"
                    >
                      {item.course.title}
                    </Link>
                  </Card.Title>

                  {item.instructor && (
                    <div className="d-flex align-items-center text-muted small mb-3">
                      <img
                        src={
                          item.instructor.avatar ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
                        }
                        alt=""
                        className="rounded-circle me-2 border"
                        width="24"
                        height="24"
                        style={{ objectFit: 'cover' }}
                      />
                      <span>{item.instructor.name}</span>
                    </div>
                  )}

                  {/* Thanh tiến độ hoàn thành bài học */}
                  <div className="mt-auto pt-2 border-top">
                    <div className="d-flex justify-content-between align-items-center small mb-1">
                      <span className="fw-semibold text-secondary">Tiến độ học:</span>
                      <span className="fw-bold text-primary">
                        {item.completedLessons} / {item.totalLessons} bài ({item.progressPercent}%)
                      </span>
                    </div>

                    <ProgressBar
                      now={item.progressPercent}
                      label={`${item.progressPercent}%`}
                      variant={item.progressPercent === 100 ? 'success' : 'primary'}
                      style={{ height: '12px' }}
                      className="mb-3"
                    />

                    <div className="d-flex gap-2">
                      <Button
                        as={Link}
                        to={`/student/courses/${item.course.id}/learn`}
                        variant={item.progressPercent === 100 ? 'success' : 'primary'}
                        size="sm"
                        className="w-100"
                      >
                        {item.progressPercent === 0
                          ? 'Bắt Đầu Học'
                          : item.progressPercent === 100
                          ? 'Ôn Tập Lại'
                          : 'Tiếp Tục Học'}
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleOpenUnenroll(item)}
                        title="Hủy đăng ký khóa học này"
                      >
                        Hủy
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal Xác nhận Hủy đăng ký */}
      <ConfirmModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmUnenroll}
        title="Xác nhận hủy đăng ký khóa học"
        message={`Bạn có chắc chắn muốn hủy đăng ký khóa học "${courseToUnenroll?.course.title}" không?`}
        confirmText="Hủy Đăng Ký"
        confirmVariant="danger"
        loading={actionLoading}
      />
    </Container>
  );
};

export default StudentCoursesPage;
