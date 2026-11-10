import React from 'react';
import { Navbar, Nav, Container, NavDropdown, Badge, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.info('Bạn đã đăng xuất thành công!');
    navigate('/login');
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'instructor':
        return 'primary';
      case 'student':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'instructor':
        return 'Giảng viên';
      case 'student':
        return 'Học viên';
      default:
        return role;
    }
  };

  return (
    <Navbar bg="white" expand="lg" className="border-bottom shadow-sm sticky-top" style={{ zIndex: 1040 }}>
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold text-primary d-flex align-items-center">
          <i className="bi bi-mortarboard-fill me-2 fs-4"></i>
          <span>FER202 EduHub</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto mb-2 mb-lg-0">
            <Nav.Link as={Link} to="/" active={location.pathname === '/'}>
              Khóa học
            </Nav.Link>

            {/* Quyền Student */}
            {isAuthenticated && user?.role === 'student' && (
              <Nav.Link
                as={Link}
                to="/student/courses"
                active={location.pathname.startsWith('/student/courses')}
              >
                Khóa học của tôi
              </Nav.Link>
            )}

            {/* Quyền Instructor */}
            {isAuthenticated && user?.role === 'instructor' && (
              <Nav.Link
                as={Link}
                to="/instructor/courses"
                active={location.pathname.startsWith('/instructor/courses')}
              >
                Quản lý giảng dạy
              </Nav.Link>
            )}

            {/* Quyền Admin */}
            {isAuthenticated && user?.role === 'admin' && (
              <>
                <Nav.Link
                  as={Link}
                  to="/admin/dashboard"
                  active={location.pathname === '/admin/dashboard'}
                >
                  Bảng thống kê
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/admin/users"
                  active={location.pathname === '/admin/users'}
                >
                  Người dùng
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/admin/courses"
                  active={location.pathname === '/admin/courses'}
                >
                  Khóa học hệ thống
                </Nav.Link>
              </>
            )}
          </Nav>

          {/* Phần điều hướng người dùng (Đăng nhập / Hồ sơ) */}
          <Nav className="align-items-lg-center">
            {isAuthenticated && user ? (
              <div className="d-flex align-items-center mt-2 mt-lg-0">
                <NavDropdown
                  title={
                    <span className="fw-semibold text-dark">
                      {user.name}{' '}
                      <Badge
                        bg={getRoleBadgeVariant(user.role)}
                        className="ms-1 font-weight-normal"
                      >
                        {getRoleLabel(user.role)}
                      </Badge>
                    </span>
                  }
                  id="user-nav-dropdown"
                  align="end"
                >
                  <NavDropdown.Header className="small text-muted">
                    {user.email}
                  </NavDropdown.Header>
                  <NavDropdown.Divider />
                  {user.role === 'admin' && (
                    <NavDropdown.Item as={Link} to="/admin/dashboard">
                      Trang Quản trị
                    </NavDropdown.Item>
                  )}
                  {user.role === 'instructor' && (
                    <NavDropdown.Item as={Link} to="/instructor/courses">
                      Quản lý Lớp học
                    </NavDropdown.Item>
                  )}
                  {user.role === 'student' && (
                    <NavDropdown.Item as={Link} to="/student/courses">
                      Khóa học của tôi
                    </NavDropdown.Item>
                  )}
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout} className="text-danger">
                    Đăng xuất
                  </NavDropdown.Item>
                </NavDropdown>
              </div>
            ) : (
              <div className="d-flex gap-2 mt-2 mt-lg-0">
                <Button
                  as={Link}
                  to="/login"
                  variant="outline-primary"
                  size="sm"
                  className="px-3"
                >
                  Đăng nhập
                </Button>
                <Button as={Link} to="/register" variant="primary" size="sm" className="px-3">
                  Đăng ký
                </Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
