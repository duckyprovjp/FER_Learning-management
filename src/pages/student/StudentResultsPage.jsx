import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Table, Badge, Alert, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import enrollmentApi from '../../api/enrollmentApi';
import courseApi from '../../api/courseApi';
import assignmentApi from '../../api/assignmentApi';
import submissionApi from '../../api/submissionApi';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatDate';

const StudentResultsPage = () => {
  const { user } = useAuth();

  const [courseResults, setCourseResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResultsData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Lấy danh sách khóa học sinh viên đã đăng ký
      const enrollments = await enrollmentApi.getByStudent(user.id);
      if (enrollments.length === 0) {
        setCourseResults([]);
        setLoading(false);
        return;
      }

      // 2. Lấy toàn bộ bài nộp của sinh viên
      const allSubmissions = await submissionApi.getByStudent(user.id);
      const subMap = {};
      allSubmissions.forEach((s) => {
        subMap[s.assignmentId] = s;
      });

      // 3. Lấy thông tin từng khóa và danh sách bài tập tương ứng
      const results = await Promise.all(
        enrollments.map(async (enr) => {
          const [courseData, assignments] = await Promise.all([
            courseApi.getById(enr.courseId),
            assignmentApi.getByCourse(enr.courseId),
          ]);

          if (!courseData) return null;

          // Ghép bài tập với bài nộp
          const assignmentDetails = (assignments || []).map((asg) => {
            const sub = subMap[asg.id] || null;
            const isGraded = sub?.score !== null && sub?.score !== undefined;
            return {
              ...asg,
              submission: sub,
              isSubmitted: Boolean(sub),
              isGraded,
              score: isGraded ? sub.score : null,
              feedback: sub?.feedback || null,
            };
          });

          // Tính Điểm Trung Bình (ĐTB) của khóa học
          const gradedList = assignmentDetails.filter((a) => a.isGraded);
          let avgScore = null;
          if (gradedList.length > 0) {
            const totalScore = gradedList.reduce((acc, curr) => acc + curr.score, 0);
            avgScore = (totalScore / gradedList.length).toFixed(1);
          }

          return {
            course: courseData,
            assignments: assignmentDetails,
            totalAssignments: assignmentDetails.length,
            gradedCount: gradedList.length,
            avgScore,
          };
        })
      );

      setCourseResults(results.filter(Boolean));
    } catch (err) {
      setError(err.message || 'Lỗi khi tải bảng kết quả học tập');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchResultsData();
  }, [fetchResultsData]);

  if (loading) {
    return <LoadingSpinner text="Đang tổng hợp bảng điểm kết quả học tập..." />;
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">
            <i className="bi bi-bar-chart-line me-2"></i>Kết Quả Học Tập & Bảng Điểm
          </h3>
          <p className="text-muted small mb-0">
            Chi tiết điểm số từng bài tập, điểm trung bình và nhận xét của Giảng viên
          </p>
        </div>
        <Button as={Link} to="/student/courses" variant="outline-primary" size="sm">
          Vào phòng học →
        </Button>
      </div>

      {courseResults.length === 0 ? (
        <Card className="text-center py-5 border-0 shadow-sm">
          <Card.Body className="py-5">
            <i className="bi bi-clipboard-data display-4 text-muted mb-3 d-block"></i>
            <h5 className="fw-bold text-secondary">Chưa có dữ liệu kết quả học tập</h5>
            <p className="text-muted small mb-3">
              Bạn chưa đăng ký khóa học nào hoặc các khóa học chưa có bài tập được giao.
            </p>
            <Button as={Link} to="/" variant="primary">
              Xem danh mục khóa học
            </Button>
          </Card.Body>
        </Card>
      ) : (
        courseResults.map((result) => (
          <Card key={result.course.id} className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white py-3">
              <Row className="align-items-center">
                <Col md={8}>
                  <div className="d-flex align-items-center">
                    <Badge bg="primary" className="me-2">
                      {result.course.category}
                    </Badge>
                    <h5 className="fw-bold mb-0 text-dark">
                      <Link
                        to={`/student/courses/${result.course.id}/learn`}
                        className="text-decoration-none text-dark"
                      >
                        {result.course.title}
                      </Link>
                    </h5>
                  </div>
                </Col>

                {/* Điểm trung bình môn học */}
                <Col md={4} className="text-md-end mt-2 mt-md-0">
                  <div className="d-inline-flex align-items-center bg-light px-3 py-1 rounded border">
                    <span className="small text-muted me-2">Điểm Trung Bình (ĐTB):</span>
                    {result.avgScore !== null ? (
                      <Badge
                        bg={Number(result.avgScore) >= 5 ? 'success' : 'danger'}
                        className="fs-6"
                      >
                        {result.avgScore} / 10
                      </Badge>
                    ) : (
                      <span className="small text-secondary fst-italic">
                        Chưa có bài nào được chấm
                      </span>
                    )}
                  </div>
                </Col>
              </Row>
            </Card.Header>

            <Card.Body className="p-0">
              {result.assignments.length === 0 ? (
                <div className="p-4 text-center text-muted small fst-italic">
                  Khóa học này hiện không có bài tập nào.
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-3" style={{ minWidth: '220px' }}>
                          Bài tập
                        </th>
                        <th>Hạn nộp</th>
                        <th>Ngày nộp</th>
                        <th>Điểm số</th>
                        <th>Trạng thái</th>
                        <th style={{ minWidth: '250px' }}>
                          Nhận xét của Giảng viên (Feedback)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.assignments.map((asg) => (
                        <tr key={asg.id}>
                          <td className="ps-3">
                            <div className="fw-semibold text-dark">{asg.title}</div>
                            <div className="text-muted small">
                              Thang điểm tối đa: {asg.maxScore}
                            </div>
                          </td>
                          <td className="text-muted small">
                            {formatDate(asg.dueDate, true)}
                          </td>
                          <td className="text-muted small">
                            {asg.submission?.submittedAt
                              ? formatDate(asg.submission.submittedAt, true)
                              : '---'}
                          </td>
                          <td>
                            {asg.isGraded ? (
                              <strong className="text-success fs-6">
                                {asg.score} / {asg.maxScore}
                              </strong>
                            ) : (
                              <span className="text-muted">---</span>
                            )}
                          </td>
                          <td>
                            {!asg.isSubmitted ? (
                              <Badge bg="danger">Chưa nộp bài</Badge>
                            ) : asg.isGraded ? (
                              <Badge bg="success">
                                <i className="bi bi-check-circle me-1"></i>Đã có điểm
                              </Badge>
                            ) : (
                              <Badge bg="warning" text="dark">
                                <i className="bi bi-hourglass-split me-1"></i>Đã nộp (Chờ chấm)
                              </Badge>
                            )}
                          </td>
                          <td>
                            {asg.feedback ? (
                              <div className="p-2 bg-light rounded border small text-dark">
                                <i className="bi bi-chat-left-quote me-1 text-primary"></i>"{asg.feedback}"
                              </div>
                            ) : (
                              <span className="text-muted small fst-italic">
                                Chưa có phản hồi
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
};

export default StudentResultsPage;
