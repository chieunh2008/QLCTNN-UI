import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardDetailDialogComponent } from './dashboard/dashboard-detail-dialog.component';
import { DashboardTypeDialogComponent } from './dashboard/dashboard-type-dialog.component';
import { ProjectTypeComponent } from './project-type/project-type.component';
import { ProjectTypeAddOrEditComponent } from './project-type/project-type-add-or-edit.component';
import { CongTrinhComponent } from './cong-trinh/cong-trinh.component';
import { CongTrinhAddOrEditComponent } from './cong-trinh/cong-trinh-add-or-edit.component';
import { TinhTrangComponent } from './tinh-trang/tinh-trang.component';
import { TinhTrangAddOrEditComponent } from './tinh-trang/tinh-trang-add-or-edit.component';
import { TinhTrangListDialogComponent } from './tinh-trang/tinh-trang-list-dialog.component';
import { ProjectLocationComponent } from './project-location/project-location.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PagesRoutingModule } from './pages-routing.module';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { SharedModule } from '../shared/shared.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';


@NgModule({
  declarations: [
    DashboardComponent,
    ProjectTypeComponent,
    ProjectTypeAddOrEditComponent,
    CongTrinhComponent,
    CongTrinhAddOrEditComponent,
    TinhTrangComponent,
    TinhTrangAddOrEditComponent,
    TinhTrangListDialogComponent,
    ProjectLocationComponent,
    // Dashboard dialogs
    DashboardDetailDialogComponent,
    DashboardTypeDialogComponent,
    // TinhTrang dialogs
    TinhTrangListDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PagesRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    SharedModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class PagesModule { }
