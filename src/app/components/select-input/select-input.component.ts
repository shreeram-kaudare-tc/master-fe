import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-select-input',
  imports: [FormsModule, NgIf, NgFor, NgClass, NgSelectModule, NgSelectComponent],
  templateUrl: './select-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: SelectInputComponent
    }
  ],
  standalone: true,
})
export class SelectInputComponent implements ControlValueAccessor {
  @Input() options: any[] = [];
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() readonly: boolean = false;
  @Input() disabled: boolean = false;
  @Input() is_disabled: boolean = false;
  @Input() is_required: boolean = false;
  @Input() is_multiple: boolean = false;
  control: any;
  value = '';
  display_value = '';
  display_object: any = {};

  selectedValues: string | any = '';

  @Output() valueChange = new EventEmitter<string | any>();
  onChange = (selected: any) => { };
  onTouched = () => { };

  @Input() depended: any = 0;

  @Output() registerSelf = new EventEmitter<{ depended: any, ref: any }>();

  constructor(private injector: Injector) { }

  ngOnInit(): void {
    this.registerSelf.emit({ depended: this.depended, ref: this });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const ngControl: NgControl | null = this.injector.get(NgControl, null);
      if (ngControl) {
        this.control = ngControl.control as FormControl;
        this.value = this.control?.value
      } else {
        // Component is missing form control binding
      }
    }, 100);
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled
    if (this.is_disabled) {
      this.disabled = true;
    }
  }

  writeValue(value: any): void {
    if (this.is_multiple) {
      if (Array.isArray(value)) {
        this.selectedValues = value
          .map(v => this.options?.find(option => option.value == v))
          .filter(option => option !== undefined) || [];
      } else if (typeof value === 'string') {
        this.selectedValues = value.split(',').map(v => v.trim())
          .map(v => this.options?.find(option => option.value == v))
          .filter(option => option !== undefined) || [];
      } else {
        this.selectedValues = [];
      }
    } else {
      // ✅ Handle false correctly
      this.selectedValues = (value !== undefined && value !== null)
        ? this.options?.find(option => option.value === value) || ''
        : '';
    }

    setTimeout(() => {
      // ✅ Handle false correctly
      if (!this.is_multiple && value !== undefined && value !== null) {
        this.change_display_value(value);
      }
    });
  }


  change_display_value(value: string) {
    this.display_value = this.options?.find((item: any) => item.value == value)?.title || '';
    this.display_object = this.options?.find((item: any) => item.value == value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onSelectionChange(selected: any) {
    if (this.is_multiple) {
      this.selectedValues = selected;
      this.onChange(selected.map((item: any) => item.value));
    } else {
      this.selectedValues = selected ? selected : '';
      this.onChange(selected ? selected.value : null);
      this.change_display_value(selected?.value);
    }
    this.value = this.control?.value;
    this.valueChange.emit({ value: this.selectedValues, depended: this.depended });
    this.onTouched();
  }

  reset() {
    this.selectedValues = this.is_multiple ? [] : null;
    this.onChange(this.selectedValues);
    this.valueChange.emit({ value: this.selectedValues, depended: this.depended });
  }

  compareFn(option1: any, option2: any): boolean {
    return option1 && option2 ? option1.value === option2.value : option1 === option2;
  }

  capitalizeFirstLetter(value: string): string {
    if (!value) return value;
    value = value + ''
    return (value).charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }
}