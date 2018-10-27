import { Component, OnInit, HostBinding } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'cl-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'dashboard';

  _loginPage: boolean = false;

  @HostBinding('class.handset')
  _handset = false;

  constructor(private _breakpointObserver: BreakpointObserver,
              private _router: Router) {}

  ngOnInit() {
    this._breakpointObserver.observe([
      Breakpoints.Handset,
      Breakpoints.HandsetLandscape,
      Breakpoints.HandsetPortrait,
    ]).subscribe(result => {
      this._handset = result.matches;
    });
    
    this._router.events
      .subscribe(event => {
        this._loginPage = this._router.url.startsWith('/login');
      })
  }
}
