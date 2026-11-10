import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ text = 'Đang tải dữ liệu...', minHeight = '250px' }) => {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center w-100"
      style={{ minHeight }}
    >
      <Spinner animation="border" variant="primary" role="status" className="mb-2">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      <p className="text-muted small mb-0">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
