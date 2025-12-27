import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Papa, ParseResult } from 'ngx-papaparse';
import { ModelComponent } from '../modal/modal.component';
import { Subscription } from 'rxjs';
import { ButtonComponent } from '../button/button.component';
import { KeyValueWithOrderPipe } from '../../pipes/key-value-with-order.pipe';
import { GetDropdownListService } from '../../services/get-dropdown-list.service';

@Component({
  selector: 'app-bulk-upload',
  imports: [NgIf, NgFor, ButtonComponent, KeyValueWithOrderPipe, NgClass],
  templateUrl: './bulk-upload.html',
})

export class BulkUpload {
  public Object = Object;
  @Input() title: string = '';
  @Input() template_url: string = '';
  @Input() accepted_type: any = [];
  @Input() max_file_sizeMB: number = 5;
  @Input() enable_preview: boolean = true;
  @Input() bulk_columns: any[] = [];
  @Input() can_have_empty_columns = false; // If true, allows empty columns in the CSV
  @Input() button_title: any = ''
  @Input() cancel!: ModelComponent;

  @Output() submit = new EventEmitter<any>();     // Emits parsed data on submit
  @Output() error = new EventEmitter<any>();     // Emits error messages

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private modalCloseSub?: Subscription;

  preview_data: any[] = [];
  display_data: Array<{ [key: string]: any }> = [];
  file_upload_mode = true;
  error_message = '';
  is_dragging = false;
  is_uploading = false;
  dropdown_data: { [key: string]: any[] } = {};
  STRICT_VALIDATORS: any = {
    mobile: {
      regex: /^[1-9]\d{9}$/,
      message: (val: string, row: number, col: string) =>
        `Invalid Mobile Number "${val}" at row ${row} in column Name "${col}". Mobile number must be 10 digits and cannot start with 0.`
    },
    aadhaar: {
      regex: /^[2-9]\d{11}$/,
      message: (val: string, row: number, col: string) =>
        `Invalid Aadhaar Number "${val}" at row ${row} in column Name "${col}". Aadhaar number must be 12 digits and cannot start with 0 or 1.`
    },
    pincode: {
      regex: /^[1-9]\d{5}$/,
      message: (val: string, row: number, col: string) =>
        `Invalid Pin Code "${val}" at row ${row} in column Name "${col}".`
    },
    pan: {
      regex: /^[A-Z]{5}[0-9]{4}[A-Z]$/i,
      message: (val: string, row: number, col: string) =>
        `Invalid PAN Number "${val}" at row ${row} in column Name "${col}". `
    },
    gst: {
      regex_basic: /^[0-9A-Z]{15}$/i,
      regex_format: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/i,
      message: (val: string, row: number, col: string) =>
        `Invalid GST Number Added "${val}" at row ${row} in column Name "${col}". `
    },
    email: {
      regex: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i,
      message: (val: string, row: number, col: string) =>
        `Invalid Email "${val}" at row ${row} in column Name "${col}".`
    }
  };

  constructor(private papa: Papa, public gds: GetDropdownListService,) { }

  async ngOnInit() {
    const required_lists = this.bulk_columns.filter(c => c.type === 'link' && c.linked_list).map(c => c.linked_from).filter((value, index, self) => self.indexOf(value) === index);

    await this.gds.get_dropdown_list(required_lists);
    this.dropdown_data = this.gds.dropdown_list;

    if (this.cancel?.close_modal_clicked) {
      this.modalCloseSub = this.cancel.close_modal_clicked.subscribe(() => {
        this.reset_bulk_state();
      });
    }
  }

  download_template() {
    if (!this.bulk_columns || this.bulk_columns.length === 0) {
      this.emit_error('No columns defined for template.');
      return;
    }

    const headers = this.bulk_columns.map(col => col.column_name);
    const sampleRow = this.bulk_columns.map(col => col.sample_value ?? '');

    let csvContent = headers.join(',') + '\n';
    if (sampleRow.some(val => val !== '')) {
      csvContent += sampleRow.join(',') + '\n';
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${this.title} template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  on_file_change(event: any) {
    this.is_uploading = true;
    this.preview_data = [];
    const file = event.target.files[0];
    // if (!file || file.name.split('.').pop()?.toLowerCase() !== this.accepted_type.replace('.', '')) {
    //   this.emit_error('Please upload a valid CSV file!');
    //   return;
    // }
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowed = this.accepted_type.map((ext: any) => ext.replace('.', '').toLowerCase());

    if (!file || !allowed.includes(fileExt)) {
      this.emit_error('Please upload a valid file! (Only CSV, XLS, XLSX allowed)');
      this.is_uploading = false;
      return;
    }
    if (file.size > this.max_file_sizeMB * 1024 * 1024) {
      this.emit_error(`File size exceeds ${this.max_file_sizeMB}MB`);
      this.is_uploading = false;
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const csvData = e.target.result;

      this.papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: (result: ParseResult<any>) => {
          this.validate_and_emit(result.data);
        }
      });
    };
    reader.readAsText(file);
  }

  validate_and_emit(data: any[]) {
    if (!data || data.length === 0) {
      this.emit_error('Uploaded file is empty. Please verify the file and try again.');
      return;
    }

    if (!this.validate_column_names(data)) {
      return;
    }

    const parsed: any[] = [];
    const display: any[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      let isValid = true;
      const parsed_row: any = {};
      const display_row: any = {};

      for (const config of this.bulk_columns) {
        const raw_value = row[config.column_name]?.trim() ?? '';

        if (!raw_value) {
          // First: Existing validations
          if (!config.skip_validation && !this.can_have_empty_columns) {
            this.emit_error(`Empty cell at row ${i + 1}, column Name "${config.column_name}"`);
            isValid = false;
            break;
          }
        }

        // Strict Validations
        if (config.strict_validation) {
          if (!this.validate_strict_field(config, raw_value, i)) {
            isValid = false;
            break;
          }
        }

        if (config.format_validation && config.format_type == 'date' && raw_value) {
          const date_regex = /^\d{2}-\d{2}-\d{4}$/;

          if (!date_regex.test(raw_value)) {
            this.emit_error(`Invalid date format at row ${i + 1}, column Name "${config.column_name}". Expected format: DD-MM-YYYY`);
            isValid = false;
            break;
          }

          const [d, m, y] = raw_value.split('-').map(Number);
          const date = new Date(y, m - 1, d);
          if (date.getFullYear() !== y || date.getMonth() + 1 !== m || date.getDate() !== d) {
            this.emit_error(`Invalid date value at row ${i + 1}, column Name "${config.column_name}": "${raw_value}"`);
            isValid = false;
            break;
          }
        }

        if (config.data_type && raw_value) {
          switch (config.data_type) {
            case 'number':
              if (!/^-?\d+$/.test(raw_value)) {
                this.emit_error(`Invalid number at row ${i + 1}, column Name "${config.column_name}": "${raw_value}"`);
                isValid = false;
              }
              break;
            case 'float':
              if (!/^-?\d+(\.\d+)?$/.test(raw_value)) {
                this.emit_error(`Invalid float at row ${i + 1}, column Name "${config.column_name}": "${raw_value}"`);
                isValid = false;
              }
              break;
            case 'boolean':
              if (!/^(true|false|1|0|yes|no)$/i.test(raw_value)) {
                this.emit_error(`Invalid True / False at row ${i + 1}, column Name "${config.column_name}": "${raw_value}"`);
                isValid = false;
              }
              break;
            case 'object':
              try {
                JSON.parse(raw_value);
              } catch {
                this.emit_error(`Invalid JSON object at row ${i + 1}, column Name "${config.column_name}"`);
                isValid = false;
              }
              break;
            case 'string':
            default:
              break;
          }
          if (!isValid) break;
        }

        display_row[config.column_name] = raw_value;

        if (config.type === 'text') {
          if (config.regex_validation === true) {
            const value = String(raw_value ?? '').trim();
            const alpha_regex = /^[A-Za-z\s]+$/;

            if (value && !alpha_regex.test(value)) {
              this.emit_error(`Invalid value "${raw_value}" at row ${i + 1}, column Name "${config.column_name}". Only alphabets are allowed`);
              isValid = false;
              break;
            }
          }

          if (config.allowed_only && Array.isArray(config.allowed_only)) {
            const allowed = config.allowed_only.map((item: any) => item.toLowerCase().trim());
            const value = raw_value.toLowerCase().trim();

            if (!allowed.includes(value)) {
              this.emit_error(`Invalid value "${raw_value}" at row ${i + 1}, column Name "${config.column_name}". ` + `Allowed values: ${config.allowed_only.join(', ')}`);
              isValid = false;
              break;
            }
          }
          parsed_row[config.return_as] = String(raw_value ?? '').trim();
        } else if (config.type === 'link' && config.linked_list && config.returning_key) {
          if (config.allowed_only && Array.isArray(config.allowed_only)) {
            const allowed = config.allowed_only.map((item: any) => item.toLowerCase().trim());
            const value = raw_value.toLowerCase().trim();

            if (!allowed.includes(value)) {
              this.emit_error(`Invalid value "${raw_value}" at row ${i + 1}, column Name "${config.column_name}". ` + `Allowed values: ${config.allowed_only.join(', ')}`);
              isValid = false;
              break;
            }
          }

          const list = this.dropdown_data[config.linked_list] || [];
          const normalize = (val: any) => String(val ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
          const match = list.find((item: any) => normalize(item?.title) == raw_value.toLowerCase());

          if (!match) {
            this.emit_error(`No match found for "${raw_value}" in column Name "${config.column_name}" (row ${i + 1})`);
            isValid = false;
            break;
          }

          parsed_row[config.return_as] = match[config.returning_key];
        } else if (config.type === 'boolean_map') {
          const mappings = config.map_keys || [];
          const normalized_raw = raw_value.toLowerCase().trim();
          const match = mappings.find((m: any) => m.key.toLowerCase().trim() === normalized_raw);

          if (!match) {
            this.emit_error(`Invalid value "${raw_value}" at row ${i + 1}, column Name "${config.column_name}". ` + `Allowed values: ${mappings.map((m: any) => `"${m.key}"`).join(', ')}`);
            isValid = false;
            break;
          }

          parsed_row[config.return_as] = match.value;
        } else if (config.type === 'array_link' && config.linked_list && config.returning_key) {
          const list = this.dropdown_data[config.linked_list] || [];
          const normalize = (val: any) => String(val ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
          const raw_values = String(raw_value).split(',').map(v => v.trim()).filter(v => v !== '' && v.toLowerCase() !== 'null' && v.toLowerCase() !== 'undefined');

          if (raw_values.length === 0) {
            this.emit_error(`Invalid values in column Name "${config.column_name}" at row ${i + 1}.`);
            return;
          }

          const mapped_ids: any[] = [];

          for (const single of raw_values) {
            const normalized_single = normalize(single);

            if (config.allowed_only && Array.isArray(config.allowed_only)) {
              const allowed = config.allowed_only.map((item: any) => String(item).toLowerCase().trim());
              if (!allowed.includes(normalized_single)) {
                this.emit_error(`Invalid value "${single}" at row ${i + 1} in column Name "${config.column_name}". ` + `Allowed values: ${config.allowed_only.join(', ')}`);
                isValid = false;
                break;
              }
            }

            const match = list.find((item: any) => normalize(item?.title) === normalized_single);

            if (!match) {
              this.emit_error(`No match found for "${single}" in column Name "${config.column_name}" (row ${i + 1})`);
              isValid = false;
              break;
            }
            mapped_ids.push(match[config.returning_key]);
          }
          if (!isValid) break;

          parsed_row[config.return_as] = mapped_ids;
        }
      }

      if (isValid) {
        parsed.push(parsed_row);
        display.push(display_row);
      } else return;
    }

    this.preview_data = parsed;
    this.display_data = display;
    this.file_upload_mode = false;
    this.is_uploading = false;
  }

  emit_error(msg: string) {
    this.error_message = msg;
    this.error.emit(msg);
    this.file_upload_mode = true;
    this.is_uploading = false;
  }

  on_submit() {
    try {
      if (this.preview_data.length > 0) {
        this.submit.emit({ data: this.preview_data });
      } else {
        throw new Error('No data to submit');
      }
    } catch (error: any) {
      this.emit_error(error.message || 'Something went wrong while submitting');
    } finally {
    }
  }

  reupload() {
    this.preview_data = [];
    this.display_data = [];
    this.error_message = '';
    this.file_upload_mode = true;
    this.is_uploading = false;

    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  validate_strict_field(config: any, raw_value: string, rowIndex: number): boolean {
    const type = config.strict_validation;
    if (!type) return true;

    const validator = this.STRICT_VALIDATORS[type];
    if (!validator) return true;

    const col = config.column_name;
    const val = raw_value.trim();
    const row = rowIndex + 1;

    if (type === 'gst') {
      if (!validator.regex_basic.test(val) || !validator.regex_format.test(val)) {
        this.emit_error(validator.message(val, row, col));
        return false;
      }
      return true;
    }

    if (!validator.regex.test(val)) {
      this.emit_error(validator.message(val, row, col));
      return false;
    }

    return true;
  }

  reset_bulk_state() {
    this.preview_data = [];
    this.display_data = [];
    this.error_message = '';
    this.file_upload_mode = true;
    this.is_uploading = false;

    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  on_drag_over(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.is_dragging = true;
  }

  on_drag_leave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.is_dragging = false;
  }

  on_drop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.is_dragging = false;

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const fakeEvent = { target: { files } };
    this.on_file_change(fakeEvent);
  }

  private validate_column_names(data: any[]): boolean {
    if (!data || data.length === 0) return false;

    const normalize = (val: string) => val.toLowerCase().trim();
    const uploaded_headers = Object.keys(data[0] || {}).map(normalize);
    const expected_headers = this.bulk_columns.map(c => normalize(c.column_name));
    const missing_columns = expected_headers.filter(col => !uploaded_headers.includes(col));
    const extra_columns = uploaded_headers.filter(col => !expected_headers.includes(col));

    if (missing_columns.length || extra_columns.length) {
      let error_msg = 'File format mismatch, Please upload the file using the original template\n\n';

      if (missing_columns.length) { error_msg += `Missing column(s): ${missing_columns.join(', ')}\n`; }
      if (extra_columns.length) { error_msg += `Changed or extra column(s): ${extra_columns.join(', ')}\n`; }

      this.emit_error(error_msg);
      return false;
    }
    return true;
  }
}
