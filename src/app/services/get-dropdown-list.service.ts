import { Injectable } from '@angular/core';
import { UserService } from './user-service';

@Injectable({ providedIn: 'root' })

export class GetDropdownListService {
  dropdown_list: any = {
    gender_list: [{ title: 'Male', value: 1 }, { title: 'Female', value: 2 }, { title: 'Transgender', value: 3 }]
  }


  constructor(public us :UserService) { }


  async get_dropdown_list(filters: any) {
    try {
      if (filters.includes('user') && (!this.dropdown_list.user_list || this.dropdown_list.user_list?.length == 0)) {
        const user_response = await this.us.get_list({ page: 1, page_size: 999999 });
        this.dropdown_list.user_list = user_response?.data.map((item: any) => ({ title: item.name || "none", value: item.id || "none" }));
      }

    } catch (error) {
      console.log(error, 'ddd');
    }



  }
}