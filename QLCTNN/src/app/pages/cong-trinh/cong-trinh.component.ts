import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CongTrinhService } from 'src/app/services/cong-trinh.service';
import { ProjectTypeService } from 'src/app/services/project-type.service';
import { CongTrinhFilter } from 'src/app/core/models/cong-trinh-filter.model';
import { CongTrinh } from 'src/app/core/models/cong-trinh.model';
import { ProjectType } from 'src/app/core/models/project-type.model';
import { CongTrinhAddOrEditComponent } from './cong-trinh-add-or-edit.component';

@Component({
  selector: 'app-cong-trinh',
  templateUrl: './cong-trinh.component.html',
  styleUrls: ['./cong-trinh.component.css']
})
export class CongTrinhComponent implements OnInit {
  congTrinhs: CongTrinh[] = [];
  projectTypes: ProjectType[] = [];
  filterForm!: FormGroup;
  showFilter = false;
  loading = false;
  filter = new CongTrinhFilter();
  displayedColumns: string[] = ['stt', 'Code', 'TenCongTrinh', 'DiaChi', 'LoaiId', 'actions'];
  totalPages = 10;
  totalRecords = 0;
  pageButtons: number[] = [];
  Math = Math;

  constructor(
    private fb: FormBuilder,
    private congTrinhService: CongTrinhService,
    private projectTypeService: ProjectTypeService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProjectTypes();
    this.initFilterForm();
    this.loadCongTrinhs();
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }

  initFilterForm(): void {
    this.filter.pageSize = 10;
    this.filterForm = this.fb.group({
      query: [''],
      search: [''],
      startDate: [null],
      endDate: [null],
      pageIndex: [1],
      orderBy: ['']
    });
  }

  onFilterChange(): void {
    const filterValues = this.filterForm.value;
    this.filter = new CongTrinhFilter(
      filterValues.query,
      filterValues.startDate,
      filterValues.endDate,
      filterValues.pageIndex,
      10,
      filterValues.search,
      filterValues.orderBy
    );
    this.filter.pageIndex = 1;
    this.loadCongTrinhs();
  }

  resetFilter(): void {
    this.filterForm.reset({
      query: '',
      search: '',
      startDate: null,
      endDate: null,
      pageIndex: 1,
      orderBy: ''
    });
    this.filter = new CongTrinhFilter();
    this.filter.pageSize = 10;
    this.loadCongTrinhs();
  }

  loadProjectTypes(): void {
    const filter = new CongTrinhFilter();
    filter.pageSize = 1000;
    this.projectTypeService.getAll(filter).then((data: any) => {
      // Handle new API response format: data.TotalCount and data.Items
      const responseData = data.data;
      this.projectTypes = responseData?.Items || responseData || [];
    }).catch(() => {
      this.projectTypes = [];
    });
  }

  loadCongTrinhs(): void {
    this.loading = true;
    this.congTrinhService.getAll(this.filter).then((data: any) => {
      // Handle new API response format: data.TotalCount and data.Items
      const responseData = data.data;
      const items = responseData?.Items || responseData || [];
      
      this.totalRecords = responseData?.TotalCount || items.length;
      this.totalPages = Math.ceil(this.totalRecords / this.filter.pageSize);
      
      // API đã làm server-side pagination, sử dụng items trực tiếp
      this.congTrinhs = items;
      
      this.computePageButtons();
      this.loading = false;
    }).catch((err: any) => {
      this.snackBar.open('Lỗi tải dữ liệu: ' + (err?.error?.meta?.error_message || err.message), 'Đóng', { duration: 3000 });
      this.loading = false;
    });
  }

  computePageButtons(): void {
    const currentPage = this.filter.pageIndex;
    const visiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + visiblePages - 1);
    if (endPage - startPage + 1 < visiblePages) {
      startPage = Math.max(1, endPage - visiblePages + 1);
    }
    this.pageButtons = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.filter.pageIndex = page;
      this.filterForm.patchValue({ pageIndex: page });
      this.computePageButtons();
      this.loadCongTrinhs();
    }
  }

  prevPage(): void {
    if (this.filter.pageIndex > 1) {
      this.goToPage(this.filter.pageIndex - 1);
    }
  }

  nextPage(): void {
    if (this.filter.pageIndex < this.totalPages) {
      this.goToPage(this.filter.pageIndex + 1);
    }
  }

  firstPage(): void {
    this.goToPage(1);
  }

  lastPage(): void {
    this.goToPage(this.totalPages);
  }

  openAdd(): void {
    const ref = this.dialog.open(CongTrinhAddOrEditComponent, {
      width: '80%',
      data: { id: 0, projectTypes: this.projectTypes }
    });
    ref.afterClosed().subscribe((res: any) => {
      if (res?.saved) this.loadCongTrinhs();
    });
  }

  openEdit(item: CongTrinh): void {
    const ref = this.dialog.open(CongTrinhAddOrEditComponent, {
      width: '80%',
      data: { id: item.Id, projectTypes: this.projectTypes }
    });
    ref.afterClosed().subscribe((res: any) => {
      if (res?.saved) this.loadCongTrinhs();
    });
  }

  private async loadCongTrinhsAsync(): Promise<void> {
    this.loading = true;
    try {
      const data: any = await this.congTrinhService.getAll(this.filter);
      this.congTrinhs = data.data || [];
    } catch (err: any) {
      this.snackBar.open('Lỗi tải dữ liệu: ' + (err?.error?.meta?.error_message || err.message), 'Đóng', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  async deleteCongTrinh(id: number): Promise<void> {
    if (!confirm('Bạn có chắc chắn muốn xóa?')) {
      return;
    }

    this.loading = true;
    try {
      const res: any = await this.congTrinhService.delete(id);
      if (res.meta.error_code === 200) {
        this.snackBar.open('Xóa thành công!', 'Đóng', { duration: 2000 });
        await this.loadCongTrinhsAsync();
      } else {
        this.snackBar.open(res.meta.error_message, 'Đóng', { duration: 2000 });
      }
    } catch (err: any) {
      this.snackBar.open('Lỗi xóa: ' + (err?.error?.meta?.error_message || err.message), 'Đóng', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  getProjectTypeName(loaiId: number): string {
    const projectType = this.projectTypes.find(pt => pt.Id === loaiId);
    return projectType ? projectType.TenLoai : 'N/A';
  }

  getMoreRowValueDisplay(values: string[]): string {
    return values && values.length > 0 ? values.join(', ') : 'N/A';
  }
}
