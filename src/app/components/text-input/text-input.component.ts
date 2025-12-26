import { NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-text-input',
  imports: [FormsModule, NgIf, NgClass],
  templateUrl: './text-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: TextInputComponent,
      multi: true
    }
  ],
  standalone: true,
})
export class TextInputComponent implements ControlValueAccessor {
  @Input() data_list = []
  @Input() label = '';
  @Input() placeholder = '';
  @Input() disabled: any = false;
  @Input() isRequired: boolean = false;
  @Input() rounded: boolean = false;
  @Input() is_required: boolean = false;
  @Input() fetch: boolean = false;
  @Input() mask: boolean = false;
  @Input() text_type: boolean = true;
  @Input() type: 'text' | 'password' | 'email' | 'number' | 'text_number' | 'year_range' = 'text_number';
  @Input() type_total_latter: any = 0;
  @Input() copyable: boolean = false;
  @Input() custom_min_error_msg: string = '';
  @Input() custom_max_error_msg: string = '';
  @Input() custom_pattern_error_msg: string = '';
  @Input() custom_required_error_msg: string = '';
  @Output() fetch_activated = new EventEmitter<any>()
  @Output() eye_activated = new EventEmitter<any>()


  paramValue: any;

  constructor(private injector: Injector, public route: ActivatedRoute) { }


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.paramValue = params['view'];
    });
  }


  ngAfterViewInit(): void {
    setTimeout(() => {
      const ngControl: NgControl | null = this.injector.get(NgControl, null);
      if (ngControl) {
        this.control = ngControl.control as FormControl;
      } else {
        // Component is missing form control binding
      }
    }, 100);
  }
  control: any;
  onTouched: any;
  value = ''
  onChange: (value: any) => void = () => { };


  writeValue(value: any): void {
    this.value = value

  }
  registerOnChange(fn: any): void {
    this.onChange = fn
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled
  }

  fetch_clicked() {
    this.fetch_activated.emit()
  }

  eye_clicked() {
    this.text_type = !this.text_type;
    this.eye_activated.emit(this.text_type);
  }
  validateInput(event: KeyboardEvent): void {
    if (this.type === 'text') {
      const regex = /^[A-Za-z ]$/;
      if (!regex.test(event.key)) {
        event.preventDefault();
      }
    } else if (this.type === 'number') {
      const regex = /^[0-9]$/;
      if (!regex.test(event.key)) {
        event.preventDefault();
      }
    } else if (this.type === 'email') {
      const email_key_regex = /^[A-Za-z0-9@._-]$/;
      if (!email_key_regex.test(event.key)) {
        event.preventDefault();
      }
    } else if (this.type === 'year_range') {
      // Allow only 0-9 and the hyphen (-)
      const year_range_key_regex = /^[0-9-]$/;

      if (!year_range_key_regex.test(event.key)) {
        event.preventDefault();
      }
    } else if (this.type === 'text_number') {
      return;
    }
  }
  copy_clicked() {
    if (this.value) {
      navigator.clipboard.writeText(this.value);
    }
  }
}