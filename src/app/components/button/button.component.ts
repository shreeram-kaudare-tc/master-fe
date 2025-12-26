import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-button',
    imports: [CommonModule],
    templateUrl: './button.component.html',
    styleUrl: './button.component.css',
    standalone: true,
})
export class ButtonComponent {

  @Input() color: string = '';
  @Input() icon: any = '';
  @Input() label: string = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';   
  @Input() icon_alignment: 'left' | 'right' = 'left';
  @Input() placement: 'header' | '' = '';
  @Input() disabled: boolean = false
  cancel: any;
  confirm: any;
  
  on_cancel_click(): void {
    this.cancel.emit();
  }

  on_confirm_click(): void {
    this.confirm.emit();
  }
}
