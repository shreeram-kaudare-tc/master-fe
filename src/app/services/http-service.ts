import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private base_url = "";

  constructor(private http: HttpClient) { }

  async get(url: string, params?: any) {
    let response: any = await firstValueFrom(this.http.get(this.base_url + url, { params: params }))
    return response
  }

  async post(url: string, query_params: any, body: any) {
    let params = { ...query_params }
    let response: any = await firstValueFrom(this.http.post(this.base_url + url, body, { params: params }))
    return response
  }

  async put(url: string, body: any, query_params?: any) {
    let response: any = await firstValueFrom(this.http.put(url, body))
    return response
  }

  async delete(url: string, query_params?: any) {
    let params = { ...query_params }
    let response: any = await firstValueFrom(this.http.delete(this.base_url + url, { params: params }))
    return response
  }
}
