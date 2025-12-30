import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../auth/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProjectTypeComponent } from './project-type/project-type.component';
import { CongTrinhComponent } from './cong-trinh/cong-trinh.component';
import { TinhTrangComponent } from './tinh-trang/tinh-trang.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, title: 'Dashboard', canActivate: [authGuard] },
  { path: 'type-ctnn', component: ProjectTypeComponent, title: 'Quản lý loại công trình', canActivate: [authGuard] },
  { path: 'cong-trinh', component: CongTrinhComponent, title: 'Quản lý công trình', canActivate: [authGuard] },
  { path: 'tinh-trang', component: TinhTrangComponent, title: 'Quản lý tình trạng công trình', canActivate: [authGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
