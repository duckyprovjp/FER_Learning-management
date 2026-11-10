import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, ProgressBar, ListGroup, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import courseApi from '../../api/courseApi';
import lessonApi from '../../api/lessonApi';
import progressApi from '../../api/progressApi';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { calcProgress } from '../../utils/calcProgress';

const StudentLearningPage = () => {
  const { courseId } = useParams();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progressRecords, setProgressRecords] = useState([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Tải toàn bộ dữ liệu khóa học, bài học và tiến độ
  const fetchLearningData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [courseData, lessonList, progressList] = await Promise.all([
        courseApi.getById(courseId),
        lessonApi.getByCourse(courseId),
        progressApi.getByStudentAndCourse(user.id, courseId),
      ]);

      setCourse(courseData);
      setLessons(lessonList || []);
      setProgressRecords(progressList || []);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải dữ liệu bài học');
    } finally {
      setLoading(false);
    }
  }, [courseId, user]);

  useEffect(() => {
    fetchLearningData();
  }, [fetchLearningData]);

  // Tạo Set chứa ID các bài học đã hoàn thành
  const completedLessonIds = useMemo(() => {
    const set = new Set();
    progressRecords.forEach((p) => {
      if (p.completed) set.add(Number(p.lessonId));
    });
    return set;
  }, [progressRecords]);

  // Tiến độ hoàn thành khóa học
  const totalLessons = lessons.length;
  const completedCount = completedLessonIds.size;
  const progressPercent = calcProgress(completedCount, totalLessons);

  const currentLesson = lessons[currentLessonIndex] || null;
  const isCurrentLessonCompleted = currentLesson
    ? completedLessonIds.has(Number(currentLesson.id))
    : false;

  // Xử lý Đánh dấu Hoàn thành / Bỏ hoàn thành bài học
  const handleToggleComplete = async () => {
    if (!currentLesson || actionLoading) return;
    setActionLoading(true);
    const newCompleted = !isCurrentLessonCompleted;

    try {
      await progressApi.toggleLessonProgress({
        studentId: user.id,
        courseId,
        lessonId: currentLesson.id,
        completed: newCompleted,
      });

      // Cập nhật state cục bộ ngay lập tức
      setProgressRecords((prev) => {
        const existingIndex = prev.findIndex(
          (p) => Number(p.lessonId) === Number(currentLesson.id)
        );
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            completed: newCompleted,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              studentId: Number(user.id),
              courseId: Number(courseId),
              lessonId: Number(currentLesson.id),
              completed: newCompleted,
            },
          ];
        }
      });

      if (newCompleted) {
        toast.success(`Chúc mừng! Bạn đã hoàn thành "${currentLesson.title}"`);
      } else {
        toast.info(`Đã bỏ đánh dấu hoàn thành "${currentLesson.title}"`);
      }
    } catch (err) {
      toast.error(err.message || 'Cập nhật tiến độ thất bại!');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Đang chuẩn bị phòng học trực tuyến..." minHeight="450px" />;
  }

  if (error || !course) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          {error || 'Khóa học không tồn tại!'}
        </Alert>
        <div className="text-center mt-3">
          <Button as={Link} to="/student/courses" variant="primary">
            Quay lại Khóa học của tôi
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid="lg" className="py-3">
      {/* Header điều hướng */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-1">
              <li className="breadcrumb-item">
                <Link to="/student/courses" className="text-decoration-none">
                  Khóa học của tôi
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {course.title}
              </li>
            </ol>
          </nav>
          <h5 className="fw-bold mb-0 text-dark">{course.title}</h5>
        </div>
        <Button as={Link} to="/student/courses" variant="outline-secondary" size="sm">
          ← Danh sách khóa học
        </Button>
      </div>

      <Row className="g-4">
        {/* CỘT TRÁI: VIDEO & NỘI DUNG BÀI HỌC & BÀI TẬP */}
        <Col lg={8}>
          {currentLesson ? (
            <Card className="border-0 shadow-sm mb-4">
              {/* Trình chiếu Video bài giảng */}
              <div
                className="ratio ratio-16x9 bg-dark rounded-top"
                style={{ overflow: 'hidden' }}
              >
                {currentLesson.videoUrl ? (
                  <iframe
                    src={currentLesson.videoUrl}
                    title={currentLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="d-flex justify-content-center align-items-center text-white-50">
                    <span>Không có video bài giảng</span>
                  </div>
                )}
              </div>

              <Card.Body className="p-4">
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                  <div>
                    <span className="badge bg-primary me-2">
                      Bài {currentLesson.order}
                    </span>
                    <span className="badge bg-light text-dark border">
                      <i className="bi bi-clock me-1"></i>{currentLesson.duration || 'N/A'}
                    </span>
                  </div>

                  {/* Nút Đánh dấu hoàn thành bài học */}
                  <Button
                    variant={isCurrentLessonCompleted ? 'success' : 'outline-primary'}
                    onClick={handleToggleComplete}
                    disabled={actionLoading}
                    className="fw-semibold"
                  >
                    {isCurrentLessonCompleted ? (
                      <>
                        <i className="bi bi-check-circle-fill me-1"></i>Đã hoàn thành
                      </>
                    ) : (
                      'Đánh dấu hoàn thành'
                    )}
                  </Button>
                </div>

                <h4 className="fw-bold mb-3">{currentLesson.title}</h4>

                {/* Nội dung lý thuyết */}
                <div className="bg-light p-3 rounded border mb-4">
                  <h6 className="fw-bold text-secondary mb-2">
                    <i className="bi bi-book me-2"></i>Nội dung bài học:
                  </h6>
                  <p
                    className="mb-0 text-dark"
                    style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7' }}
                  >
                    {currentLesson.content}
                  </p>
                </div>

                {/* Điều hướng bài trước / bài tiếp */}
                <div className="d-flex justify-content-between border-top pt-3">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={currentLessonIndex === 0}
                    onClick={() => setCurrentLessonIndex((prev) => prev - 1)}
                  >
                    ← Bài trước
                  </Button>
                  <span className="text-muted small align-self-center">
                    Bài {currentLessonIndex + 1} / {lessons.length}
                  </span>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    disabled={currentLessonIndex === lessons.length - 1}
                    onClick={() => setCurrentLessonIndex((prev) => prev + 1)}
                  >
                    Bài tiếp theo →
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ) : (
            <Alert variant="info">Khóa học này chưa có bài học nào được đăng tải.</Alert>
          )}

        </Col>

        {/* CỘT PHẢI: TIẾN ĐỘ & DANH SÁCH BÀI HỌC */}
        <Col lg={4}>
          <div className="sticky-top" style={{ top: '80px', zIndex: 10 }}>
            {/* Card Tiến độ */}
            <Card className="border-0 shadow-sm mb-3">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <h6 className="fw-bold mb-0">Tiến Độ Khóa Học</h6>
                  <span className="fw-bold text-primary">{progressPercent}%</span>
                </div>
                <ProgressBar
                  now={progressPercent}
                  variant={progressPercent === 100 ? 'success' : 'primary'}
                  style={{ height: '10px' }}
                  className="my-2"
                />
                <span className="text-muted small">
                  Đã hoàn thành {completedCount} trên tổng số {totalLessons} bài
                </span>
              </Card.Body>
            </Card>

            {/* Danh sách bài học */}
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white py-3">
                <h6 className="fw-bold mb-0">Danh Sách Bài Học ({lessons.length})</h6>
              </Card.Header>
              <ListGroup
                variant="flush"
                style={{ maxHeight: '480px', overflowY: 'auto' }}
              >
                {lessons.map((lesson, index) => {
                  const isCompleted = completedLessonIds.has(Number(lesson.id));
                  const isCurrent = index === currentLessonIndex;

                  return (
                    <ListGroup.Item
                      key={lesson.id}
                      action
                      active={isCurrent}
                      onClick={() => setCurrentLessonIndex(index)}
                      className="d-flex justify-content-between align-items-center py-2 px-3"
                    >
                      <div className="d-flex align-items-center text-truncate me-2">
                        <span className="me-2">
                          {isCompleted ? (
                            <i className="bi bi-check-circle-fill text-success"></i>
                          ) : (
                            <i className="bi bi-circle text-muted"></i>
                          )}
                        </span>
                        <div className="text-truncate">
                          <div
                            className={`small fw-semibold ${
                              isCurrent ? 'text-white' : 'text-dark'
                            }`}
                          >
                            Bài {lesson.order}: {lesson.title}
                          </div>
                          <span
                            className={`small ${
                              isCurrent ? 'text-white-50' : 'text-muted'
                            }`}
                          >
                            <i className="bi bi-clock me-1"></i>{lesson.duration || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentLearningPage;
