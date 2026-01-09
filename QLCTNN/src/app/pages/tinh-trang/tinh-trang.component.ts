import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from 'src/app/shared/component/confirm-dialog/confirm-dialog.component';
import { CongTrinh } from 'src/app/core/models/cong-trinh.model';
import { ProjectType } from 'src/app/core/models/project-type.model';
import { TinhTrangCongTrinh } from 'src/app/core/models/tinh-trang.model';
import { CongTrinhService } from 'src/app/services/cong-trinh.service';
import { ProjectTypeService } from 'src/app/services/project-type.service';
import { TinhTrangService } from 'src/app/services/tinh-trang.service';
import { TinhTrangAddOrEditComponent } from './tinh-trang-add-or-edit.component';
import { TinhTrangListDialogComponent } from './tinh-trang-list-dialog.component'; 

@Component({
  selector: 'app-tinh-trang',
  templateUrl: './tinh-trang.component.html',
  styleUrls: ['./tinh-trang.component.css']
})
export class TinhTrangComponent implements OnInit {
  loading = false;
  items: TinhTrangCongTrinh[] = [];
  congTrinhs: CongTrinh[] = [];
  filteredCongTrinhs: CongTrinh[] = [];
  projectTypes: ProjectType[] = [];
  // New columns: TenLoaiCongTrinh, TenCongTrinh, TenNguong, Status, Message, actions
  displayedColumns: string[] = ['stt', 'TenLoaiCongTrinh', 'TenCongTrinh', 'TenNguong','actions'];

  // Filter & pagination
  filterForm!: FormGroup;
  showFilter = false;
  filter: any = { pageIndex: 1, pageSize: 10 }; 
  totalPages = 1;
  totalRecords = 0;
  pageButtons: number[] = [];
  Math = Math;

  constructor(
    private tinhTrangService: TinhTrangService,
    private congTrinhService: CongTrinhService,
    private projectTypeService: ProjectTypeService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadProjectTypes();
    this.initFilterForm();
    this.loadCongTrinhs();
    this.loadItems();
  }

  initFilterForm(): void {
    this.filterForm = this.fb.group({
      query: [''],
      LCTId: [null],
      CTId: [null],
      startDate: [null],
      endDate: [null],
      pageIndex: [1]
    });

    // When LCT filter changes, update filtered CT list and clear CT selection if needed
    this.filterForm.get('LCTId')?.valueChanges.subscribe((lctId: number | null) => {
      if (lctId) {
        this.filteredCongTrinhs = this.congTrinhs.filter(c => c.LoaiId === lctId);
      } else {
        this.filteredCongTrinhs = [...this.congTrinhs];
        this.filterForm.get('CTId')?.setValue(null);
      }
    });
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }

  onFilterChange(): void {
    const fv = this.filterForm.value;
    this.filter = {
      query: fv.query,
      CTId: fv.CTId,
      startDate: fv.startDate,
      endDate: fv.endDate,
      pageIndex: 1,
      pageSize: this.filter.pageSize
    };
    this.filter.pageIndex = 1;
    this.loadItems();
  }

  resetFilter(): void {
    this.filterForm.reset({ query: '', LCTId: null, CTId: null, startDate: null, endDate: null, pageIndex: 1 });
    this.filter = { pageIndex: 1, pageSize: this.filter.pageSize };
    // reset filtered CT list
    this.filteredCongTrinhs = [...this.congTrinhs];
    this.loadItems();
  }

  loadCongTrinhs(): void {
    const filter: any = { pageSize: 1000, pageIndex: 1 };
    this.tinhTrangService.getAll(filter).then((data: any) => {
      const responseData = data.data;
      this.congTrinhs = responseData?.Items || responseData || [];
      // Initialize filtered list
      this.filteredCongTrinhs = [...this.congTrinhs];
      // If a LCT is already selected in the filter, apply it
      const curLct = this.filterForm?.get('LCTId')?.value;
      if (curLct) this.filteredCongTrinhs = this.congTrinhs.filter(c => c.LoaiId === curLct);
    }).catch(() => {
      this.congTrinhs = [];
      this.filteredCongTrinhs = [];
    });
  }

  loadProjectTypes(): void {
    const filter: any = { pageSize: 1000, pageIndex: 1 };
    this.projectTypeService.getAll(filter).then((data: any) => {
      const responseData = data.data;
      this.projectTypes = responseData?.Items || responseData || [];
    }).catch(() => {
      this.projectTypes = [];
    });
  }

  loadItems(): void {
    this.loading = true;
    // Use GetList API (non-paginated) to load current statuses
    const payload: any = {
      LCTId: this.filter.LCTId ?? null,
      CTId: this.filter.CTId ?? null,
      query: this.filter.query ?? null
    };

    this.tinhTrangService.getList().then((data: any) => {
      const items = data?.data || data || [];
      this.items = items;
      // No pagination for list endpoint
      this.totalRecords = items.length;
      this.totalPages = 1;
      this.pageButtons = [];
      this.loading = false;
    }).catch((err: any) => {
      this.snackBar.open('Đang có lỗi xảy ra vui lòng thử lại sau!', 'Đóng', { duration: 3000 });
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
      this.loadItems();
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
    const ref = this.dialog.open(TinhTrangAddOrEditComponent, {
      width: '600px',
      data: { id: 0 }
    });
    ref.afterClosed().subscribe((res: any) => {
      if (res?.saved) this.loadItems();
    });
  }

  openAddFor(item: any): void {
    const ref = this.dialog.open(TinhTrangAddOrEditComponent, {
      width: '600px',
      data: { id: 0, LCTId: item.LCTId, CTId: item.CTId, TenNguong: item.TenNguong }
    });
    ref.afterClosed().subscribe((res: any) => {
      if (res?.saved) this.loadItems();
    });
  }

  openManageMeasurements(item: any): void {
    console.log(item);
    
    const ref = this.dialog.open(TinhTrangListDialogComponent, {
      width: '90vw',
      data: { LCTId: item.LCTId, CTId: item.CTId, TenNguong: item.TenNguong }
    });

    ref.afterClosed().subscribe(() => this.loadItems());
  }

  async deleteThreshold(item: any): Promise<void> {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: { title: 'Xóa cấu hình', message: 'Bạn có chắc chắn muốn xóa cấu hình này?', confirmButtonText: 'Xóa', cancelButtonText: 'Hủy' },
      panelClass: 'confirm-dialog'
    });

    ref.afterClosed().subscribe(async (confirmed: boolean) => {
      if (!confirmed) return;
      this.loading = true;
      try {
        const res: any = await this.tinhTrangService.deleteByKey({ LCTId: item.LCTId, CTId: item.CTId, TenNguong: item.TenNguong });
        if (res.meta?.error_code === 200) {
          this.snackBar.open('Xóa cấu hình thành công', 'Đóng', { duration: 2000 });
          this.loadItems();
        } else {
          this.snackBar.open('Đang có lỗi xảy ra vui lòng thử lại sau!', 'Đóng', { duration: 3000 });
        }
      } catch (err: any) {
        this.snackBar.open('Đang có lỗi xảy ra vui lòng thử lại sau!', 'Đóng', { duration: 3000 });
      } finally {
        this.loading = false;
      }
    });
  }

  getProjectName(ctId?: number): string {
    const p = this.congTrinhs.find(c => c.Id === ctId);
    return p ? p.TenCongTrinh : 'N/A';
  }

  statusClass(status: any): string {
    if (status == null) return 'status-normal';
    const s = String(status).toLowerCase();
    if (s.includes('warning')) return 'status-warning';
    if (s.includes('down') || s.includes('danger') || s.includes('critical')) return 'status-danger';
    if (s === '1' || s === '1' || s === 'active') return 'status-normal';
    return 'status-normal';
  }
}
