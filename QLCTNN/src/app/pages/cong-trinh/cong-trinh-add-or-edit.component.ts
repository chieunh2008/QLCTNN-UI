import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CongTrinhService } from 'src/app/services/cong-trinh.service';
import { CongTrinh } from 'src/app/core/models/cong-trinh.model';
import { ProjectType } from 'src/app/core/models/project-type.model';

@Component({
  selector: 'app-cong-trinh-add-or-edit',
  templateUrl: './cong-trinh-add-or-edit.component.html',
  styleUrls: ['./cong-trinh-add-or-edit.component.css']
})
export class CongTrinhAddOrEditComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  loading = false;
  moreRowValues: string[] = [];
  newMoreRowValue = '';
  projectTypes: ProjectType[] = [];

  constructor(
    private fb: FormBuilder,
    private congTrinhService: CongTrinhService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<CongTrinhAddOrEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number; projectTypes: ProjectType[] }
  ) {
    this.projectTypes = data?.projectTypes || [];
    this.isEdit = data?.id !== 0;
  }

  ngOnInit(): void {
    this.initForm();
    if (this.isEdit) {
      this.loadForEdit();
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      Code: ['', [Validators.required, Validators.minLength(2)]],
      TenCongTrinh: ['', [Validators.required, Validators.minLength(3)]],
      DiaChi: [''],
      Lat: [null, [Validators.required, Validators.pattern(/^-?\d+(\.\d+)?$/)]],
      Lon: [null, [Validators.required, Validators.pattern(/^-?\d+(\.\d+)?$/)]],
      LoaiId: [null, Validators.required]
    });
  }

  loadForEdit(): void {
    this.loading = true;
    this.congTrinhService.getById(this.data.id).then((data: any) => {
      const congTrinh: CongTrinh = data.data;
      this.moreRowValues = this.parseValuesFromString(congTrinh.InfoValue);
      this.form.patchValue({
        Code: congTrinh.Code,
        TenCongTrinh: congTrinh.TenCongTrinh,
        DiaChi: congTrinh.DiaChi,
        Lat: congTrinh.Lat,
        Lon: congTrinh.Lon,
        LoaiId: congTrinh.LoaiId
      });
      this.loading = false;
    }).catch((err: any) => {
      this.snackBar.open('Lỗi tải dữ liệu: ' + (err?.error?.meta?.error_message || err.message), 'Đóng', { duration: 3000 });
      this.loading = false;
    });
  }

  parseValuesFromString(value: string | string[] | undefined): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return value.split(',').map(v => v.trim()).filter(v => v);
  }

  convertValuesToString(values: string[]): string {
    return values.join(',');
  }

  addMoreRowValue(): void {
    const trimmedValue = this.newMoreRowValue.trim();
    if (!trimmedValue) {
      this.snackBar.open('Vui lòng nhập giá trị', 'Đóng', { duration: 2000 });
      return;
    }
    if (this.moreRowValues.includes(trimmedValue)) {
      this.snackBar.open('Giá trị này đã tồn tại', 'Đóng', { duration: 2000 });
      return;
    }
    this.moreRowValues.push(trimmedValue);
    this.newMoreRowValue = '';
  }

  removeMoreRowValue(index: number): void {
    this.moreRowValues.splice(index, 1);
  }

  onCancel(): void {
    this.dialogRef.close({ saved: false });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.snackBar.open('Vui lòng điền đầy đủ thông tin', 'Đóng', { duration: 2000 });
      return;
    }

    this.loading = true;
    try {
      const formData = {
        ...this.form.value,
        MoreRowValue: this.moreRowValues
      };

      let res: any;
      if (this.isEdit) {
        res = await this.congTrinhService.update({ ...formData, Id: this.data.id });
      } else {
        res = await this.congTrinhService.create(formData);
      }

      if (res.meta.error_code === 200) {
        this.snackBar.open(this.isEdit ? 'Cập nhật thành công!' : 'Thêm mới thành công!', 'Đóng', { duration: 2000 });
        this.dialogRef.close({ saved: true });
      } else {
        this.snackBar.open(res.meta.error_message, 'Đóng', { duration: 2000 });
      }
    } catch (err: any) {
      this.snackBar.open('Lỗi: ' + (err?.error?.meta?.error_message || err.message), 'Đóng', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }
}
