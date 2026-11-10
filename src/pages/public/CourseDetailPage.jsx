import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, ListGroup, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import courseApi from '../../api/courseApi';
import userApi from '../../api/userApi';
import lessonApi from '../../api/lessonApi';
import enrollmentApi from '../../api/enrollmentApi';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [course, setCourse] = useState(null);
  const [instructor, setInstructor] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      setError(null);
      try {
        const courseData = await courseApi.getById(id);
        if (!courseData) {
          setError('Không tìm thấy thông tin khóa học');
          return;
        }
        setCourse(courseData);

        // Lấy thông tin giảng viên và danh sách bài học song song
        const promises = [
          lessonApi.getByCourse(courseData.id),
        ];
        if (courseData.instructorId) {
          promises.push(userApi.getById(courseData.instructorId));
        }

        const [lessonList, instructorData] = await Promise.all(promises);
        setLessons(lessonList || []);
        if (instructorData) setInstructor(instructorData);

        // Kiểm tra xem sinh viên đã đăng ký khóa này chưa
        if (isAuthenticated && user?.role === 'student') {
          const enrollment = await enrollmentApi.checkEnrollment(user.id, courseData.id);
          if (enrollment) {
            setIsEnrolled(true);
            setEnrollmentId(enrollment.id);
          }
        }
      } catch (err) {
        setError(err.message || 'Lỗi khi tải thông tin khóa học');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id, isAuthenticated, user]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để đăng ký khóa học!');
      navigate('/login', { state: { from: `/courses/${id}` } });
      return;
    }

    if (user.role !== 'student') {
      toast.warning('Chỉ có tài khoản Học viên mới có thể đăng ký khóa học!');
      return;
    }

    setEnrolling(true);
    try {
      const res = await enrollmentApi.enroll(user.id, course.id);
      setIsEnrolled(true);
      setEnrollmentId(res.id);
      toast.success('Chúc mừng! Bạn đã đăng ký khóa học thành công.');
    } catch (err) {
      toast.error(err.message || 'Đăng ký khóa học thất bại!');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Đang tải chi tiết khóa học..." minHeight="400px" />;
  }

  if (error || !course) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          {error || 'Khóa học không tồn tại!'}
        </Alert>
        <div className="text-center mt-3">
          <Button as={Link} to="/" variant="primary">
            Quay lại trang chủ
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Breadcrumb điều hướng */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none">Trang chủ</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {course.title}
          </li>
        </ol>
      </nav>

      <Row className="g-4">
        {/* Cột trái: Thông tin chính và Đề cương bài học */}
        <Col lg={8}>
          <div className="bg-white p-4 rounded shadow-sm border mb-4">
            <div className="mb-3">
              <Badge bg="primary" className="me-2 fs-6">
                {course.category}
              </Badge>
              <Badge bg="secondary" className="fs-6">
                Cấp độ: {course.level}
              </Badge>
            </div>

            <h2 className="fw-bold mb-3 text-dark">{course.title}</h2>
            <p className="lead text-secondary">{course.description}</p>
          </div>

          {/* Đề cương bài giảng */}
          <div className="bg-white p-4 rounded shadow-sm border">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Đề Cương Khóa Học</h5>
              <span className="badge bg-light text-dark border">
                {lessons.length} bài học
              </span>
            </div>

            {lessons.length === 0 ? (
              <p className="text-muted fst-italic mb-0">
                Chưa có bài học nào được cập nhật cho khóa này.
              </p>
            ) : (
              <ListGroup variant="flush">
                {lessons.map((lesson, idx) => (
                  <ListGroup.Item
                    key={lesson.id}
                    className="d-flex justify-content-between align-items-center px-2 py-3"
                  >
                    <div className="d-flex align-items-center">
                      <span className="badge bg-primary rounded-pill me-3">
                        {idx + 1}
                      </span>
                      <span className="fw-semibold text-dark">{lesson.title}</span>
                    </div>
                    <span className="text-muted small">
                      <i className="bi bi-clock me-1"></i>
                      {lesson.duration || 'N/A'}
                    </span>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </div>
        </Col>

        {/* Cột phải: Card hành động & Giảng viên */}
        <Col lg={4}>
          <Card className="shadow-sm border-0 mb-4 sticky-top" style={{ top: '80px' }}>
            <Card.Img
              variant="top"
              src={
                course.thumbnail ||
                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'
              }
              alt={course.title}
              style={{ height: '220px', objectFit: 'cover' }}
            />
            <Card.Body className="p-4">
              <h5 className="fw-bold text-success mb-3">Miễn phí</h5>

              {isEnrolled ? (
                <div className="d-grid gap-2">
                  <div className="alert alert-success py-2 text-center small mb-2">
                    <i className="bi bi-check-circle-fill me-1"></i> Bạn đã đăng ký khóa học này
                  </div>
                  <Button
                    as={Link}
                    to={`/student/courses/${course.id}/learn`}
                    variant="success"
                    size="lg"
                  >
                    Vào Học Ngay
                  </Button>
                </div>
              ) : (
                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleEnroll}
                    disabled={enrolling}
                  >
                    {enrolling ? 'Đang xử lý...' : 'Đăng Ký Khóa Học'}
                  </Button>
                </div>
              )}

              {/* Thông tin giảng viên */}
              {instructor && (
                <div className="border-top pt-3 mt-4">
                  <h6 className="fw-bold mb-3 text-secondary">Giảng viên hướng dẫn</h6>
                  <div className="d-flex align-items-center">
                    <div>
                      <div className="fw-bold text-dark">
                        <i className="bi bi-person-circle me-2 text-primary"></i>
                        {instructor.name}
                      </div>
                      <div className="text-muted small ps-4">{instructor.email}</div>
                    </div>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CourseDetailPage;
