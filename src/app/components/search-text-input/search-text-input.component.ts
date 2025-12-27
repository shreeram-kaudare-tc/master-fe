import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-text-input',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './search-text-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: SearchTextInputComponent
    }
  ]
})
export class SearchTextInputComponent implements ControlValueAccessor {
  @Input() placeholder: any = '';
  @Output() valueChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() debounce = new EventEmitter();

  value: string = '';

  debounceTimeout: any;

  onInputChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.value = inputElement.value;
    this.valueChange.emit(this.value);
    this.onChange(this.value);


    clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(() => {
      this.debounce.emit(this.value);
    }, 1000); // Adjust the debounce time as needed

  }

  @Input() disabled: boolean = false;

  control: any;
  onChange: any;
  onTouched: any;

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}

