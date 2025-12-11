import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu-left',
  templateUrl: './menu-left.component.html',
  styleUrls: ['./menu-left.component.css']
})
export class MenuLeftComponent implements OnInit {
  menuItems: any[] = [];
  collapsed = false;

  ngOnInit() {
    const menu = localStorage.getItem('menuFunctions');
    this.menuItems = menu ? JSON.parse(menu) : [];
  }

  toggleMenu() {
    this.collapsed = !this.collapsed;
  }
}
