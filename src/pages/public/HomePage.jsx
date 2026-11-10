import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import courseApi from '../../api/courseApi';
import userApi from '../../api/userApi';
import CourseCard from '../../components/course/CourseCard';
import CourseFilter from '../../components/course/CourseFilter';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useDebounce from '../../hooks/useDebounce';

const ITEMS_PER_PAGE = 6;

const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bộ lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearch = useDebounce(searchTerm, 350);

  // Tải danh sách khóa học và giảng viên
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [courseList, instructorList] = await Promise.all([
          courseApi.getAll(),
          userApi.getAll({ role: 'instructor' }),
        ]);
        setCourses(courseList);
        setInstructors(instructorList);
      } catch (err) {
        setError(err.message || 'Không thể tải danh sách khóa học');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Map instructors theo ID để lookup nhanh O(1)
  const instructorMap = useMemo(() => {
    const map = {};
    instructors.forEach((inst) => {
      map[inst.id] = inst;
    });
    return map;
  }, [instructors]);

  // Lọc khóa học theo tìm kiếm, danh mục, cấp độ
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchSearch =
        !debouncedSearch ||
        course.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        course.description.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchCategory = !category || course.category === category;
      const matchLevel = !level || course.level === level;

      return matchSearch && matchCategory && matchLevel;
    });
  }, [courses, debouncedSearch, category, level]);

  // Reset về trang 1 khi thay đổi điều kiện lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, category, level]);

  // Phân trang
  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCourses.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCourses, currentPage]);

  const handleResetFilter = () => {
    setSearchTerm('');
    setCategory('');
    setLevel('');
    setCurrentPage(1);
  };

  return (
    <Container>
      {/* Banner giới thiệu */}
      <div className="bg-primary text-white p-4 p-md-5 rounded-3 mb-4 shadow-sm text-center">
        <h1 className="display-6 fw-bold mb-3">Học Lập Trình Chuẩn Quốc Tế</h1>
        <p className="lead mb-0 text-white-50">
          Khám phá các khóa học Front-end, Back-end, Fullstack chất lượng cao tại Đại học FPT
        </p>
      </div>

      {/* Thanh bộ lọc và tìm kiếm */}
      <CourseFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        category={category}
        onCategoryChange={setCategory}
        level={level}
        onLevelChange={setLevel}
        onReset={handleResetFilter}
      />

      {/* Hiển thị trạng thái dữ liệu */}
      {loading ? (
        <LoadingSpinner text="Đang nạp danh sách khóa học..." />
      ) : error ? (
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-5 bg-white rounded border shadow-sm">
          <i className="bi bi-search display-4 text-muted mb-3 d-block"></i>
          <h5 className="fw-bold text-secondary">Không tìm thấy khóa học nào phù hợp</h5>
          <p className="text-muted small">
            Vui lòng thử tìm kiếm với từ khóa khác hoặc đặt lại bộ lọc.
          </p>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3 text-muted small">
            <span>
              Hiển thị <strong>{paginatedCourses.length}</strong> trên tổng số{' '}
              <strong>{filteredCourses.length}</strong> khóa học
            </span>
          </div>

          <Row xs={1} md={2} lg={3} className="g-4">
            {paginatedCourses.map((course) => (
              <Col key={course.id}>
                <CourseCard
                  course={course}
                  instructor={instructorMap[course.instructorId]}
                />
              </Col>
            ))}
          </Row>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </Container>
  );
};

export default HomePage;
