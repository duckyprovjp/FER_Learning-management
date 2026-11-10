import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import courseApi from '../../api/courseApi';
import useAuth from '../../hooks/useAuth';
import { COURSE_CATEGORIES, COURSE_LEVELS, COURSE_STATUS } from '../../utils/constants';

const InstructorCourseModal = ({
  show,
  onHide,
  onSuccess,
  courseToEdit = null,
}) => {
  const { user } = useAuth();
  const isEditing = Boolean(courseToEdit);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: COURSE_CATEGORIES[0] || 'Frontend',
    level: COURSE_LEVELS[0] || 'Beginner',
    thumbnail: '',
    status: COURSE_STATUS.PUBLISHED || 'published',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (courseToEdit) {
      setFormData({
        title: courseToEdit.title || '',
        description: courseToEdit.description || '',
        category: courseToEdit.category || COURSE_CATEGORIES[0],
        level: courseToEdit.level || COURSE_LEVELS[0],
        thumbnail: courseToEdit.thumbnail || '',
        status: courseToEdit.status || 'published',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: COURSE_CATEGORIES[0] || 'Frontend',
        level: COURSE_LEVELS[0] || 'Beginner',
        thumbnail: '',
        status: 'published',
      });
    }
    setErrors({});
    setServerError('');
  }, [courseToEdit, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tên khóa học';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Vui lòng nhập mô tả khóa học';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        level: formData.level,
        instructorId: Number(user?.id),
        thumbnail:
          formData.thumbnail.trim() ||
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
        status: formData.status,
      };

      if (isEditing) {
        await courseApi.update(courseToEdit.id, payload);
        toast.success(`Cập nhật khóa học "${formData.title}" thành công!`);
      } else {
        await courseApi.create(payload);
        toast.success(`Tạo mới khóa học "${formData.title}" thành công!`);
      }

      onSuccess();
      onHide();
    } catch (err) {
      setServerError(err.message || 'Thao tác thất bại!');
      toast.error(err.message || 'Thao tác thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="h5 fw-bold mb-0">
          {isEditing ? 'Chỉnh Sửa Khóa Học Của Tôi' : 'Tạo Khóa Học Mới'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit} noValidate>
        <Modal.Body className="p-4">
          {serverError && (
            <Alert variant="danger" className="py-2 small">
              {serverError}
            </Alert>
          )}

          <Form.Group className="mb-3" controlId="instructorCourseTitle">
            <Form.Label className="fw-semibold small">Tiêu đề khóa học *</Form.Label>
            <Form.Control
              type="text"
              name="title"
              placeholder="Ví dụ: Xây dựng RESTful API với Express.js"
              value={formData.title}
              onChange={handleChange}
              isInvalid={!!errors.title}
            />
            <Form.Control.Feedback type="invalid">
              {errors.title}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="instructorCourseDesc">
            <Form.Label className="fw-semibold small">Mô tả tóm tắt *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              placeholder="Nhập mục tiêu và nội dung chính của khóa học..."
              value={formData.description}
              onChange={handleChange}
              isInvalid={!!errors.description}
            />
            <Form.Control.Feedback type="invalid">
              {errors.description}
            </Form.Control.Feedback>
          </Form.Group>

          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <Form.Group controlId="instructorCourseCategory">
                <Form.Label className="fw-semibold small">Danh mục</Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {COURSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>

            <div className="col-md-4">
              <Form.Group controlId="instructorCourseLevel">
                <Form.Label className="fw-semibold small">Cấp độ</Form.Label>
                <Form.Select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                >
                  {COURSE_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>

            <div className="col-md-4">
              <Form.Group controlId="instructorCourseStatus">
                <Form.Label className="fw-semibold small">Trạng thái phát hành</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="published">Công khai (published)</option>
                  <option value="draft">Bản nháp (draft)</option>
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3" controlId="instructorCourseThumbnail">
            <Form.Label className="fw-semibold small">URL Ảnh Thumbnail</Form.Label>
            <Form.Control
              type="url"
              name="thumbnail"
              placeholder="https://images.unsplash.com/..."
              value={formData.thumbnail}
              onChange={handleChange}
            />
            <Form.Text className="text-muted small">
              Để trống nếu muốn hệ thống sử dụng ảnh bìa mặc định
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Hủy Bỏ
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Đang lưu...' : isEditing ? 'Cập Nhật Khóa Học' : 'Tạo Khóa Học'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default InstructorCourseModal;
