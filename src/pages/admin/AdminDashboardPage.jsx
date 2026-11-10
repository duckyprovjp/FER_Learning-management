import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import courseApi from '../../api/courseApi';
import userApi from '../../api/userApi';
import enrollmentApi from '../../api/enrollmentApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatDate';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    coursesCount: 0,
    instructorsCount: 0,
    studentsCount: 0,
    enrollmentsCount: 0,
  });
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [courses, users, enrollments] = await Promise.all([
          courseApi.getAll(),
          userApi.getAll(),
          enrollmentApi.getAll(),
        ]);

        const instructors = users.filter((u) => u.role === 'instructor');
        const students = users.filter((u) => u.role === 'student');

        setStats({
          coursesCount: courses.length,
          instructorsCount: instructors.length,
          studentsCount: students.length,
          enrollmentsCount: enrollments.length,
        });

        // Tạo map để tra cứu thông tin sinh viên và khóa học
        const userMap = {};
        users.forEach((u) => {
          userMap[u.id] = u;
        });

        const courseMap = {};
        courses.forEach((c) => {
          courseMap[c.id] = c;
        });

        // Lấy 5 lượt đăng ký mới nhất
        const mappedEnrollments = [...enrollments]
          .reverse()
          .slice(0, 5)
          .map((enr) => ({
            ...enr,
            student: userMap[enr.studentId],
            course: courseMap[enr.courseId],
          }));

        setRecentEnrollments(mappedEnrollments);
      } catch (err) {
        setError(err.message || 'Lỗi khi tải dữ liệu thống kê');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Đang tải dữ liệu bảng điều khiển quản trị..." />;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Bảng Thống Kê Tổng Quan</h4>
          <p className="text-muted small mb-0">
            Xem nhanh chỉ số vận hành hệ thống khóa học FER202
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button as={Link} to="/admin/courses" variant="primary" size="sm">
            + Thêm Khóa Học
          </Button>
          <Button as={Link} to="/admin/users" variant="outline-primary" size="sm">
            + Thêm Người Dùng
          </Button>
        </div>
      </div>

      {/* 4 Card Thống Kê */}
      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}>
          <Card className="border-0 shadow-sm bg-primary text-white">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 small mb-1">TỔNG KHÓA HỌC</h6>
                  <h2 className="fw-bold mb-0">{stats.coursesCount}</h2>
                </div>
                <i className="bi bi-book fs-1 opacity-50"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} xl={3}>
          <Card className="border-0 shadow-sm bg-success text-white">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 small mb-1">GIẢNG VIÊN</h6>
                  <h2 className="fw-bold mb-0">{stats.instructorsCount}</h2>
                </div>
                <i className="bi bi-person-video3 fs-1 opacity-50"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} xl={3}>
          <Card className="border-0 shadow-sm bg-info text-white">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 small mb-1">HỌC VIÊN</h6>
                  <h2 className="fw-bold mb-0">{stats.studentsCount}</h2>
                </div>
                <i className="bi bi-mortarboard fs-1 opacity-50"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} xl={3}>
          <Card className="border-0 shadow-sm bg-warning text-dark">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted small mb-1">LƯỢT ĐĂNG KÝ HỌC</h6>
                  <h2 className="fw-bold mb-0">{stats.enrollmentsCount}</h2>
                </div>
                <i className="bi bi-card-checklist fs-1 opacity-50"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bảng lượt đăng ký gần đây */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0 text-dark">
            Lượt Đăng Ký Khóa Học Gần Đây
          </h6>
          <Badge bg="secondary">{recentEnrollments.length} lượt mới nhất</Badge>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Học viên</th>
                  <th>Khóa học</th>
                  <th>Thời gian đăng ký</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-muted">
                      Chưa có lượt đăng ký nào
                    </td>
                  </tr>
                ) : (
                  recentEnrollments.map((enr) => (
                    <tr key={enr.id}>
                      <td className="ps-3">
                        <div className="d-flex align-items-center">
                          <div>
                            <div className="fw-semibold text-dark">
                              {enr.student?.name || `ID #${enr.studentId}`}
                            </div>
                            <div className="text-muted small">
                              {enr.student?.email || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="fw-semibold text-primary">
                          {enr.course?.title || `Khóa học #${enr.courseId}`}
                        </span>
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
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
