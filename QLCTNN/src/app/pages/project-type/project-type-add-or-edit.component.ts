import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProjectTypeService } from 'src/app/services/project-type.service';
import { ProjectType } from 'src/app/core/models/project-type.model';

@Component({
  selector: 'app-project-type-add-or-edit',
  templateUrl: './project-type-add-or-edit.component.html',
  styleUrls: ['./project-type-add-or-edit.component.css']
})
export class ProjectTypeAddOrEditComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  @Input() id: number;
  values: string[] = [];
  newValue: string = '';
  // Các trường ngưỡng dựa trên các giá trị đặc thù
  get moreRowOptions(): string[] {
    return Array.from(new Set(this.values));
  }
  // Các trường được chọn làm ngưỡng (TenNguong)
  selectedTenNguong: string[] = [];

  constructor(
    private fb: FormBuilder,
    private projectTypeService: ProjectTypeService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ProjectTypeAddOrEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number }
  ) {   
    this.id = data?.id ?? 0;
    console.log(this.id);
    
  }

  ngOnInit(): void {
    this.initForm();
    if (this.id && this.id > 0) {
      this.loadForEdit(this.id);
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      Code: ['', [Validators.required, Validators.minLength(2)]],
      TenLoai: ['', [Validators.required, Validators.minLength(3)]],
      MoTa: ['']
    });
  }

  parseValuesFromString(valueStr: string): void {
    if (!valueStr || !valueStr.trim()) {
      this.values = [];
    } else {
      this.values = valueStr.split(',').map(v => v.trim()).filter(v => v);
    }
  }

  convertValuesToString(): string {
    return this.values.join(',');
  }

  addValue(): void {
    if (this.newValue && this.newValue.trim()) {
      const trimmedValue = this.newValue.trim();
      if (!this.values.includes(trimmedValue)) {
        this.values.push(trimmedValue);
        this.newValue = '';
      } else {
        this.snackBar.open('Giá trị này đã tồn tại', 'Đóng', { duration: 2000 });
      }
    }
  }

  removeValue(index: number): void {
    const removed = this.values.splice(index, 1)[0];
    if (removed) {
      this.selectedTenNguong = this.selectedTenNguong.filter(s => s !== removed);
    }
    if (this.values.length === 0) {
      this.selectedTenNguong = [];
    }
  }

  async loadForEdit(id: number): Promise<void> {
    this.loading = true;
    try {
      const res: any = await this.projectTypeService.getById(id);
      const item: ProjectType = res.data;
      this.form.patchValue({
        Code: item.Code,
        TenLoai: item.TenLoai,
        MoTa: item.MoTa
      });
      if (item.Value && Array.isArray(item.Value)) {
        this.values = [...item.Value];
      } else if (item.Value && typeof item.Value === 'string') {
        this.parseValuesFromString(item.Value);
      }

      // Nếu server trả TenNguong (mảng hoặc chuỗi) thì parse và gán
      if ((item as any).TenNguong && Array.isArray((item as any).TenNguong)) {
        this.selectedTenNguong = [...(item as any).TenNguong];
      } else if ((item as any).TenNguong && typeof (item as any).TenNguong === 'string') {
        this.selectedTenNguong = (item as any).TenNguong.split(',').map((v: string) => v.trim()).filter((v: string) => v);
      }
    } catch (err: any) {
      this.snackBar.open('Đang có lỗi xảy ra vui lòng thử lại sau!', 'Đóng', { duration: 3000 });
      this.dialogRef.close({ saved: false });
    } finally {
      this.loading = false;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    this.loading = true;
    const formData: any = { ...this.form.value };
    formData.value = this.values;
    formData.TenNguong = this.selectedTenNguong;

    try {
      if (this.id && this.id > 0) {
        const res: any = await this.projectTypeService.update({ ...formData, Id: this.id });
        if (res.meta?.error_code === 200) {
          this.snackBar.open('Cập nhật thành công', 'Đóng', { duration: 2000 });
          this.dialogRef.close({ saved: true });
        } else {
          this.snackBar.open('Đang có lỗi xảy ra vui lòng thử lại sau!', 'Đóng', { duration: 3000 });
        }
      } else {
        const res: any = await this.projectTypeService.create(formData);
        if (res.meta?.error_code === 200) {
          this.snackBar.open('Lưu thành công', 'Đóng', { duration: 2000 });
          this.dialogRef.close({ saved: true });
        } else {
          this.snackBar.open('Đang có lỗi xảy ra vui lòng thử lại sau!', 'Đóng', { duration: 3000 });
        }
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
