import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LayoutRoutingModule } from './layout-routing.module';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { MenuLeftComponent } from './menu-left/menu-left.component';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';



@NgModule({
  declarations: [HeaderComponent, FooterComponent, MenuLeftComponent],
  imports: [
    CommonModule,
    LayoutRoutingModule,
    RouterModule,
    MatIconModule
  ],
  exports: [FooterComponent, HeaderComponent, MenuLeftComponent],
})
export class LayoutModule {}
