import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const CourseCard = ({ course, instructor }) => {
  const getLevelBadgeVariant = (level) => {
    switch (level) {
      case 'Beginner':
        return 'success';
      case 'Intermediate':
        return 'warning';
      case 'Advanced':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="h-100 shadow-sm border-0 card-hover">
      <div style={{ position: 'relative', overflow: 'hidden', height: '180px' }}>
        <Card.Img
          variant="top"
          src={
            course.thumbnail ||
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'
          }
          alt={course.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
          <Badge bg="primary" className="me-1">
            {course.category}
          </Badge>
          <Badge bg={getLevelBadgeVariant(course.level)} text={course.level === 'Intermediate' ? 'dark' : 'white'}>
            {course.level}
          </Badge>
        </div>
      </div>

      <Card.Body className="d-flex flex-column">
        <Card.Title className="h6 fw-bold mb-2 text-dark">
          <Link
            to={`/courses/${course.id}`}
            className="text-decoration-none text-dark stretched-link"
          >
            {course.title}
          </Link>
        </Card.Title>

        <Card.Text className="text-muted small truncate-2-lines mb-3 flex-grow-1">
          {course.description}
        </Card.Text>

        <div className="d-flex align-items-center pt-2 border-top mt-auto">
          {instructor ? (
            <div className="d-flex align-items-center small text-secondary">
              <img
                src={
                  instructor.avatar ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
                }
                alt={instructor.name}
                className="rounded-circle me-2 border"
                width="28"
                height="28"
                style={{ objectFit: 'cover' }}
              />
              <span className="text-truncate" style={{ maxWidth: '140px' }}>
                {instructor.name}
              </span>
            </div>
          ) : (
            <span className="small text-muted">Giảng viên FPT</span>
          )}
          <Button
            as={Link}
            to={`/courses/${course.id}`}
            variant="outline-primary"
            size="sm"
            className="ms-auto"
            style={{ zIndex: 2, position: 'relative' }}
          >
            Chi tiết &rarr;
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CourseCard;
