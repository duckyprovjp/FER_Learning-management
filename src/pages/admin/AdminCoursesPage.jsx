import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Table, Badge, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import courseApi from '../../api/courseApi';
import userApi from '../../api/userApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import CourseFormModal from '../../components/admin/CourseFormModal';
import useDebounce from '../../hooks/useDebounce';
import { formatDate } from '../../utils/formatDate';

const AdminCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bộ lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modals state
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 350);

  // Tải danh sách khóa học và danh sách giảng viên
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [coursesData, instructorsData] = await Promise.all([
        courseApi.getAll(),
        userApi.getAll({ role: 'instructor' }),
      ]);
      setCourses(coursesData);
      setInstructors(instructorsData);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Map instructors theo ID
  const instructorMap = useMemo(() => {
    const map = {};
    instructors.forEach((inst) => {
      map[inst.id] = inst;
    });
    return map;
  }, [instructors]);

  // Lọc khóa học
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (categoryFilter && c.category !== categoryFilter) {
        return false;
      }
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase();
        return (
          c.title?.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [courses, categoryFilter, debouncedSearch]);

  // Mở modal tạo mới
  const handleCreate = () => {
    setCourseToEdit(null);
    setShowCourseModal(true);
  };

  // Mở modal sửa / gán giảng viên
  const handleEdit = (course) => {
    setCourseToEdit(course);
    setShowCourseModal(true);
  };

  // Mở modal xóa
  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setShowConfirmModal(true);
  };

  // Xác nhận xóa khóa học
  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    setActionLoading(true);
    try {
      await courseApi.delete(courseToDelete.id);
      toast.success(`Đã xóa khóa học "${courseToDelete.title}" thành công!`);
      setShowConfirmModal(false);
      setCourseToDelete(null);
      fetchData();
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
          <h4 className="fw-bold mb-1">Quản Lý Khóa Học</h4>
          <p className="text-muted small mb-0">
            Thêm, sửa, xóa khóa học và gán giảng viên phụ trách
          </p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          + Tạo Khóa Học Mới
        </Button>
      </div>

      {/* Bộ lọc và tìm kiếm */}
      <Card className="border-0 shadow-sm mb-3">
        <Card.Body className="p-3">
          <Row className="g-2">
            <Col md={8}>
              <Form.Control
                type="text"
                placeholder="Tìm kiếm theo tiêu đề khóa học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col md={4}>
              <Form.Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">-- Tất cả danh mục --</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Fullstack">Fullstack</option>
                <option value="Database">Database</option>
                <option value="Mobile">Mobile</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Bảng danh sách khóa học */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <LoadingSpinner text="Đang nạp danh sách khóa học..." />
          ) : error ? (
            <Alert variant="danger" className="m-3 text-center">
              {error}
            </Alert>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-search display-6 text-muted mb-2 d-block"></i>
              <h6>Không tìm thấy khóa học nào phù hợp</h6>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3" style={{ minWidth: '280px' }}>
                      Khóa học
                    </th>
                    <th>Danh mục & Cấp độ</th>
                    <th>Giảng viên phụ trách</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th className="text-end pe-3">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((c) => {
                    const assignedInstructor = instructorMap[c.instructorId];
                    return (
                      <tr key={c.id}>
                        <td className="ps-3">
                          <div className="d-flex align-items-center">
                            <img
                              src={
                                c.thumbnail ||
                                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'
                              }
                              alt=""
                              className="rounded me-3 border"
                              width="54"
                              height="40"
                              style={{ objectFit: 'cover' }}
                            />
                            <div>
                              <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '240px' }}>
                                {c.title}
                              </div>
                              <div className="text-muted small">ID: #{c.id}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <Badge bg="primary" className="me-1">
                              {c.category}
                            </Badge>
                            <Badge bg="secondary">{c.level}</Badge>
                          </div>
                        </td>
                        <td>
                          {assignedInstructor ? (
                            <div className="d-flex align-items-center">
                              <img
                                src={
                                  assignedInstructor.avatar ||
                                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
                                }
                                alt=""
                                className="rounded-circle me-2 border"
                                width="28"
                                height="28"
                                style={{ objectFit: 'cover' }}
                              />
                              <div>
                                <div className="fw-semibold text-dark small">
                                  {assignedInstructor.name}
                                </div>
                                <div className="text-muted small">
                                  {assignedInstructor.email}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-danger small fst-italic">
                              Chưa gán giảng viên
                            </span>
                          )}
                        </td>
                        <td>
                          <Badge
                            bg={c.status === 'published' ? 'success' : 'secondary'}
                          >
                            {c.status === 'published' ? 'Công khai' : 'Bản nháp'}
                          </Badge>
                        </td>
                        <td className="text-muted small">
                          {formatDate(c.createdAt)}
                        </td>
                        <td className="text-end pe-3">
                          <div className="d-flex justify-content-end gap-1">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEdit(c)}
                              title="Chỉnh sửa & Gán giảng viên"
                            >
                              <i className="bi bi-pencil me-1"></i> Gán / Sửa
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteClick(c)}
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
          )}
        </Card.Body>
      </Card>

      {/* Modal Thêm / Chỉnh sửa khóa học & Gán giảng viên */}
      <CourseFormModal
        show={showCourseModal}
        onHide={() => setShowCourseModal(false)}
        onSuccess={fetchData}
        courseToEdit={courseToEdit}
        instructors={instructors}
      />

      {/* Modal xác nhận xóa */}
      <ConfirmModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa khóa học"
        message={`Bạn có chắc chắn muốn xóa khóa học "${courseToDelete?.title}" không? Thao tác này sẽ xóa toàn bộ bài học và bài tập liên quan.`}
        confirmText="Xóa Khóa Học"
        confirmVariant="danger"
        loading={actionLoading}
      />
    </div>
  );
};

export default AdminCoursesPage;
