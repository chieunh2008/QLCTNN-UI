import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getErrorMessage } from 'src/app/shared/error-helper';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/component/confirm-dialog/confirm-dialog.component';
import { ProjectTypeService } from 'src/app/services/project-type.service';
import { ProjectTypeFilter } from 'src/app/core/models/project-type-filter.model';
import { ProjectType } from 'src/app/core/models/project-type.model';
import { ProjectTypeAddOrEditComponent } from './project-type-add-or-edit.component';

@Component({
  selector: 'app-project-type',
  templateUrl: './project-type.component.html',
  styleUrls: ['./project-type.component.css']
})
export class ProjectTypeComponent implements OnInit {
  projectTypes: ProjectType[] = [];
  filterForm!: FormGroup;
  showFilter = false;
  loading = false;
  filter = new ProjectTypeFilter();
  displayedColumns: string[] = ['stt', 'Code', 'TenLoai', 'MoTa', 'actions'];
  totalPages = 10;
  totalRecords = 0;
  pageButtons: number[] = [];
  Math = Math;

  constructor(
    private fb: FormBuilder,
    private projectTypeService: ProjectTypeService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initFilterForm();
    this.loadProjectTypes();
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
    this.filter = new ProjectTypeFilter(
      filterValues.query,
      filterValues.startDate,
      filterValues.endDate,
      filterValues.pageIndex,
      10,
      filterValues.search,
      filterValues.orderBy
    );
    this.filter.pageIndex = 1;
    this.loadProjectTypes();
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
    this.filter = new ProjectTypeFilter();
    this.filter.pageSize = 10;
    this.loadProjectTypes();
  }

  loadProjectTypes(): void {
    this.loading = true;
    this.projectTypeService.getAll(this.filter).then((data: any) => {
      // Handle new API response format: data.TotalCount and data.Items
      const responseData = data.data;
      const items = responseData?.Items || responseData || [];
      
      this.totalRecords = responseData?.TotalCount || items.length;
      this.totalPages = Math.ceil(this.totalRecords / this.filter.pageSize);
      
      // API đã làm server-side pagination, sử dụng items trực tiếp
      this.projectTypes = items;
      
      this.computePageButtons();
      this.loading = false;
    }).catch((err: any) => {
      this.snackBar.open('Đang có lỗi xảy ra vui lòng thử lại sau!', 'Đóng', { duration: 3000 });
      this.loading = false;
    });
  }

  openForm(item?: ProjectType): void {
    // kept for backward compat in case template calls it; open add dialog when called without item
    if (item) {
      this.openEdit(item);
    } else {
      this.openAdd();
    }
  }
  onPageIndexChange(newIndex: number): void {
    this.filter.pageIndex = newIndex;
    this.filterForm.patchValue({ pageIndex: newIndex });
    this.computePageButtons();
    this.loadProjectTypes();
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
      this.loadProjectTypes();
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

  getCurrentDisplayCount(): number {
    const start = (this.filter.pageIndex - 1) * this.filter.pageSize + 1;
    const end = Math.min(this.filter.pageIndex * this.filter.pageSize, this.totalRecords);
    return end - start + 1;
  }

  openAdd(): void {
    const ref = this.dialog.open(ProjectTypeAddOrEditComponent, {
      width: '80%',
      data: { id: 0 }
    });
    ref.afterClosed().subscribe((res: any) => {
      if (res?.saved) this.loadProjectTypes();
    });
  }

  openEdit(item: ProjectType): void {
    console.log(item);
    const ref = this.dialog.open(ProjectTypeAddOrEditComponent, {
      width: '80%',
      data: { id: item.Id }
    });
    ref.afterClosed().subscribe((res: any) => {
      if (res?.saved) this.loadProjectTypes();
    });
  }

  private async loadProjectTypesAsync(): Promise<void> {
    this.loading = true;
    try {
      console.log(this.filter);
      
      const data: any = await this.projectTypeService.getAll(this.filter);
      this.projectTypes = data.data || [];
    } catch (err: any) {
      this.snackBar.open('Đang có lỗi xảy ra vui lòng thử lại sau!', 'Đóng', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  async deleteProjectType(id: number): Promise<void> {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: { title: 'Xóa loại dự án', message: 'Bạn có chắc chắn muốn xóa?', confirmButtonText: 'Xóa', cancelButtonText: 'Hủy' },
      panelClass: 'confirm-dialog'
    });

    ref.afterClosed().subscribe(async (confirmed: boolean) => {
      if (!confirmed) return;
      this.loading = true;
      try {
        const res: any = await this.projectTypeService.delete(id);
        if (res.meta.error_code === 200) {
          this.snackBar.open('Xóa thành công!', 'Đóng', { duration: 2000 });
          await this.loadProjectTypesAsync();
        } else {
          this.snackBar.open('Đang có lỗi xảy ra vui lòng thử lại sau!', 'Đóng', { duration: 2000 });
        }
      } catch (err: any) {
        this.snackBar.open('Đang có lỗi xảy ra vui lòng thử lại sau!', 'Đóng', { duration: 3000 });
      } finally {
        this.loading = false;
      }
    });
  }

  getValueDisplay(values: string[]): string {
    return values && values.length > 0 ? values.join(', ') : 'N/A';
  }
}
