import axios from 'axios';

// Khởi tạo instance axios với baseURL từ biến môi trường hoặc mặc định port 9999 của json-server
const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:9999',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor cho request: có thể gắn thêm token/headers nếu cần trong tương lai
axiosClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho response: trích xuất trực tiếp response.data và chuẩn hóa thông báo lỗi
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Chuẩn hóa thông báo lỗi trả về cho client
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Không thể kết nối đến máy chủ!';
    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosClient;
