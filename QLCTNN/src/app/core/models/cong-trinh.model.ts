export interface CongTrinh {
  Id: number;
  LoaiId: number;
  TenCongTrinh: string;
  Code: string;
  DiaChi?: string;
  Lat: number;
  Lon: number;
  InfoValue?: string[];
  TenNguong?: string[];
  CreatedAt?: string;
  UpdatedAt?: string;
}
