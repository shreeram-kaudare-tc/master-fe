import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })

export class GetDropdownListService {
  dropdown_list: any = {
    gender_list: [{ title: 'Male', value: 1 }, { title: 'Female', value: 2 }, { title: 'Transgender', value: 3 }]
  }


  constructor() { }


  async get_dropdown_list(filters: any) {
    try {
      // if (filters.includes('partner_type') && (!this.dropdown_list.partner_type_list || this.dropdown_list.partner_type_list?.length == 0)) {
      //   const instructor_response = await this.pts.get_list({ page: 1, page_size: 999999 });
      //   this.dropdown_list.partner_type_list = instructor_response?.data.map((item: any) => ({ title: item.name || "none", value: item.id || "none" }));
      // }

    } catch (error) {
      console.log(error, 'ddd');
    }



  }
}