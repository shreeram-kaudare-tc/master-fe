import { Component, ViewChild } from '@angular/core';
import { ModelComponent } from '../../components/modal/modal.component';
import { TextInputComponent } from '../../components/text-input/text-input.component';
import { ButtonComponent } from '../../components/button/button.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { UserService } from '../../services/user-service';
import { ConfirmationPopupComponent } from '../../components/confirmation-popup/confirmation-popup.component';

@Component({
  selector: 'app-user-list-page',
  imports: [ModelComponent, TextInputComponent, ButtonComponent, ReactiveFormsModule, NgIf, NgFor, ConfirmationPopupComponent],
  templateUrl: './user-list-page.html',
})
export class UserListPage {
  @ViewChild('form_modal') form_modal: any
  @ViewChild('delete') delete: any
  form: FormGroup;
  user_list: any = [
    {
      id: 1,
      first_name: 'Rahul',
      last_name: 'Patil',
      email: 'rahul@gmail.com',
      contact: '9876543210',
      role: 'Admin'
    },
    {
      id: 1,
      first_name: 'jay',
      last_name: 'Patil',
      email: 'jay@gmail.com',
      contact: '9877548210',
      role: 'Admin'
    },

  ];
  params: any = {};
  subscriptions: any = {};
  selected_data: any = {};


  constructor(public route: Router, public fb: FormBuilder, public us: UserService, public ar: ActivatedRoute) {
    this.form = this.fb.group({
      role: ['', [Validators.required]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required]],
      contact: ['', [Validators.required]],
    });
  }


  async ngOnInit() {
    this.subscriptions.query_params_subcription = this.ar.queryParams.subscribe(async params => {
      this.params = { ...params };
      await this.get_list(this.params);
      if (this.params.action == 'edit' && this.params['id']) {
        // await this.get(this.params['id']);
        this.form.patchValue(this.selected_data);
        this.form_modal?.open();
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

  open_edit_model(data: any) {
    this.selected_data = data;
    this.route.navigate([], { relativeTo: this.ar, queryParams: { id: this.selected_data.id, action: 'edit' }, queryParamsHandling: 'merge' });
    this.form_modal?.open();
    this.form.patchValue(this.selected_data);
  }


  async submit() {
    try {
      if (this.form.valid) {
        let response
        if (this.params.id) {
          this.form_modal?.close();
          response = await this.us.update(this.form.value.id, this.form.value);
          this.form.reset()
          console.log('User updated successfully', response);
        } else {
          this.form_modal?.close();
          response = await this.us.add(this.form.value);
          this.form.reset()
          console.log('Successfully added user', response);
        }
      }
    } catch (error: any) {
      console.error(error);
    }
  }

  async get(id: any) {
    try {
      // let response = await this.us.get(id);
      // this.selected_data = response;
    } catch (error: any) {
      console.error(error);
    }
  }

  async get_list(filters: any) {
    try {
      let response = await this.us.get_list(filters);
      this.user_list = response;
    } catch (error: any) {
      console.error(error);
    }
  }

  async delete_confirm(id: number) {
    try {
      this.delete?.close();
      let response = await this.us.delete(id);
      await this.get_list(this.params);
    } catch (error: any) {
      console.error(error);
    }

  }
}
