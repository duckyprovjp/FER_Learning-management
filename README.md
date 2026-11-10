# Hệ Thống Quản Lý Khóa Học (Course Management System)
> **Đồ Án Môn Học FER202 - Front-End Web Development with React**  
> **Trường Đại Học FPT (FPT University)**

---

## Giới Thiệu Dự Án

Hệ thống Quản lý Khóa học (Learning Management System - LMS) được xây dựng hoàn toàn ở phía Front-End với React 18 (Create React App), kết hợp máy chủ giả lập `json-server` cung cấp RESTful API và gọi dữ liệu tập trung qua `axios`.

Dự án tuân thủ nghiêm ngặt các tiêu chuẩn của môn học FER202:
- Mã nguồn tường minh, phân tách component và dịch vụ API theo kiến trúc phân tầng (Layered Architecture).
- Toàn bộ giao diện sử dụng Bootstrap 5 & React-Bootstrap, responsive linh hoạt trên cả Mobile (375px) và Desktop (1440px).
- Quản lý phiên làm việc toàn cục bằng React Context API + `useReducer`, đồng bộ `localStorage`.
- Phân quyền theo vai trò (Role-based Access Control) với `ProtectedRoute` cho 3 đối tượng: **Admin**, **Instructor**, và **Student**.

---

## Công Nghệ Sử Dụng (Tech Stack)

| Thành phần | Công nghệ & Phiên bản | Ghi chú |
| :--- | :--- | :--- |
| **Ngôn ngữ** | JavaScript (ES6+) | Chuẩn functional components + hooks |
| **Thư viện UI** | React 18 (`react`, `react-dom` ^18.3.1) | Create React App (`react-scripts 5.0.1`) |
| **Routing** | React Router DOM v6 (`^6.23.0`) | Định tuyến lồng nhau, layout theo role, ProtectedRoute |
| **Giao diện & CSS**| Bootstrap 5 (`^5.3.3`) + React-Bootstrap (`^2.10.2`) | UI chuẩn mực, responsive đa màn hình |
| **Icons** | Bootstrap Icons (`^1.11.3` qua CDN) | Bộ icon vector chuẩn của Bootstrap |
| **Thông báo** | React-Toastify (`^10.0.5`) | Thông báo toast trực quan khi gọi API |
| **Gọi API** | Axios (`^1.6.8`) | Cấu hình axiosClient tập trung, interceptor chuẩn hóa lỗi |
| **Mock Backend**| JSON-Server (`0.17.4`) | RESTful API giả lập với 7 collection tại `db.json` |

---

## Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Yêu Cầu Môi Trường
- Node.js (phiên bản 18+ hoặc 20+)
- Trình quản lý gói npm

### 2. Cài Đặt Dependencies
Mở terminal tại thư mục gốc dự án (`D:\FA26\FER202\ASG_Learning-management`):
```bash
npm install
```

### 3. Khởi Chạy Hệ Thống

Dự án cần chạy đồng thời 2 tiến trình:

#### Bước 3.1: Chạy Backend Giả Lập (`json-server` port 9999)
Mở cửa sổ terminal thứ nhất:
```bash
npm run server
```
> Server sẽ khởi chạy tại: `http://localhost:9999` với file cơ sở dữ liệu `db.json`.

#### Bước 3.2: Chạy Ứng Dụng React (`port 3000`)
Mở cửa sổ terminal thứ hai:
```bash
npm start
```
> Ứng dụng sẽ tự động mở tại trình duyệt: `http://localhost:3000`.

---

## Danh Sách Tài Khoản Thử Nghiệm (Demo Accounts)

> **Lưu ý**: Mật khẩu trong `db.json` chỉ phục vụ mục đích demo cho bài tập lớn FER202. Cơ chế đăng nhập kiểm tra qua query `GET /users?email=...&password=...`. Trên giao diện trang Đăng nhập (`/login`) có sẵn các nút bấm điền nhanh tài khoản.

| Vai Trò (Role) | Họ và Tên | Email | Mật Khẩu | Mô Tả & Quyền Hạn |
| :--- | :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | Nguyễn Quản Trị | `admin@fpt.edu.vn` | `password123` | Toàn quyền xem thống kê, CRUD Giảng viên & Học viên, Khóa/Mở tài khoản, CRUD Khóa học & Gán giảng viên. |
| **Giảng viên (Instructor)** | ThS. Trần Thị Mai | `instructor1@fpt.edu.vn` | `password123` | Quản lý khóa học của mình, CRUD bài học, CRUD bài tập, xem học viên trong lớp, chấm điểm & gửi phản hồi. |
| **Giảng viên (Instructor)** | TS. Lê Hoàng Nam | `instructor2@fpt.edu.vn` | `password123` | Giảng viên bộ môn Backend & Database. |
| **Giảng viên (Instructor)** | ThS. Phạm Quốc Tuấn | `instructor3@fpt.edu.vn` | `password123` | Giảng viên bộ môn Mobile & Microservices. |
| **Học viên (Student)** | Vũ Hải Đăng | `student1@fpt.edu.vn` | `password123` | Đã đăng ký 3 khóa, có bài tập đã nộp, bài đã được chấm và bài học hoàn thành. |
| **Học viên (Student)** | Nguyễn Thị Thu Hà | `student2@fpt.edu.vn` | `password123` | Đã đăng ký 2 khóa học. |
| **Học viên (Bị khóa)** | Dương Minh Châu | `student10@fpt.edu.vn` | `password123` | Tài khoản trạng thái `locked` dùng để kiểm thử tính năng chặn đăng nhập tài khoản bị khóa. |

---

## Bản Đồ Đường Dẫn (Route Map)

| Đường dẫn (URL) | Phân hệ / Vai trò | Layout | Mô Tả Chức Năng |
| :--- | :--- | :--- | :--- |
| `/` | Công khai | MainLayout | Danh mục khóa học, tìm kiếm tức thì với debounce, lọc theo category/level, phân trang |
| `/courses/:id` | Công khai | MainLayout | Chi tiết khóa học, đề cương bài học, nút Đăng ký học |
| `/login` | Công khai | MainLayout | Đăng nhập tài khoản (có nút điền nhanh tài khoản demo) |
| `/register` | Công khai | MainLayout | Đăng ký tài khoản học viên mới (mặc định role `student`) |
| `/unauthorized` | Công khai | MainLayout | Trang báo lỗi 403 khi truy cập trái quyền |
| `/admin/dashboard` | Admin | AdminLayout | Bảng thống kê số lượng Khóa học, Giảng viên, Học viên, Lượt đăng ký |
| `/admin/users` | Admin | AdminLayout | Quản lý người dùng: lọc role, tìm kiếm, tạo mới, sửa, Khóa/Mở khóa tài khoản, xóa |
| `/admin/courses` | Admin | AdminLayout | Quản lý khóa học: tìm kiếm, lọc, tạo mới, sửa, **gán giảng viên phụ trách**, xóa |
| `/instructor/courses` | Instructor | InstructorLayout | Danh sách khóa học do giảng viên trực tiếp giảng dạy, tạo/sửa/xóa khóa học |
| `/instructor/courses/:id`| Instructor | InstructorLayout | Chi tiết quản lý: Tab Bài học (CRUD), Tab Bài tập (CRUD), Tab Học viên đã đăng ký |
| `/instructor/courses/:id/grading` | Instructor | InstructorLayout | Bảng chấm điểm bài nộp của học viên: nhập điểm số (0 - maxScore) & phản hồi feedback |
| `/student/courses` | Student | MainLayout | Khóa học của tôi: theo dõi tiến độ % bằng `ProgressBar`, hủy đăng ký |
| `/student/courses/:courseId/learn` | Student | MainLayout | Phòng học trực tuyến: xem video bài giảng, đánh dấu hoàn thành bài học, nộp/nộp lại bài tập |
| `/student/results` | Student | MainLayout | Bảng kết quả học tập: điểm từng bài tập, điểm trung bình (ĐTB) theo môn, nhận xét của giảng viên |

---

## Mô Hình Dữ Liệu (`db.json`)

Cơ sở dữ liệu mẫu bao gồm 7 collection liên kết quan hệ chặt chẽ:
1. `users`: Thông tin người dùng (`id`, `name`, `email`, `password`, `role`, `avatar`, `status`).
2. `courses`: Thông tin khóa học (`id`, `title`, `description`, `category`, `level`, `instructorId`, `thumbnail`, `status`, `createdAt`).
3. `lessons`: Bài giảng theo khóa (`id`, `courseId`, `title`, `content`, `videoUrl`, `order`, `duration`).
4. `enrollments`: Lượt đăng ký học (`id`, `courseId`, `studentId`, `enrolledAt`, `status`).
5. `assignments`: Bài tập của khóa học (`id`, `courseId`, `title`, `content`, `dueDate`, `maxScore`).
6. `submissions`: Bài làm của học viên (`id`, `assignmentId`, `studentId`, `content`, `submittedAt`, `score`, `feedback`, `gradedAt`).
7. `progress`: Tiến độ học bài (`id`, `studentId`, `courseId`, `lessonId`, `completed`, `completedAt`).

---

## Kiểm Thử & Tiêu Chí Đạt Chuẩn (Verification Checklist)

- [x] **Tiêu chí 1**: `npm run server` (port 9999) và `npm start` (port 3000) chạy ổn định, không có lỗi console đỏ.
- [x] **Tiêu chí 2**: Học viên đăng ký khóa học, học bài, đánh dấu hoàn thành bài học -> thanh tiến độ cập nhật % tức thì.
- [x] **Tiêu chí 3**: Học viên nộp bài làm, Giảng viên vào chấm điểm và gửi feedback -> điểm số và nhận xét xuất hiện ngay tại trang Bảng điểm của học viên.
- [x] **Tiêu chí 4**: Học viên hoặc khách truy cập vào các đường dẫn `/admin/*` bị chặn bởi `ProtectedRoute` và chuyển hướng an toàn.
- [x] **Tiêu chí 5**: 100% các lời gọi HTTP đều thông qua các module trong `src/api/` (không có lời gọi `fetch` hay `axios` nằm ngoài `src/api/`).
