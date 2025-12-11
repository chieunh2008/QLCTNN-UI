import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-shared-card',
  templateUrl: './shared-card.component.html',
  styleUrls: ['./shared-card.component.css']
})
export class SharedCardComponent {
  @Input() header: string = '';
  @Input() width: string = '100%';
  @Input() borderRadius: string = '8px';
  @Input() padding: string = '16px';
  @Input() background: string = '#fff';
}
