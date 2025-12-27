import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'keyValueWithOrder',
  pure: true
})
export class KeyValueWithOrderPipe implements PipeTransform {
  transform(value: any): any[] {
    if (!value) return [];
    return Object.keys(value).map(key => ({ key, value: value[key] }));
  }
}
