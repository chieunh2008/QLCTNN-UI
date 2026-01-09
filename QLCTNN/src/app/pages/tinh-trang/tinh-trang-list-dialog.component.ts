import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { TinhTrangService } from 'src/app/services/tinh-trang.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TinhTrangAddOrEditComponent } from './tinh-trang-add-or-edit.component';
import { ConfirmDialogComponent } from 'src/app/shared/component/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-tinh-trang-list-dialog',
  templateUrl: './tinh-trang-list-dialog.component.html',
  styleUrls: ['./tinh-trang-list-dialog.component.css']
})
export class TinhTrangListDialogComponent implements OnInit {
  LCTId?: number;
  CTId?: number;
  TenNguong?: string;

  loading = false;
  items: any[] = [];

  displayedColumns: string[] = ['stt', 'Value', 'Date', 'Note', 'actions'];

  constructor(
    private dialogRef: MatDialogRef<TinhTrangListDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private tinhTrangService: TinhTrangService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.LCTId = data?.LCTId;
    this.CTId = data?.CTId;
    this.TenNguong = data?.TenNguong;
    console.log(data);
    
  }

  ngOnInit(): void {
    this.loadMeasurements();
  }

  loadMeasurements(): void {
    this.loading = true;
    const payload: any = { Id: this.CTId, TenNguong: this.TenNguong};
    this.tinhTrangService.getByCTId(payload).then((res: any) => {
      const responseData = res?.data;
      const items = responseData?.Items || responseData || [];
      this.items = items;
      this.loading = false;
    }).catch(() => {
      this.items = [];
      this.loading = false;
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  openAddMeasurement(): void {
    const ref = this.dialog.open(TinhTrangAddOrEditComponent, {
      width: '600px',
      data: { id: 0, LCTId: this.LCTId, CTId: this.CTId, TenNguong: this.TenNguong }
    });
    ref.afterClosed().subscribe((res: any) => {
      if (res?.saved) this.loadMeasurements();
    });
  }

  openEditMeasurement(item: any): void {
    const ref = this.dialog.open(TinhTrangAddOrEditComponent, {
      width: '600px',
      data: { id: item.Id }
    });
    ref.afterClosed().subscribe((res: any) => {
      if (res?.saved) this.loadMeasurements();
    });
  }

  deleteMeasurement(item: any): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: { title: 'Xóa giá trị đo', message: 'Bạn có chắc chắn muốn xóa giá trị này?', confirmButtonText: 'Xóa', cancelButtonText: 'Hủy' },
      panelClass: 'confirm-dialog'
    });

    ref.afterClosed().subscribe(async (confirmed: boolean) => {
      if (!confirmed) return;
      try {
        const res: any = await this.tinhTrangService.delete(item.Id);
        if (res.meta?.error_code === 200) {
          this.snackBar.open('Xóa thành công', 'Đóng', { duration: 2000 });
          this.loadMeasurements();
        } else {
          this.snackBar.open('Đang có lỗi xảy ra vui lòng thử lại sau!', 'Đóng', { duration: 3000 });
        }
      } catch (err: any) {
        this.snackBar.open('Đang có lỗi xảy ra vui lòng thử lại sau!', 'Đóng', { duration: 3000 });
      }
    });
  }
}