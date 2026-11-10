import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import submissionApi from '../../api/submissionApi';
import { formatDate } from '../../utils/formatDate';

const SubmissionModal = ({
  show,
  onHide,
  onSuccess,
  assignment = null,
  studentId,
  currentSubmission = null,
}) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(currentSubmission);
  const isPastDue = assignment?.dueDate
    ? new Date() > new Date(assignment.dueDate)
    : false;

  useEffect(() => {
    if (currentSubmission) {
      setContent(currentSubmission.content || '');
    } else {
      setContent('');
    }
    setError('');
  }, [currentSubmission, show]);

  const validate = () => {
    if (!content.trim()) {
      setError('Vui lòng nhập nội dung bài làm của bạn');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (isPastDue && !isEditing) {
      setError('Đã quá hạn nộp bài tập này!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await submissionApi.submit({
        assignmentId: assignment.id,
        studentId,
        content: content.trim(),
      });

      toast.success(
        isEditing
          ? 'Cập nhật nộp lại bài tập thành công!'
          : 'Nộp bài tập thành công!'
      );
      onSuccess();
      onHide();
    } catch (err) {
      setError(err.message || 'Nộp bài thất bại!');
      toast.error(err.message || 'Nộp bài thất bại!');
    } finally {
      setLoading(false);
    }
  };

  if (!assignment) return null;

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="h5 fw-bold mb-0">
          {isEditing ? 'Nộp Lại Bài Tập' : 'Nộp Bài Tập'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          {/* Thông tin bài tập */}
          <div className="bg-light p-3 rounded mb-3 border">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-bold text-primary fs-6">
                {assignment.title}
              </span>
              <Badge bg="info">Thang điểm: {assignment.maxScore}</Badge>
            </div>
            <div className="d-flex justify-content-between align-items-center small text-muted">
              <span>Hạn nộp: {formatDate(assignment.dueDate, true)}</span>
              {isPastDue ? (
                <Badge bg="danger">Đã quá hạn</Badge>
              ) : (
                <Badge bg="success">Còn hạn nộp</Badge>
              )}
            </div>
            <p className="mt-2 mb-0 text-secondary small" style={{ whiteSpace: 'pre-wrap' }}>
              <strong>Yêu cầu:</strong> {assignment.content || assignment.description}
            </p>
          </div>

          {isPastDue && (
            <Alert variant="warning" className="py-2 small">
              Bài tập này đã hết hạn nộp bài ({formatDate(assignment.dueDate, true)}).
            </Alert>
          )}

          {error && (
            <Alert variant="danger" className="py-2 small">
              {error}
            </Alert>
          )}

          {/* Form nội dung bài nộp */}
          <Form.Group controlId="submissionContent">
            <Form.Label className="fw-semibold small">
              Nội dung bài làm (Mã nguồn / Lời giải / Liên kết GitHub/CodeSandbox) *
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              placeholder="Nhập phần trả lời hoặc dán liên kết mã nguồn của bạn vào đây..."
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setError('');
              }}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Hủy Bỏ
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={loading || (isPastDue && !isEditing)}
          >
            {loading
              ? 'Đang gửi bài...'
              : isEditing
              ? 'Lưu Bài Nộp Lại'
              : 'Gửi Bài Làm'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default SubmissionModal;
