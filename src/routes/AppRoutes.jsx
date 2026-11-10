import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../components/layout/MainLayout';
import AdminLayout from '../components/layout/AdminLayout';
import InstructorLayout from '../components/layout/InstructorLayout';

// Guard
import ProtectedRoute from './ProtectedRoute';

// Public Pages
import HomePage from '../pages/public/HomePage';
import CourseDetailPage from '../pages/public/CourseDetailPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import UnauthorizedPage from '../pages/public/UnauthorizedPage';
import NotFoundPage from '../pages/public/NotFoundPage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminCoursesPage from '../pages/admin/AdminCoursesPage';

// Instructor Pages
import InstructorCoursesPage from '../pages/instructor/InstructorCoursesPage';
import InstructorCourseDetailPage from '../pages/instructor/InstructorCourseDetailPage';

// Student Pages
import StudentCoursesPage from '../pages/student/StudentCoursesPage';
import StudentLearningPage from '../pages/student/StudentLearningPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Phân hệ công khai & Học viên (Dùng MainLayout) */}
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected Student Routes */}
        <Route element={<ProtectedRoute roles={['student']} />}>
          <Route path="/student" element={<Navigate to="/student/courses" replace />} />
          <Route path="/student/courses" element={<StudentCoursesPage />} />
          <Route path="/student/courses/:courseId/learn" element={<StudentLearningPage />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* 2. Phân hệ Quản trị viên (Dùng AdminLayout & Guard role='admin') */}
      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/courses" element={<AdminCoursesPage />} />
        </Route>
      </Route>

      {/* 3. Phân hệ Giảng viên (Dùng InstructorLayout & Guard role='instructor') */}
      <Route element={<ProtectedRoute roles={['instructor']} />}>
        <Route element={<InstructorLayout />}>
          <Route path="/instructor" element={<Navigate to="/instructor/courses" replace />} />
          <Route path="/instructor/courses" element={<InstructorCoursesPage />} />
          <Route path="/instructor/courses/:id" element={<InstructorCourseDetailPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
