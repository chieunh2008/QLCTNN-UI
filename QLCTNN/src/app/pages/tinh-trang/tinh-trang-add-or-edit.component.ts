import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
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
    @Inject(MAT_DIALOG_DATA) public data: { id: number }
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCongTrinhs();
    this.loadProjectTypes();

    if (this.data?.id && this.data.id > 0) {
      this.loadForEdit(this.data.id);
    }

    // When project selection changes, update tenNguongOptions
    this.form?.get('CTId')?.valueChanges.subscribe((val: number) => {
      this.updateTenNguongOptions(val);
    });
  }

  initForm(): void {
    this.form = this.fb.group({
      LCTId: [null, Validators.required],
      CTId: [{ value: null, disabled: true }, Validators.required],
      TenNguong: [null, Validators.required],
      Value: [null, [Validators.required]],
      Date: [null, Validators.required],
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

  loadCongTrinhs(): void {
    const f: any = { pageSize: 1000, pageIndex: 1 };
    this.congTrinhService.getAll(f).then((data: any) => {
      const responseData = data.data;
      this.congTrinhs = responseData?.Items || responseData || [];
      // Keep filtered list in sync if LCT already selected
      const curLct = this.form?.get('LCTId')?.value;
      if (curLct) this.filteredCongTrinhs = this.congTrinhs.filter(c => c.LoaiId === curLct);
    }).catch(() => this.congTrinhs = []);
  }

  loadProjectTypes(): void {
    const f: any = { pageSize: 1000, pageIndex: 1 };
    this.projectTypeService.getAll(f).then((data: any) => {
      const responseData = data.data;
      this.projectTypes = responseData?.Items || responseData || [];
    }).catch(() => this.projectTypes = []);
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
    if (typeof d === 'string') return d;
    return new Date(d).toISOString();
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
        Date: item.Date ? new Date(item.Date) : null,
        Note: item.Note || ''
      });
      this.updateTenNguongOptions(item.CTId ?? undefined);
    } catch (err: any) {
      this.snackBar.open('Lỗi tải dữ liệu: ' + (err?.error?.meta?.error_message || err.message), 'Đóng', { duration: 3000 });
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
        this.snackBar.open(res.meta?.error_message || 'Lỗi khi lưu', 'Đóng', { duration: 3000 });
      }
    } catch (err: any) {
      this.snackBar.open('Lỗi: ' + (err?.error?.meta?.error_message || err.message), 'Đóng', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  onCancel(): void {
    this.dialogRef.close({ saved: false });
  }
}
