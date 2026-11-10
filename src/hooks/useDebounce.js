import { useState, useEffect } from 'react';

/**
 * Hook tùy biến hỗ trợ trì hoãn giá trị (debounce), hữu ích cho ô tìm kiếm
 * @param {any} value Giá trị cần debounce
 * @param {number} delay Thời gian chờ (ms)
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
