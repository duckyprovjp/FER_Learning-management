import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Table, Badge, Button, Form, Row, Col, Nav, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import userApi from '../../api/userApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import UserFormModal from '../../components/admin/UserFormModal';
import useDebounce from '../../hooks/useDebounce';
import useAuth from '../../hooks/useAuth';

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bộ lọc
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'instructor' | 'student'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [showUserModal, setShowUserModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 350);

  // Tải danh sách người dùng
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userApi.getAll();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Lọc người dùng theo tab, search và status
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Lọc theo vai trò (tab)
      if (activeTab !== 'all' && u.role !== activeTab) {
        return false;
      }

      // Lọc theo trạng thái
      if (statusFilter && u.status !== statusFilter) {
        return false;
      }

      // Tìm kiếm theo tên hoặc email
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase();
        const matchName = u.name?.toLowerCase().includes(query);
        const matchEmail = u.email?.toLowerCase().includes(query);
        return matchName || matchEmail;
      }

      return true;
    });
  }, [users, activeTab, statusFilter, debouncedSearch]);

  // Xử lý Khóa / Mở khóa tài khoản
  const handleToggleStatus = async (user) => {
    if (user.id === currentUser?.id) {
      toast.warning('Bạn không thể tự khóa tài khoản của chính mình!');
      return;
    }

    try {
      await userApi.toggleStatus(user.id, user.status);
      const newStatus = user.status === 'active' ? 'bị khóa' : 'đã mở khóa';
      toast.success(`Tài khoản "${user.name}" ${newStatus} thành công!`);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Thao tác thay đổi trạng thái thất bại!');
    }
  };

  // Mở modal sửa
  const handleEdit = (user) => {
    setUserToEdit(user);
    setShowUserModal(true);
  };

  // Mở modal tạo mới
  const handleCreate = () => {
    setUserToEdit(null);
    setShowUserModal(true);
  };

  // Mở modal xóa
  const handleDeleteClick = (user) => {
    if (user.id === currentUser?.id) {
      toast.warning('Bạn không thể tự xóa tài khoản của chính mình!');
      return;
    }
    setUserToDelete(user);
    setShowConfirmModal(true);
  };

  // Xác nhận xóa người dùng
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setActionLoading(true);
    try {
      await userApi.delete(userToDelete.id);
      toast.success(`Đã xóa người dùng "${userToDelete.name}" thành công!`);
      setShowConfirmModal(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Xóa người dùng thất bại!');
    } finally {
      setActionLoading(false);
    }
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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Quản Lý Người Dùng</h4>
          <p className="text-muted small mb-0">
            Quản lý tài khoản Giảng viên & Học viên, phân quyền và khóa/mở khóa
          </p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          + Thêm Người Dùng Mới
        </Button>
      </div>

      {/* Tabs vai trò */}
      <Card className="border-0 shadow-sm mb-3">
        <Card.Body className="p-2">
          <Nav
            variant="pills"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
          >
            <Nav.Item>
              <Nav.Link eventKey="all">
                Tất Cả ({users.length})
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="instructor">
                Giảng Viên ({users.filter((u) => u.role === 'instructor').length})
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="student">
                Học Viên ({users.filter((u) => u.role === 'student').length})
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Body>
      </Card>

      {/* Thanh lọc & tìm kiếm */}
      <Card className="border-0 shadow-sm mb-3">
        <Card.Body className="p-3">
          <Row className="g-2">
            <Col md={8}>
              <Form.Control
                type="text"
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col md={4}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">-- Tất cả trạng thái --</option>
                <option value="active">Đang hoạt động (active)</option>
                <option value="locked">Bị khóa (locked)</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Bảng danh sách người dùng */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <LoadingSpinner text="Đang tải danh sách người dùng..." />
          ) : error ? (
            <Alert variant="danger" className="m-3 text-center">
              {error}
            </Alert>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-search display-6 text-muted mb-2 d-block"></i>
              <h6>Không tìm thấy người dùng phù hợp</h6>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">Người dùng</th>
                    <th>Email</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th className="text-end pe-3">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td className="ps-3">
                        <div className="d-flex align-items-center">
                          <img
                            src={
                              u.avatar ||
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
                            }
                            alt=""
                            className="rounded-circle me-2 border"
                            width="36"
                            height="36"
                            style={{ objectFit: 'cover' }}
                          />
                          <div>
                            <div className="fw-semibold text-dark">{u.name}</div>
                            <div className="text-muted small">ID: #{u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-secondary">{u.email}</td>
                      <td>
                        <Badge bg={getRoleBadgeVariant(u.role)}>
                          {u.role === 'admin'
                            ? 'Quản trị viên'
                            : u.role === 'instructor'
                            ? 'Giảng viên'
                            : 'Học viên'}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={u.status === 'active' ? 'success' : 'danger'}>
                          {u.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                        </Badge>
                      </td>
                      <td className="text-end pe-3">
                        <div className="d-flex justify-content-end gap-1">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleEdit(u)}
                            title="Chỉnh sửa thông tin"
                          >
                            <i className="bi bi-pencil me-1"></i> Sửa
                          </Button>
                          <Button
                            variant={
                              u.status === 'active'
                                ? 'outline-warning'
                                : 'outline-success'
                            }
                            size="sm"
                            onClick={() => handleToggleStatus(u)}
                            title={
                              u.status === 'active'
                                ? 'Khóa tài khoản'
                                : 'Mở khóa tài khoản'
                            }
                          >
                            {u.status === 'active' ? (
                              <>
                                <i className="bi bi-lock me-1"></i> Khóa
                              </>
                            ) : (
                              <>
                                <i className="bi bi-unlock me-1"></i> Mở
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteClick(u)}
                            title="Xóa người dùng"
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal Thêm / Sửa người dùng */}
      <UserFormModal
        show={showUserModal}
        onHide={() => setShowUserModal(false)}
        onSuccess={fetchUsers}
        userToEdit={userToEdit}
      />

      {/* Modal Xác nhận Xóa */}
      <ConfirmModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa người dùng"
        message={`Bạn có chắc chắn muốn xóa tài khoản "${userToDelete?.name}" (${userToDelete?.email}) không? Thao tác này không thể hoàn tác.`}
        confirmText="Xóa Người Dùng"
        confirmVariant="danger"
        loading={actionLoading}
      />
    </div>
  );
};

export default AdminUsersPage;
