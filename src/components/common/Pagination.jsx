import React from 'react';
import { Pagination as BsPagination } from 'react-bootstrap';

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
  if (totalPages <= 1) return null;

  const items = [];
  for (let number = 1; number <= totalPages; number++) {
    items.push(
      <BsPagination.Item
        key={number}
        active={number === currentPage}
        onClick={() => onPageChange(number)}
      >
        {number}
      </BsPagination.Item>
    );
  }

  return (
    <div className="d-flex justify-content-center my-4">
      <BsPagination>
        <BsPagination.Prev
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        />
        {items}
        <BsPagination.Next
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
      </BsPagination>
    </div>
  );
};

export default Pagination;
