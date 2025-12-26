import { Injectable } from '@angular/core';
import { HttpService } from './http-service';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  constructor(public hs: HttpService) { }


  async add(value: any) {
    try {
      delete value.id;
      let response = await this.hs.post('/user/add-user', {}, value)
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  async delete(id: number) {
    try {
      let response = await this.hs.delete('/user/delete-user?id=' + id, {})
      return response;
    } catch (error: any) {
      throw error;
    }
  }



  async get(id: any) {
    try {
      let response = await this.hs.get('/user/get-user?email_id=' + id, {})
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  async get_list(filters: any) {
    try {
      let response = await this.hs.get('/user/get-user-list', filters)
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  async update(id: any, value: any) {
    try {
      let response = await this.hs.post('/user/update-user?id=' + id, {}, value)
      return response;
    } catch (error: any) {
      throw error;
    }
  }
}
