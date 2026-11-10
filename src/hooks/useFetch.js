import { useState, useEffect, useCallback } from 'react';

/**
 * Hook tùy biến hỗ trợ fetch dữ liệu kèm loading, error và hàm refetch
 * @param {Function} fetchFunction Hàm bất đồng bộ gọi API
 * @param {Array} dependencies Mảng phụ thuộc để re-trigger fetch
 * @param {boolean} immediate Thực thi ngay khi mount hay không
 */
export function useFetch(fetchFunction, dependencies = [], immediate = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'Đã có lỗi xảy ra');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, loading, error, refetch: execute, setData };
}

export default useFetch;
