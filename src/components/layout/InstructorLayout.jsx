import React from 'react';
import { Container, Row, Col, ListGroup } from 'react-bootstrap';
import { NavLink, Outlet } from 'react-router-dom';
import Header from '../common/Header';
import Footer from '../common/Footer';

const InstructorLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />
      <main className="flex-grow-1 py-4">
        <Container>
          <Row>
            {/* Sidebar Instructor */}
            <Col lg={3} md={4} className="mb-4">
              <div className="bg-white p-3 rounded shadow-sm border">
                <div className="d-flex align-items-center mb-3 pb-2 border-bottom">
                  <i className="bi bi-person-workspace me-2 fs-5 text-primary"></i>
                  <h6 className="fw-bold mb-0 text-dark">Khu Vực Giảng Viên</h6>
                </div>
                <ListGroup variant="flush">
                  <ListGroup.Item
                    as={NavLink}
                    to="/instructor/courses"
                    className="border-0 rounded mb-1 px-3 py-2 text-decoration-none"
                    style={({ isActive }) => ({
                      backgroundColor: isActive ? '#0d6efd' : 'transparent',
                      color: isActive ? '#fff' : '#495057',
                      fontWeight: isActive ? '600' : 'normal',
                    })}
                  >
                    <i className="bi bi-journal-bookmark-fill me-2"></i> Khóa Học Của Tôi
                  </ListGroup.Item>
                </ListGroup>
              </div>
            </Col>

            {/* Vùng nội dung chi tiết */}
            <Col lg={9} md={8}>
              <Outlet />
            </Col>
          </Row>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default InstructorLayout;
