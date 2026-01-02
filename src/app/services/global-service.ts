import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  
  constructor(public router: Router) { }

  apply_filters(params: any, model: any) {
    const cleaned_params = this.clean_params(params, model);
    this.change_params(cleaned_params);
  }

  reset_filters(params: any, reset_key: string[], model: any) {
    const updated = { ...params };
    reset_key.forEach(key => delete updated[key]);
    const cleaned_params = this.clean_params(updated, model);
    this.change_params(cleaned_params);
    return updated;
  }

  togglesort(params: any) {
    params.page = params.page || 1;
    params.order = params.order === 'asc' ? 'desc' : 'asc';
    const cleaned_params = this.clean_params(params, null);
    this.change_params(cleaned_params,);
    return params;
  }

  change_params(params: any) {
    this.router.navigate([], { queryParams: params });
  }

  private clean_params(params: any, model: any): any {
    const cleaned: any = { ...params };
    Object.keys(cleaned).forEach(key => {
      if (
        cleaned[key] === null ||
        cleaned[key] === undefined ||
        cleaned[key] === ''
      ) {
        delete cleaned[key];
      }
    });
    model?.close();
    return cleaned;
  }
}
