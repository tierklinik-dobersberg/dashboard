import { Component, OnInit, HostBinding, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BreakpointObserver, Breakpoints, MediaMatcher } from '@angular/cdk/layout';
import { LoginService } from './login.service';
import { Observable } from 'rxjs';
import { User } from './users.service';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'cl-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'dashboard';

  @ViewChild('snav', {read: MatSidenav})
  _sideNav: MatSidenav;

  _user: Observable<User>;
  _loginPage: boolean = false;

  @HostBinding('class.handset')
  get handset() {
    return this.mobileQuery.matches;
  }
  
  mobileQuery: MediaQueryList;

  fillerNav = Array.from({length: 50}, (_, i) => `Nav Item ${i + 1}`);

  private _mobileQueryListener: () => void;

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  constructor(private _loginService: LoginService,
              private _router: Router,
              changeDetectorRef: ChangeDetectorRef,
              media: MediaMatcher) {

    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
    this._user = this._loginService.user;

    this._router.events
      .subscribe(event => {
        this._loginPage = this._router.url.startsWith('/login');
        
        if (this._loginPage) {
          this._sideNav.close();
        }
        
        if (event instanceof NavigationEnd && this.mobileQuery.matches) {
          this._sideNav.close();
        }
      });

    // Check if we are logged in. If the backend replys with 401 or 403
    // the login service will redirect us to the login page on it's own
    this._loginService.getCurrentUser()
      .subscribe((user) => {
        if (user.mustChangePassword) {
          this._router.navigate(['/login']);
        }
        
        // if we are still on the login page redirect to user
        if (this._router.url.startsWith('/login') && !user.mustChangePassword) {
          this._router.navigate(['/dashboard'])
        }
      });
  }
}
