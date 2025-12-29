import { Component, ViewChild } from '@angular/core';
import { ModelComponent } from '../../components/modal/modal.component';
import { TextInputComponent } from '../../components/text-input/text-input.component';
import { ButtonComponent } from '../../components/button/button.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { UserService } from '../../services/user-service';
import { ConfirmationPopupComponent } from '../../components/confirmation-popup/confirmation-popup.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { SearchTextInputComponent } from '../../components/search-text-input/search-text-input.component';
import { BulkUpload } from '../../components/bulk-upload/bulk-upload';
import { FormService } from '../../services/form.service';
import { ToastrService } from 'ngx-toastr';
import { SelectInputComponent } from '../../components/select-input/select-input.component';

@Component({
  selector: 'app-user-list-page',
  imports: [ModelComponent, TextInputComponent, ButtonComponent, ReactiveFormsModule, NgIf, NgFor, ConfirmationPopupComponent, PaginationComponent, SearchTextInputComponent, FormsModule, BulkUpload, SelectInputComponent],
  templateUrl: './user-list-page.html',
})
export class UserListPage {
  @ViewChild('form_modal') form_modal: any
  @ViewChild('delete') delete: any
  @ViewChild('bulk_modal') bulk_modal: any
  @ViewChild('pagination_page') pagination_page: any
  form: FormGroup;
  list: any = [];
  params: any = {};
  subscriptions: any = {};
  selected_data: any = {};

  bulk_columns = [
    { column_name: 'First Name', type: 'text', return_as: 'first_name', sample_value: 'Shreeram' },
    { column_name: 'Last Name', type: 'text', return_as: 'last_name', sample_value: 'Sharma', },
    { column_name: 'email', type: 'text', return_as: 'email', sample_value: 'shreeram.sharma@example.com', strict_validation: 'email' },
    { column_name: 'contact', type: 'text', return_as: 'contact', sample_value: '9876543210', strict_validation: 'mobile' },
    { column_name: 'role', type: 'text', return_as: 'role', sample_value: 'Admin', allowed_only: ['Admin', 'User', 'Manager'] },
  ];

  constructor(public router: Router, public fb: FormBuilder, public us: UserService, public ar: ActivatedRoute, public fs: FormService, public toastr: ToastrService) {
    this.form = this.fb.group({
      role: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      first_name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      last_name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      email: ['', [Validators.required, Validators.pattern(/^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/)]],
      contact: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(10), Validators.pattern('^[2-9][0-9]{9}$')]],
    });
  }

  async ngOnInit() {
    this.subscriptions.query_params_subcription = this.ar.queryParams.subscribe(async params => {
      this.params = { ...params }
      await this.get_list(this.params);
      if (this.params.action === 'edit' && this.params.id) {
        await this.get_item(this.params.id);
        this.form.enable();
        this.form_modal?.open();
      }
      if (this.params.action === 'view' && this.params.id) {
        await this.get_item(this.params.id);
        this.form.disable();
        this.form_modal?.open();
      } else {
        this.form.enable();
      }
    });
  }

  async ngOnDestroy() {
    for (const key in this.subscriptions) {
      if (this.subscriptions.hasOwnProperty(key)) {
        this.subscriptions[key].unsubscribe();
      }
    }
  }

  open_edit_model(data: any, index: any) {
    this.selected_data = data;
    this.router.navigate([], { queryParams: { page: this.params.page, page_size: this.params.page_size, action: 'edit', id: this.selected_data.id, } });
  }

  open_view_model(data: any, index: any) {
    this.selected_data = data;
    this.router.navigate([], { queryParams: { page: this.params.page, page_size: this.params.page_size, action: 'view', id: this.selected_data.id, } });
  }
  open_delete_model(data: any, index: any) {
    this.selected_data = data;
    this.delete?.open();
  }

  async submit() {
    try {
      if (this.form.valid) {
        let response
        if (this.params.id) {
          response = await this.us.update(this.params.id, this.form.value);
          this.form_modal?.close();
          this.form.reset()
          this.toastr.success(response.message || 'User added successfully');
        } else {
          response = await this.us.add(this.form.value);
          this.form_modal?.close();
          this.form.reset()
          this.toastr.success(response.message || 'User added successfully');
        }
        await this.get_list(this.params);
      } else {
        this.form.markAllAsTouched();
      }
    } catch (error: any) {
      this.toastr.error(error?.error?.message || 'Error ');
    }
  }

  async bulk_upload(body: any) {
    try {
      body = body.map((entry: any) => this.fs.normalizeBulkEntry(entry));
      let response = await this.us.bulk_add({ data: body });
      this.toastr.success(response.message || 'Bulk upload successful');
      await this.get_list(this.params);
      this.bulk_modal?.close();
    } catch (error: any) {
      this.toastr.error(error?.error?.message || 'Error ');
    }
  }

  async get_item(id: any) {
    try {
      let data = await this.us.get(id)
      this.form.patchValue(data?.data)
    } catch (error: any) {
      this.toastr.error(error?.error?.message || 'Error ');
    }
  }

  async get_list(filters: any) {
    try {
      let response = await this.us.get_list(filters);
      this.list = response;
    } catch (error: any) {
      this.toastr.error(error?.error?.message || 'Error ');
    }
  }

  async handlePageChange(page: number) {
    this.params.page = page;
  }

  async delete_confirm() {
    try {
      this.list = this.list?.data?.filter((x: any) => x.id !== this.selected_data.id);
      let data = await this.us.delete(this.selected_data.id);
      this.toastr.success(data.message || 'User deleted successfully');
      await this.get_list(this.params);
      this.delete?.close();
    } catch (error: any) {
      this.toastr.error(error?.error?.message || 'Error ');
    }
  }

  change_params() {
    this.router.navigate([], { queryParams: this.params });
  }

  togglesort() {
    this.params.page = this.params.page || 1;
    this.params.order = this.params.order === 'asc' ? 'desc' : 'asc';
    this.change_params();
  }
}
