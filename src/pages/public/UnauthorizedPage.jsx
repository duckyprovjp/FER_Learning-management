import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <Container className="py-5 text-center" style={{ minHeight: '60vh' }}>
      <div className="py-5">
        <i className="bi bi-shield-slash display-1 text-danger d-block mb-3"></i>
        <h1 className="fw-bold text-danger mt-3">403 - Quyền Truy Cập Bị Từ Chối</h1>
        <p className="lead text-muted mb-4">
          Tài khoản của bạn không có đủ thẩm quyền để truy cập vào phân hệ này.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <Button as={Link} to="/" variant="primary">
            Trang Chủ Khóa Học
          </Button>
          <Button as={Link} to="/login" variant="outline-secondary">
            Đăng Nhập Tài Khoản Khác
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default UnauthorizedPage;
