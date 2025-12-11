import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProjectTypeComponent } from './project-type/project-type.component';
import { ProjectTypeAddOrEditComponent } from './project-type/project-type-add-or-edit.component';
import { CongTrinhComponent } from './cong-trinh/cong-trinh.component';
import { CongTrinhAddOrEditComponent } from './cong-trinh/cong-trinh-add-or-edit.component';
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


@NgModule({
  declarations: [
    DashboardComponent,
    ProjectTypeComponent,
    ProjectTypeAddOrEditComponent,
    CongTrinhComponent,
    CongTrinhAddOrEditComponent
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
    MatDividerModule
  ]
})
export class PagesModule { }
