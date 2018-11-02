import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HypnoloadService {
  state: Subject<boolean> = new Subject();
  
  constructor() { }
  
  show() {
    this.state.next(true);
  }
  
  hide() {
    this.state.next(false);
  }
}
