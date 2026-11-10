import React from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { COURSE_CATEGORIES, COURSE_LEVELS } from '../../utils/constants';

const CourseFilter = ({
  searchTerm,
  onSearchChange,
  category,
  onCategoryChange,
  level,
  onLevelChange,
  onReset,
}) => {
  const isFiltered = Boolean(searchTerm || category || level);

  return (
    <div className="bg-white p-3 rounded shadow-sm border mb-4">
      <Row className="g-2 align-items-center">
        {/* Tìm kiếm theo tên */}
        <Col md={5}>
          <Form.Group controlId="searchCourse">
            <Form.Control
              type="text"
              placeholder="Tìm kiếm theo tên khóa học..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </Form.Group>
        </Col>

        {/* Lọc theo danh mục */}
        <Col md={3} sm={6}>
          <Form.Select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            aria-label="Lọc theo danh mục"
          >
            <option value="">-- Tất cả danh mục --</option>
            {COURSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Form.Select>
        </Col>

        {/* Lọc theo cấp độ */}
        <Col md={3} sm={6}>
          <Form.Select
            value={level}
            onChange={(e) => onLevelChange(e.target.value)}
            aria-label="Lọc theo cấp độ"
          >
            <option value="">-- Tất cả cấp độ --</option>
            {COURSE_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </Form.Select>
        </Col>

        {/* Nút đặt lại */}
        <Col md={1} className="text-md-end text-center">
          <Button
            variant="outline-secondary"
            className="w-100"
            onClick={onReset}
            disabled={!isFiltered}
            title="Đặt lại bộ lọc"
          >
            <i className="bi bi-arrow-counterclockwise"></i>
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default CourseFilter;
