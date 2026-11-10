import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <Container className="py-5 text-center" style={{ minHeight: '60vh' }}>
      <div className="py-5">
        <i className="bi bi-compass display-1 text-secondary d-block mb-3"></i>
        <h1 className="fw-bold text-secondary mt-3">404 - Không Tìm Thấy Trang</h1>
        <p className="lead text-muted mb-4">
          Địa chỉ trang web bạn yêu cầu không tồn tại hoặc đã được chuyển sang liên kết khác.
        </p>
        <Button as={Link} to="/" variant="primary">
          Về Trang Chủ
        </Button>
      </div>
    </Container>
  );
};

export default NotFoundPage;
