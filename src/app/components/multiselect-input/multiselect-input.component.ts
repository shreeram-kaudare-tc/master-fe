import { NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, NgControl, ReactiveFormsModule } from '@angular/forms';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-multiselect-input',
  imports: [NgSelectModule, FormsModule, NgClass, NgIf, ReactiveFormsModule, NgSelectComponent],
  standalone: true,
  templateUrl: './multiselect-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: MultiselectInputComponent,
      multi: true
    }
  ]
})
export class MultiselectInputComponent implements ControlValueAccessor {
  @Input() options: any[] = [];
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() readonly: boolean = false;
  @Input() disabled: boolean = false;
  @Input() is_disabled: boolean = false;
  @Input() is_required: boolean = false;
  @Input() is_multiple: boolean = true;
  control: any;
  value = '';
  display_value = '';
  display_object: any = {};

  selectedValues: string | any = ''; // Can be string for single or array for multiple

  @Output() valueChange = new EventEmitter<string | any>();
  onChange = (selected: any) => { };
  onTouched = () => { };

  @Input() depended: any = 0; // Replaces 'flag'

@Output() registerSelf = new EventEmitter<{ depended: any, ref: any }>();


  constructor(private injector: Injector) {
    // alert(this.value)
    // alert(this.selectedValues)
  }

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


  // writeValue(value: any): void {

  //   if (this.is_multiple) {
  //     if (typeof value == 'string') {
  //       const valuesArray = value.split(',').map(v => v.trim());
  //       this.selectedValues = valuesArray
  //         .map(v => this.options?.find(option => option.value == v))
  //         .filter(option => option !== undefined) || [];
  //     } else if (Array.isArray(value)) {
  //       this.selectedValues = value
  //         .map(v => this.options?.find(option => option.value == v))
  //         .filter(option => option !== undefined) || [];
  //     } else {
  //       this.selectedValues = [];
  //     }
  //   } else {
  //     // Handle single selection
  //     this.selectedValues = value !== undefined ?
  //       this.options?.find(option => option.value == value) || '' : '';
  //   }
  // }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled
    if(this.is_disabled){
      this.disabled = true;
    }
  }

  writeValue(value: any): void {
    if (this.is_multiple) {
      if (typeof value == 'string') {
        const valuesArray = value.split(',').map(v => v.trim());
        this.selectedValues = valuesArray
          .map(v => this.options?.find(option => option.value == v))
          .filter(option => option !== undefined) || [];
      } else if (Array.isArray(value)) {
        this.selectedValues = value
          .map(v => this.options?.find(option => option.value == v))
          .filter(option => option !== undefined) || [];
      } else {
        this.selectedValues = [];
      }
    } else {
      this.selectedValues = value !== undefined
        ? this.options?.find(option => option.value == value) || ''
        : '';
    }

    // ✅ Ensure display value updates after options load
    setTimeout(() => {
      if (!this.is_multiple && value) {
        this.change_display_value(value);
      }
    });
  }



  change_display_value(value: string) {
    this.display_value = this.options?.find((item: any) => item.value == value)?.title || '';
    this.display_object = this.options?.find((item: any) => item.value == value);
    // // // console.log(value,this.display_object,this.display_value,'changes aaaaaaaaaaa');
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // onSelectionChange(selected: any) {
  //   if (this.is_multiple) {
  //     this.selectedValues = selected;
  //     // Emit an array of selected values
  //     this.onChange(selected.map((item: any) => item.value));
  //   } else {
  //     this.selectedValues = selected ? selected : '';
  //     // Emit a single selected value or null
  //     // // // console.log(this.selectedValues,this.options, "Single selection mode onSelectionChange");
  //     this.onChange(selected ? selected.value : '');
  //   }
  //   this.value = this.selectedValues
  //   this.change_display_value(this.value);
  //   this.onTouched();
  // }

  // onSelectionChange(selected: any) {
  //   let temp_value: any;
  //   if (this.is_multiple) {
  //     this.selectedValues = selected;
  //     // Emit an array of selected values
  //     this.onChange(selected.map((item: any) => item.value));
  //   } else {
  //     this.selectedValues = selected ? selected : '';
  //     this.onChange(selected ? selected.value : null); // Change to null for single selection
  //   }

  //   this.value = this.control.value;
  //   this.change_display_value(this.control.value);
  //   this.onTouched();
  // }

  onSelectionChange(selected: any) {
    // console.log(this.value, selected?.value, this.control.value, this.control.valid, this.control);
    // return;
  if (this.is_multiple) {
    this.selectedValues = selected;
    this.onChange(selected.map((item: any) => item.value));
  } else {
    this.selectedValues = selected ? selected : '';
    this.onChange(selected ? selected.value : null);
    this.change_display_value(selected?.value);
  }

  this.value = this.control?.value;

  // Updated emit with depended value
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
