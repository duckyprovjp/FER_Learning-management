/**
 * Định dạng chuỗi ngày ISO sang định dạng ngày tháng tiếng Việt (DD/MM/YYYY)
 * @param {string|Date} dateString
 * @param {boolean} includeTime Có bao gồm giờ phút hay không
 * @returns {string}
 */
export function formatDate(dateString, includeTime = false) {
  if (!dateString) return '---';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '---';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  if (includeTime) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  }

  return `${day}/${month}/${year}`;
}

export default formatDate;
