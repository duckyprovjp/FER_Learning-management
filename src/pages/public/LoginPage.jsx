import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setAuthError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Email không đúng định dạng';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setAuthError('');

    try {
      const user = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      toast.success(`Xin chào ${user.name}! Đăng nhập thành công.`);

      // Chuyển hướng theo vai trò hoặc vị trí lưu trước đó
      const from = location.state?.from?.pathname || location.state?.from;
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'instructor') {
        navigate('/instructor/courses', { replace: true });
      } else {
        navigate('/student/courses', { replace: true });
      }
    } catch (err) {
      setAuthError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại!');
      toast.error(err.message || 'Đăng nhập thất bại!');
    } finally {
      setLoading(false);
    }
  };

  // Nút bấm điền nhanh tài khoản demo để kiểm thử
  const fillDemoAccount = (email, password) => {
    setFormData({ email, password });
    setErrors({});
    setAuthError('');
  };

  return (
    <Container className="py-5" style={{ maxWidth: '480px' }}>
      <Card className="shadow border-0 rounded-3">
        <Card.Body className="p-4 p-md-5">
          <div className="text-center mb-4">
            <i className="bi bi-shield-lock display-4 text-primary d-block mb-2"></i>
            <h3 className="fw-bold mt-2">Đăng Nhập</h3>
            <p className="text-muted small">
              Hệ thống Quản lý Khóa học FER202 FPT University
            </p>
          </div>

          {authError && (
            <Alert variant="danger" className="py-2 small">
              {authError}
            </Alert>
          )}

          <Form onSubmit={handleSubmit} noValidate>
            <Form.Group className="mb-3" controlId="loginEmail">
              <Form.Label className="fw-semibold small">Địa chỉ Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="example@fpt.edu.vn"
                value={formData.email}
                onChange={handleChange}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4" controlId="loginPassword">
              <Form.Label className="fw-semibold small">Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Nhập mật khẩu..."
                value={formData.password}
                onChange={handleChange}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 py-2 fw-semibold"
              disabled={loading}
            >
              {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
            </Button>
          </Form>

          {/* Tài khoản thử nghiệm nhanh */}
          <div className="mt-4 pt-3 border-top">
            <p className="small text-muted mb-2 fw-semibold">
              Tài khoản thử nghiệm nhanh:
            </p>
            <div className="d-flex flex-wrap gap-1">
              <Button
                variant="outline-danger"
                size="sm"
                className="small"
                onClick={() => fillDemoAccount('admin@fpt.edu.vn', 'password123')}
              >
                Admin
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                className="small"
                onClick={() => fillDemoAccount('instructor1@fpt.edu.vn', 'password123')}
              >
                Giảng viên
              </Button>
              <Button
                variant="outline-success"
                size="sm"
                className="small"
                onClick={() => fillDemoAccount('student1@fpt.edu.vn', 'password123')}
              >
                Học viên
              </Button>
            </div>
          </div>

          <div className="text-center mt-4 pt-3 border-top">
            <span className="text-muted small">Chưa có tài khoản? </span>
            <Link to="/register" className="small fw-semibold text-primary">
              Đăng ký ngay
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LoginPage;
