export interface TinhTrangCongTrinh {
  Id?: number;
  LCTId?: number | null; // Loại công trình Id
  CTId?: number | null;  // Công trình Id
  TenNguong: string;     // Tên ngưỡng (một giá trị)
  Value: number;         // Giá trị đo được
  Date: string;          // ISO date string
  Note?: string | null;
  CreatedAt?: string;
  UpdatedAt?: string;
}