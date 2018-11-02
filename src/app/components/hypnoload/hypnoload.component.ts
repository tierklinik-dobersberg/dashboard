//
// Hypnoload from https://github.com/fr33kvanderwand/hypnoload
//
import { Component, AfterViewInit, ElementRef, ViewChild, HostBinding } from '@angular/core';
import { HypnoloadService } from './hypnoload.service';

@Component({
  selector: 'cl-hypnoload',
  templateUrl: './hypnoload.component.html',
  styleUrls: ['./hypnoload.component.scss']
})
export class HypnoloadComponent implements AfterViewInit {

  @ViewChild('loader', {read: ElementRef})
  _loader: ElementRef;

  constructor(private _loaderService: HypnoloadService) { }
  
  @HostBinding('style.display')
  show = 'none';

  ngAfterViewInit() {
    const e = this._loader.nativeElement;
    
    var x = window.getComputedStyle(e)['letter-spacing'].replace('px', '');
    for (var i = 0; i < x; i++) {
      e.appendChild(document.createElement('span'));
    }
    
    this._loaderService.state
      .subscribe(state => {
        if (state) {
          this.show = 'block';
        } else {
          this.show = 'none';
        }
      })
  }
}
