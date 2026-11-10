import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import userApi from '../../api/userApi';

const UserFormModal = ({ show, onHide, onSuccess, userToEdit = null }) => {
  const isEditing = Boolean(userToEdit);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    status: 'active',
    avatar: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Điền dữ liệu khi chỉnh sửa hoặc đặt lại khi thêm mới
  useEffect(() => {
    if (userToEdit) {
      setFormData({
        name: userToEdit.name || '',
        email: userToEdit.email || '',
        password: '', // Để trống nếu không muốn đổi mật khẩu
        role: userToEdit.role || 'student',
        status: userToEdit.status || 'active',
        avatar: userToEdit.avatar || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'student',
        status: 'active',
        avatar: '',
      });
    }
    setErrors({});
    setServerError('');
  }, [userToEdit, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ và tên';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Email không hợp lệ';
      }
    }

    if (!isEditing && !formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải từ 6 ký tự trở lên';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');

    try {
      if (isEditing) {
        const updatePayload = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role,
          status: formData.status,
          avatar:
            formData.avatar.trim() ||
            userToEdit.avatar ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        };
        if (formData.password) {
          updatePayload.password = formData.password;
        }
        await userApi.update(userToEdit.id, updatePayload);
        toast.success(`Cập nhật người dùng "${formData.name}" thành công!`);
      } else {
        await userApi.create({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role,
          status: formData.status,
          avatar:
            formData.avatar.trim() ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        });
        toast.success(`Tạo người dùng "${formData.name}" thành công!`);
      }

      onSuccess();
      onHide();
    } catch (err) {
      setServerError(err.message || 'Thao tác thất bại!');
      toast.error(err.message || 'Thao tác thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="h5 fw-bold mb-0">
          {isEditing ? 'Chỉnh Sửa Người Dùng' : 'Thêm Người Dùng Mới'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit} noValidate>
        <Modal.Body className="p-4">
          {serverError && (
            <Alert variant="danger" className="py-2 small">
              {serverError}
            </Alert>
          )}

          <Form.Group className="mb-3" controlId="userName">
            <Form.Label className="fw-semibold small">Họ và tên *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              placeholder="Ví dụ: Nguyễn Văn A"
              value={formData.name}
              onChange={handleChange}
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="userEmail">
            <Form.Label className="fw-semibold small">Địa chỉ Email *</Form.Label>
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

          <Form.Group className="mb-3" controlId="userPassword">
            <Form.Label className="fw-semibold small">
              {isEditing
                ? 'Mật khẩu mới (Để trống nếu giữ nguyên)'
                : 'Mật khẩu *'}
            </Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder={isEditing ? 'Nhập mật khẩu mới nếu muốn đổi...' : 'Tối thiểu 6 ký tự'}
              value={formData.password}
              onChange={handleChange}
              isInvalid={!!errors.password}
            />
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
          </Form.Group>

          <div className="row g-2 mb-3">
            <div className="col-6">
              <Form.Group controlId="userRole">
                <Form.Label className="fw-semibold small">Vai trò</Form.Label>
                <Form.Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="student">Học viên (student)</option>
                  <option value="instructor">Giảng viên (instructor)</option>
                  <option value="admin">Quản trị viên (admin)</option>
                </Form.Select>
              </Form.Group>
            </div>

            <div className="col-6">
              <Form.Group controlId="userStatus">
                <Form.Label className="fw-semibold small">Trạng thái</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Hoạt động (active)</option>
                  <option value="locked">Bị khóa (locked)</option>
                </Form.Select>
              </Form.Group>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Hủy Bỏ
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Đang lưu...' : isEditing ? 'Cập Nhật' : 'Tạo Mới'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UserFormModal;
