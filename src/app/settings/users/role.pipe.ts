import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'role'
})
export class RolePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    switch(value) {
    case 'admin':
      return 'Administrator';
    case 'user':
      return 'Benutzer';
    default:
      return value;
    }
  }

}
