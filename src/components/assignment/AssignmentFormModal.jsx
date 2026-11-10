import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import assignmentApi from '../../api/assignmentApi';

const AssignmentFormModal = ({
  show,
  onHide,
  onSuccess,
  courseId,
  assignmentToEdit = null,
}) => {
  const isEditing = Boolean(assignmentToEdit);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    dueDate: '',
    maxScore: 10,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (assignmentToEdit) {
      // Chuyển ISO sang YYYY-MM-DDTHH:mm cho input type="datetime-local"
      let formattedDueDate = '';
      if (assignmentToEdit.dueDate) {
        const d = new Date(assignmentToEdit.dueDate);
        if (!isNaN(d.getTime())) {
          formattedDueDate = d.toISOString().slice(0, 16);
        }
      }

      setFormData({
        title: assignmentToEdit.title || '',
        content: assignmentToEdit.content || assignmentToEdit.description || '',
        dueDate: formattedDueDate,
        maxScore: assignmentToEdit.maxScore || 10,
      });
    } else {
      // Mặc định hạn nộp là 14 ngày tới
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 14);
      setFormData({
        title: '',
        content: '',
        dueDate: defaultDate.toISOString().slice(0, 16),
        maxScore: 10,
      });
    }
    setErrors({});
    setServerError('');
  }, [assignmentToEdit, show]);

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
      newErrors.title = 'Vui lòng nhập tên bài tập';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Vui lòng nhập yêu cầu bài tập';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Vui lòng chọn hạn nộp bài';
    }

    if (!formData.maxScore || Number(formData.maxScore) <= 0) {
      newErrors.maxScore = 'Điểm tối đa phải lớn hơn 0';
    } else if (Number(formData.maxScore) > 100) {
      newErrors.maxScore = 'Điểm tối đa không được vượt quá 100';
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
        dueDate: new Date(formData.dueDate).toISOString(),
        maxScore: Number(formData.maxScore),
      };

      if (isEditing) {
        await assignmentApi.update(assignmentToEdit.id, payload);
        toast.success(`Cập nhật bài tập "${formData.title}" thành công!`);
      } else {
        await assignmentApi.create(payload);
        toast.success(`Tạo bài tập mới "${formData.title}" thành công!`);
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
          {isEditing ? 'Chỉnh Sửa Bài Tập' : 'Tạo Bài Tập Mới'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit} noValidate>
        <Modal.Body className="p-4">
          {serverError && (
            <Alert variant="danger" className="py-2 small">
              {serverError}
            </Alert>
          )}

          <Form.Group className="mb-3" controlId="assignmentTitle">
            <Form.Label className="fw-semibold small">Tiêu đề bài tập *</Form.Label>
            <Form.Control
              type="text"
              name="title"
              placeholder="Ví dụ: Bài tập 1: Xây dựng Todo App"
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
              <Form.Group controlId="assignmentDueDate">
                <Form.Label className="fw-semibold small">Hạn nộp bài *</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  isInvalid={!!errors.dueDate}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.dueDate}
                </Form.Control.Feedback>
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group controlId="assignmentMaxScore">
                <Form.Label className="fw-semibold small">Thang điểm tối đa *</Form.Label>
                <Form.Control
                  type="number"
                  name="maxScore"
                  min="1"
                  max="100"
                  step="0.5"
                  value={formData.maxScore}
                  onChange={handleChange}
                  isInvalid={!!errors.maxScore}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.maxScore}
                </Form.Control.Feedback>
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3" controlId="assignmentContent">
            <Form.Label className="fw-semibold small">Yêu cầu và Hướng dẫn chi tiết *</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="content"
              placeholder="Mô tả các yêu cầu kỹ thuật cần đạt, tiêu chí đánh giá..."
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
            {loading ? 'Đang lưu...' : isEditing ? 'Cập Nhật Bài Tập' : 'Tạo Bài Tập'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AssignmentFormModal;
