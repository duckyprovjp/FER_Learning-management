import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Card, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import submissionApi from '../../api/submissionApi';
import { formatDate } from '../../utils/formatDate';

const GradingModal = ({
  show,
  onHide,
  onSuccess,
  submission = null,
  assignment = null,
  student = null,
}) => {
  const maxScore = assignment?.maxScore || 10;

  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (submission) {
      setScore(submission.score !== null && submission.score !== undefined ? submission.score : '');
      setFeedback(submission.feedback || '');
    } else {
      setScore('');
      setFeedback('');
    }
    setError('');
  }, [submission, show]);

  const validate = () => {
    if (score === '' || score === null || isNaN(Number(score))) {
      setError('Vui lòng nhập điểm số hợp lệ');
      return false;
    }

    const numScore = Number(score);
    if (numScore < 0 || numScore > maxScore) {
      setError(`Điểm số phải nằm trong khoảng từ 0 đến ${maxScore}`);
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');

    try {
      await submissionApi.grade(submission.id, {
        score: Number(score),
        feedback: feedback.trim(),
      });

      toast.success(
        `Chấm điểm bài nộp của "${student?.name || 'Học viên'}" thành công!`
      );
      onSuccess();
      onHide();
    } catch (err) {
      setError(err.message || 'Chấm điểm thất bại!');
      toast.error(err.message || 'Chấm điểm thất bại!');
    } finally {
      setLoading(false);
    }
  };

  if (!submission) return null;

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="h5 fw-bold mb-0">
          Chấm Điểm Bài Tập
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          {/* Thông tin bài tập và sinh viên */}
          <div className="bg-light p-3 rounded mb-3 border">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-bold text-primary fs-6">
                {assignment?.title || 'Bài tập'}
              </span>
              <Badge bg="info">Thang điểm: {maxScore}</Badge>
            </div>
            <div className="d-flex align-items-center text-muted small">
              <img
                src={
                  student?.avatar ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
                }
                alt=""
                className="rounded-circle me-2 border"
                width="28"
                height="28"
                style={{ objectFit: 'cover' }}
              />
              <span className="fw-semibold text-dark me-2">
                {student?.name || `Học viên ID #${submission.studentId}`}
              </span>
              <span>• Nộp lúc: {formatDate(submission.submittedAt, true)}</span>
            </div>
          </div>

          {/* Nội dung bài làm của học viên */}
          <div className="mb-3">
            <Form.Label className="fw-semibold small text-dark">
              Nội dung bài làm của học viên:
            </Form.Label>
            <Card className="bg-white border">
              <Card.Body className="p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <pre
                  className="mb-0 text-dark small"
                  style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit' }}
                >
                  {submission.content || '(Bài nộp không có nội dung văn bản)'}
                </pre>
              </Card.Body>
            </Card>
          </div>

          {error && (
            <Alert variant="danger" className="py-2 small">
              {error}
            </Alert>
          )}

          {/* Form nhập điểm và nhận xét */}
          <div className="row g-3 mb-3">
            <div className="col-md-5">
              <Form.Group controlId="gradeScore">
                <Form.Label className="fw-semibold small">
                  Điểm số (0 đến {maxScore}) *
                </Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  max={maxScore}
                  step="0.25"
                  placeholder={`0 - ${maxScore}`}
                  value={score}
                  onChange={(e) => {
                    setScore(e.target.value);
                    setError('');
                  }}
                  isInvalid={!!error}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group controlId="gradeFeedback">
            <Form.Label className="fw-semibold small">
              Nhận xét & Phản hồi (Feedback) của Giảng viên
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Nhận xét ưu điểm, điểm cần cải thiện, hướng giải quyết..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Hủy Bỏ
          </Button>
          <Button variant="success" type="submit" disabled={loading}>
            {loading ? 'Đang lưu điểm...' : 'Lưu Điểm & Phản Hồi'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default GradingModal;
