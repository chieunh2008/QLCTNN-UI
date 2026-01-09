export function getErrorMessage(err: any): string {
  if (!err) return 'Đã có lỗi xảy ra, vui lòng thử lại sau';

  // Try to read HTTP status or meta error code
  const status = err.status ?? err?.error?.status ?? err?.meta?.error_code;
  const metaMsg = err?.error?.meta?.error_message ?? err?.meta?.error_message ?? err?.error?.message;

  if (status) {
    switch (status) {
      case 201:
      case 401:
      case 403:
        return metaMsg || 'Lỗi xác thực. Vui lòng đăng nhập lại.';
      case 404:
        return metaMsg || 'Không tìm thấy bản ghi';
      case 400:
        return metaMsg || 'Yêu cầu không hợp lệ';
      case 500:
      default:
        return metaMsg || 'Đang có lỗi xảy ra, vui lòng thử lại sau';
    }
  }

  return metaMsg || err.message || 'Đã có lỗi xảy ra, vui lòng thử lại sau';
}
