import React, { createContext, useReducer, useEffect } from 'react';
import authApi from '../api/authApi';

// Tạo Context
export const AuthContext = createContext();

const STORAGE_KEY = 'user_auth';

// Khởi tạo state từ localStorage nếu đã lưu trước đó
const getInitialState = () => {
  try {
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      return {
        user: parsed,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    }
  } catch (error) {
    console.error('Lỗi khi đọc auth state từ localStorage:', error);
  }

  return {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };
};

// Reducer xử lý các hành động xác thực
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, null, getInitialState);

  // Đồng bộ hóa thông tin user vào localStorage mỗi khi state.user thay đổi
  useEffect(() => {
    try {
      if (state.user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      console.error('Lỗi khi lưu auth state vào localStorage:', err);
    }
  }, [state.user]);

  // Hành động Đăng nhập
  const login = async ({ email, password }) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const user = await authApi.login({ email, password });
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return user;
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
      throw error;
    }
  };

  // Hành động Đăng xuất
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  // Cập nhật thông tin người dùng trong context
  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        error: state.error,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
