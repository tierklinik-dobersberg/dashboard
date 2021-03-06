import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'usertype'
})
export class UsertypePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    switch(value) {
    case 'doctor':
      return 'Tierarzt';
    case 'assistent':
      return 'Assistent';
    case 'other':
      return 'Benutzer';
    case 'all':
      return 'Alle'
    }
  }

}
