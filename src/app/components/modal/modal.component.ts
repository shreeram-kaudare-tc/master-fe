import { NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-model',
  imports: [NgIf, NgClass],
  standalone: true,
  templateUrl: './modal.component.html',
  providers: [{ provide: NG_VALUE_ACCESSOR, multi: true, useExisting: ModelComponent }]
})

export class ModelComponent {
  @Input() is_popup_visible: boolean = false
  @Input() hide_cross_icon: boolean = false
  @Input() list: any = []
  @Input() title: any 
  @Input() width: any = 'md';
  @Input() scroll: any;
  @Input() redirect = true;
  @Input() is_mandatory = false;
  @Output() close_modal_clicked = new EventEmitter();

  handleEscape(event: KeyboardEvent) {
    if (!this.is_mandatory) {
      this.close()
    }
  }

  constructor(public router: Router, public ar: ActivatedRoute) { }
  open() { this.is_popup_visible = true }

  close() {
    if (!this.is_popup_visible) return;
    this.is_popup_visible = false;
    this.close_modal_clicked.emit();

    if (this.redirect) {
      const queryParams = { ...this.ar.snapshot.queryParams };
      delete queryParams['id']; // Remove only 'id'
      delete queryParams['action']; // Remove only 'action'

      this.router.navigate([], {
        relativeTo: this.ar,
        queryParams,
        replaceUrl: true, // optional: avoids pushing to history
      });
    }
  }
}
