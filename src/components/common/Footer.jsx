import React from "react";
import { Container } from "react-bootstrap";

const Footer = () => {
  return (
    <footer className="bg-white border-top py-4 mt-auto text-muted">
      <Container className="text-center">
        <p className="small mb-0">
          Trường Đại Học FPT &copy; {new Date().getFullYear()} - Hệ Thống Quản
          Lý Khóa Học (Course Management System)
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
