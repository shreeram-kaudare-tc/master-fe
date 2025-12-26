import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirmation-popup',
  imports: [NgIf],
  standalone: true,
  templateUrl: './confirmation-popup.component.html',
})
export class ConfirmationPopupComponent {
  @Input() button_title = ''
  @Input() color = ''
  @Input() confirmation_message = ''
  @Input() cancel_title: any;
  @Input() Cancel_option: any = false
  @Input() popup_title = ''
  @Input() router_link = ''
  // @Input() redirect = '' || '/dashboard';
  @ViewChild('confirmation') confirmation: any;
  @Output() close_modal_clicked: any = new EventEmitter();
  is_popup_visible: any;


  constructor(public router: Router,) { }

  open() {
    this.is_popup_visible = true
  }
  close() {
    this.is_popup_visible = false
    this.close_modal_clicked.emit();
  }
}
