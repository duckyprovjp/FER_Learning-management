import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import lessonApi from '../../api/lessonApi';

const LessonFormModal = ({
  show,
  onHide,
  onSuccess,
  courseId,
  lessonToEdit = null,
  nextOrder = 1,
}) => {
  const isEditing = Boolean(lessonToEdit);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    videoUrl: '',
    order: nextOrder,
    duration: '15:00',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (lessonToEdit) {
      setFormData({
        title: lessonToEdit.title || '',
        content: lessonToEdit.content || '',
        videoUrl: lessonToEdit.videoUrl || '',
        order: lessonToEdit.order || 1,
        duration: lessonToEdit.duration || '15:00',
      });
    } else {
      setFormData({
        title: '',
        content: '',
        videoUrl: 'https://www.youtube.com/embed/SqcY0GlETPk',
        order: nextOrder,
        duration: '20:00',
      });
    }
    setErrors({});
    setServerError('');
  }, [lessonToEdit, show, nextOrder]);

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
      newErrors.title = 'Vui lòng nhập tiêu đề bài học';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Vui lòng nhập nội dung bài học';
    }

    if (!formData.order || Number(formData.order) < 1) {
      newErrors.order = 'Thứ tự bài học phải là số lớn hơn hoặc bằng 1';
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
        courseId: Number(courseId),
        title: formData.title.trim(),
        content: formData.content.trim(),
        videoUrl:
          formData.videoUrl.trim() ||
          'https://www.youtube.com/embed/SqcY0GlETPk',
        order: Number(formData.order),
        duration: formData.duration.trim() || '15:00',
      };

      if (isEditing) {
        await lessonApi.update(lessonToEdit.id, payload);
        toast.success(`Cập nhật bài học "${formData.title}" thành công!`);
      } else {
        await lessonApi.create(payload);
        toast.success(`Thêm bài học "${formData.title}" thành công!`);
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
          {isEditing ? 'Chỉnh Sửa Bài Học' : 'Thêm Bài Học Mới'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit} noValidate>
        <Modal.Body className="p-4">
          {serverError && (
            <Alert variant="danger" className="py-2 small">
              {serverError}
            </Alert>
          )}

          <Form.Group className="mb-3" controlId="lessonTitle">
            <Form.Label className="fw-semibold small">Tiêu đề bài học *</Form.Label>
            <Form.Control
              type="text"
              name="title"
              placeholder="Ví dụ: Bài 1: Tổng quan về React Hooks"
              value={formData.title}
              onChange={handleChange}
              isInvalid={!!errors.title}
            />
            <Form.Control.Feedback type="invalid">
              {errors.title}
            </Form.Control.Feedback>
          </Form.Group>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <Form.Group controlId="lessonOrder">
                <Form.Label className="fw-semibold small">Thứ tự bài học *</Form.Label>
                <Form.Control
                  type="number"
                  name="order"
                  min="1"
                  value={formData.order}
                  onChange={handleChange}
                  isInvalid={!!errors.order}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.order}
                </Form.Control.Feedback>
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group controlId="lessonDuration">
                <Form.Label className="fw-semibold small">Thời lượng học</Form.Label>
                <Form.Control
                  type="text"
                  name="duration"
                  placeholder="Ví dụ: 20:30 hoặc 25 phút"
                  value={formData.duration}
                  onChange={handleChange}
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3" controlId="lessonVideoUrl">
            <Form.Label className="fw-semibold small">URL Video Embed (YouTube/Vimeo)</Form.Label>
            <Form.Control
              type="url"
              name="videoUrl"
              placeholder="https://www.youtube.com/embed/..."
              value={formData.videoUrl}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="lessonContent">
            <Form.Label className="fw-semibold small">Nội dung bài học *</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="content"
              placeholder="Nhập lý thuyết, ghi chú bài giảng..."
              value={formData.content}
              onChange={handleChange}
              isInvalid={!!errors.content}
            />
            <Form.Control.Feedback type="invalid">
              {errors.content}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Hủy Bỏ
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Đang lưu...' : isEditing ? 'Cập Nhật Bài Học' : 'Thêm Bài Học'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default LessonFormModal;
