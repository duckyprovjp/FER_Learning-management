import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Card, Table, Badge, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import courseApi from '../../api/courseApi';
import assignmentApi from '../../api/assignmentApi';
import submissionApi from '../../api/submissionApi';
import userApi from '../../api/userApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import GradingModal from '../../components/assignment/GradingModal';
import { formatDate } from '../../utils/formatDate';

const InstructorGradingPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const initialAssignmentId = searchParams.get('assignmentId') || '';

  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bộ lọc
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(initialAssignmentId);
  const [statusFilter, setStatusFilter] = useState(''); // '' | 'graded' | 'ungraded'

  // Modal chấm điểm
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Tải danh sách bài nộp và liên kết
  const fetchGradingData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [courseData, assignmentList, allUsers] = await Promise.all([
        courseApi.getById(id),
        assignmentApi.getByCourse(id),
        userApi.getAll(),
      ]);

      setCourse(courseData);
      setAssignments(assignmentList || []);
      setUsers(allUsers || []);

      // Lấy tất cả bài nộp của các bài tập thuộc khóa học này
      const allSubmissions = [];
      await Promise.all(
        assignmentList.map(async (asg) => {
          const subs = await submissionApi.getByAssignment(asg.id);
          allSubmissions.push(...subs);
        })
      );
      setSubmissions(allSubmissions);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải dữ liệu chấm điểm');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGradingData();
  }, [fetchGradingData]);

  // Map assignments và users
  const assignmentMap = useMemo(() => {
    const map = {};
    assignments.forEach((a) => {
      map[a.id] = a;
    });
    return map;
  }, [assignments]);

  const userMap = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      map[u.id] = u;
    });
    return map;
  }, [users]);

  // Lọc bài nộp
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      // Lọc theo bài tập
      if (selectedAssignmentId && String(sub.assignmentId) !== String(selectedAssignmentId)) {
        return false;
      }

      // Lọc theo trạng thái chấm
      const isGraded = sub.score !== null && sub.score !== undefined;
      if (statusFilter === 'graded' && !isGraded) return false;
      if (statusFilter === 'ungraded' && isGraded) return false;

      return true;
    });
  }, [submissions, selectedAssignmentId, statusFilter]);

  const handleOpenGrading = (submission) => {
    setSelectedSubmission(submission);
    setShowGradingModal(true);
  };

  if (loading) {
    return <LoadingSpinner text="Đang tải danh sách bài nộp cần chấm..." />;
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
              <li className="breadcrumb-item">
                <Link to={`/instructor/courses/${course.id}`} className="text-decoration-none">
                  {course.title}
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Chấm điểm bài nộp
              </li>
            </ol>
          </nav>
          <h4 className="fw-bold mb-0 text-dark">
            Bảng Chấm Điểm & Phản Hồi Bài Nộp
          </h4>
        </div>
        <Button
          as={Link}
          to={`/instructor/courses/${course.id}`}
          variant="outline-secondary"
          size="sm"
        >
          ← Quay Lại Nội Dung Khóa
        </Button>
      </div>

      {/* Thanh bộ lọc bài tập & trạng thái */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-3">
          <Row className="g-3">
            <Col md={7}>
              <Form.Group controlId="filterAssignment">
                <Form.Label className="fw-semibold small">Lọc theo Bài tập</Form.Label>
                <Form.Select
                  value={selectedAssignmentId}
                  onChange={(e) => setSelectedAssignmentId(e.target.value)}
                >
                  <option value="">-- Tất cả bài tập trong khóa ({assignments.length}) --</option>
                  {assignments.map((asg) => (
                    <option key={asg.id} value={asg.id}>
                      {asg.title} (Thang điểm: {asg.maxScore})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={5}>
              <Form.Group controlId="filterStatus">
                <Form.Label className="fw-semibold small">Trạng thái chấm điểm</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">-- Tất cả trạng thái --</option>
                  <option value="ungraded">Chưa chấm (Chờ chấm điểm)</option>
                  <option value="graded">Đã chấm điểm</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Bảng danh sách bài nộp */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0 text-dark">
            Danh Sách Bài Nộp ({filteredSubmissions.length})
          </h6>
          <div className="d-flex gap-2">
            <Badge bg="warning" text="dark">
              Chưa chấm:{' '}
              {submissions.filter((s) => s.score === null || s.score === undefined).length}
            </Badge>
            <Badge bg="success">
              Đã chấm:{' '}
              {submissions.filter((s) => s.score !== null && s.score !== undefined).length}
            </Badge>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox display-4 text-muted mb-3 d-block"></i>
              <h6>Chưa có bài nộp nào phù hợp với bộ lọc hiện tại</h6>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3" style={{ minWidth: '220px' }}>
                      Học viên
                    </th>
                    <th style={{ minWidth: '220px' }}>Bài tập</th>
                    <th>Thời gian nộp</th>
                    <th>Điểm số</th>
                    <th>Nhận xét của bạn</th>
                    <th className="text-end pe-3">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((sub) => {
                    const student = userMap[sub.studentId];
                    const assignment = assignmentMap[sub.assignmentId];
                    const isGraded = sub.score !== null && sub.score !== undefined;

                    return (
                      <tr key={sub.id}>
                        <td className="ps-3">
                          <div className="d-flex align-items-center">
                            <img
                              src={
                                student?.avatar ||
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
                                {student?.name || `ID #${sub.studentId}`}
                              </div>
                              <div className="text-muted small">
                                {student?.email || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="fw-semibold text-primary">
                            {assignment?.title || `Bài tập #${sub.assignmentId}`}
                          </div>
                          <div className="text-muted small">
                            Thang điểm: {assignment?.maxScore || 10}
                          </div>
                        </td>
                        <td className="text-muted small">
                          {formatDate(sub.submittedAt, true)}
                        </td>
                        <td>
                          {isGraded ? (
                            <Badge bg="success" className="fs-6">
                              {sub.score} / {assignment?.maxScore || 10}
                            </Badge>
                          ) : (
                            <Badge bg="warning" text="dark">
                              Chờ chấm điểm
                            </Badge>
                          )}
                        </td>
                        <td>
                          {sub.feedback ? (
                            <span className="text-dark small truncate-2-lines" title={sub.feedback}>
                              "{sub.feedback}"
                            </span>
                          ) : (
                            <span className="text-muted small fst-italic">
                              Chưa có nhận xét
                            </span>
                          )}
                        </td>
                        <td className="text-end pe-3">
                          <Button
                            variant={isGraded ? 'outline-primary' : 'success'}
                            size="sm"
                            onClick={() => handleOpenGrading(sub)}
                          >
                            {isGraded ? 'Sửa Điểm' : 'Chấm Điểm'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal Chấm Điểm */}
      {selectedSubmission && (
        <GradingModal
          show={showGradingModal}
          onHide={() => {
            setShowGradingModal(false);
            setSelectedSubmission(null);
          }}
          onSuccess={fetchGradingData}
          submission={selectedSubmission}
          assignment={assignmentMap[selectedSubmission.assignmentId]}
          student={userMap[selectedSubmission.studentId]}
        />
      )}
    </div>
  );
};

export default InstructorGradingPage;
