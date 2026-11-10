import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authApi from '../../api/authApi';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setRegisterError('');
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ và tên';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Họ tên phải có ít nhất 2 ký tự';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Email không hợp lệ';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải chứa ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setRegisterError('');

    try {
      await authApi.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      toast.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err) {
      setRegisterError(err.message || 'Đăng ký tài khoản thất bại!');
      toast.error(err.message || 'Đăng ký thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: '480px' }}>
      <Card className="shadow border-0 rounded-3">
        <Card.Body className="p-4 p-md-5">
          <div className="text-center mb-4">
            <i className="bi bi-person-plus display-4 text-primary d-block mb-2"></i>
            <h3 className="fw-bold mt-2">Đăng Ký Tài Khoản</h3>
            <p className="text-muted small">
              Tạo tài khoản học viên mới tại FER202 EduHub
            </p>
          </div>

          {registerError && (
            <Alert variant="danger" className="py-2 small">
              {registerError}
            </Alert>
          )}

          <Form onSubmit={handleSubmit} noValidate>
            <Form.Group className="mb-3" controlId="registerName">
              <Form.Label className="fw-semibold small">Họ và tên</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Nguyễn Văn A"
                value={formData.name}
                onChange={handleChange}
                isInvalid={!!errors.name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="registerEmail">
              <Form.Label className="fw-semibold small">Địa chỉ Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="student@fpt.edu.vn"
                value={formData.email}
                onChange={handleChange}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="registerPassword">
              <Form.Label className="fw-semibold small">Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Tối thiểu 6 ký tự..."
                value={formData.password}
                onChange={handleChange}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4" controlId="registerConfirmPassword">
              <Form.Label className="fw-semibold small">Xác nhận mật khẩu</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu..."
                value={formData.confirmPassword}
                onChange={handleChange}
                isInvalid={!!errors.confirmPassword}
              />
              <Form.Control.Feedback type="invalid">
                {errors.confirmPassword}
              </Form.Control.Feedback>
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 py-2 fw-semibold"
              disabled={loading}
            >
              {loading ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản'}
            </Button>
          </Form>

          <div className="text-center mt-4 pt-3 border-top">
            <span className="text-muted small">Đã có tài khoản? </span>
            <Link to="/login" className="small fw-semibold text-primary">
              Đăng nhập ngay
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RegisterPage;
