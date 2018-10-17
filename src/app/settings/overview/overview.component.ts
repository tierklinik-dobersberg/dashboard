import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'cl-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class SettingsOverviewComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  
  _scrollTo(offset: number) {
    console.log(`scrolling to ${offset}`);
  }
}
