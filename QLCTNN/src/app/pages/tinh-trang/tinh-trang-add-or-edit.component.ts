import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getErrorMessage } from 'src/app/shared/error-helper';
import { CongTrinhService } from 'src/app/services/cong-trinh.service';
import { ProjectTypeService } from 'src/app/services/project-type.service';
import { TinhTrangService } from 'src/app/services/tinh-trang.service';
import { CongTrinh } from 'src/app/core/models/cong-trinh.model';
import { ProjectType } from 'src/app/core/models/project-type.model';
import { TinhTrangCongTrinh } from 'src/app/core/models/tinh-trang.model';

@Component({
  selector: 'app-tinh-trang-add-or-edit',
  templateUrl: './tinh-trang-add-or-edit.component.html',
  styleUrls: ['./tinh-trang-add-or-edit.component.css']
})
export class TinhTrangAddOrEditComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  congTrinhs: CongTrinh[] = [];
  filteredCongTrinhs: CongTrinh[] = [];
  projectTypes: ProjectType[] = [];
  tenNguongOptions: string[] = [];

  constructor(
    private fb: FormBuilder,
    private congTrinhService: CongTrinhService,
    private projectTypeService: ProjectTypeService,
    private tinhTrangService: TinhTrangService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<TinhTrangAddOrEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  async ngOnInit(): Promise<void> {
    this.initForm();

    // Wait for lookup lists to load before applying any prefill data
    await Promise.all([this.loadCongTrinhs(), this.loadProjectTypes()]);

    if (this.data?.id && this.data.id > 0) {
      await this.loadForEdit(this.data.id);
    } else if (this.data) {
      const { LCTId, CTId, TenNguong } = this.data;

      if (LCTId) {
        this.form.patchValue({ LCTId });
        this.filteredCongTrinhs = this.congTrinhs.filter(c => c.LoaiId === LCTId);
        this.form.get('CTId')?.enable();
      }

      if (CTId) {
        this.form.patchValue({ CTId });
        this.updateTenNguongOptions(CTId);
        if (TenNguong) {
          this.form.patchValue({ TenNguong });
        }
      } else if (TenNguong) {
        // If only TenNguong provided, ensure it's available in options and set it
        if (!this.tenNguongOptions.includes(TenNguong)) {
          this.tenNguongOptions = [TenNguong, ...this.tenNguongOptions];
        }
        this.form.patchValue({ TenNguong });
      }
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      LCTId: [null, Validators.required],
      CTId: [{ value: null, disabled: true }, Validators.required],
      TenNguong: [null, Validators.required],
      Value: [null, [Validators.required]],
      Date: [this.formatDateForInput(new Date()), Validators.required],
      Note: ['']
    });

    // When LCTId changes, filter CTs and enable CT select only when LCTId is set
    this.form.get('LCTId')?.valueChanges.subscribe((lctId: number) => {
      if (lctId) {
        this.filteredCongTrinhs = this.congTrinhs.filter(c => c.LoaiId === lctId);
        this.form.get('CTId')?.enable();
      } else {
        this.filteredCongTrinhs = [];
        this.form.get('CTId')?.reset();
        this.form.get('CTId')?.disable();
        this.tenNguongOptions = [];
        this.form.get('TenNguong')?.reset();
      }
    });

    // When project selection changes, update tenNguongOptions
    this.form?.get('CTId')?.valueChanges.subscribe((val: number) => {
      this.updateTenNguongOptions(val);
    });
  }

  loadCongTrinhs(): Promise<void> {
    const f: any = { pageSize: 1000, pageIndex: 1 };
    return this.congTrinhService.getAll(f).then((data: any) => {
      const responseData = data.data;
      this.congTrinhs = responseData?.Items || responseData || [];
      // Keep filtered list in sync if LCT already selected
      const curLct = this.form?.get('LCTId')?.value;
      if (curLct) this.filteredCongTrinhs = this.congTrinhs.filter(c => c.LoaiId === curLct);
    }).catch(() => { this.congTrinhs = []; });
  }

  loadProjectTypes(): Promise<void> {
    const f: any = { pageSize: 1000, pageIndex: 1 };
    return this.projectTypeService.getAll(f).then((data: any) => {
      const responseData = data.data;
      this.projectTypes = responseData?.Items || responseData || [];
    }).catch(() => { this.projectTypes = []; });
  }

  updateTenNguongOptions(ctId?: number): void {
    this.tenNguongOptions = [];
    if (!ctId) return;
    const ct = this.congTrinhs.find(c => c.Id === ctId);
    if (!ct) return;
    const fromCt = ct.TenNguong || [];
    const fromType = this.projectTypes.find(pt => pt.Id === ct.LoaiId)?.TenNguong || [];
    this.tenNguongOptions = Array.from(new Set([...(fromCt || []), ...(fromType || [])]));
    // If LCTId not set, set it automatically
    if (!this.form.get('LCTId')?.value) {
      this.form.patchValue({ LCTId: ct.LoaiId });
      this.filteredCongTrinhs = this.congTrinhs.filter(c => c.LoaiId === ct.LoaiId);
      this.form.get('CTId')?.enable();
    }
  }

  parseDateToIso(d: any): string {
    if (!d) return new Date().toISOString();
    if (typeof d === 'string') {
      // Accept both native datetime-local (YYYY-MM-DDTHH:mm) and ISO strings
      const parsed = new Date(d);
      return parsed.toISOString();
    }
    return new Date(d).toISOString();
  }

  /**
   * Format a date for the native datetime-local input: YYYY-MM-DDTHH:mm
   */
  formatDateForInput(d: any): string {
    if (!d) return '';
    const date = d instanceof Date ? d : new Date(d);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  }

  async loadForEdit(id: number): Promise<void> {
    this.loading = true;
    try {
      const res: any = await this.tinhTrangService.getById(id);
      const item: TinhTrangCongTrinh = res.data;
      this.form.patchValue({
        LCTId: item.LCTId ?? null,
        CTId: item.CTId ?? null,
        TenNguong: item.TenNguong,
        Value: item.Value,
        Date: item.Date ? this.formatDateForInput(new Date(item.Date)) : this.formatDateForInput(new Date()),
        Note: item.Note || ''
      });
      this.updateTenNguongOptions(item.CTId ?? undefined);
    } catch (err: any) {
      this.snackBar.open('Đang có lỗi xảy ra vui lòng thử lại sau!', 'Đóng', { duration: 3000 });
      this.dialogRef.close({ saved: false });
    } finally {
      this.loading = false;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.snackBar.open('Vui lòng điền đầy đủ thông tin', 'Đóng', { duration: 2000 });
      return;
    }

    this.loading = true;
    const payload: any = {
      ...this.form.value,
      Date: this.parseDateToIso(this.form.value.Date)
    };

    try {
      let res: any;
      if (this.data?.id && this.data.id > 0) {
        res = await this.tinhTrangService.update({ ...payload, Id: this.data.id });
      } else {
        res = await this.tinhTrangService.create(payload);
      }

      if (res.meta?.error_code === 200) {
        this.snackBar.open('Lưu thành công', 'Đóng', { duration: 2000 });
        this.dialogRef.close({ saved: true });
      } else {
        this.snackBar.open('Đang có lỗi xảy ra vui lòng thử lại sau!', 'Đóng', { duration: 3000 });
      }
    } catch (err: any) {
      this.snackBar.open('Đang có lỗi xảy ra vui lòng thử lại sau!', 'Đóng', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  onCancel(): void {
    this.dialogRef.close({ saved: false });
  }
}
