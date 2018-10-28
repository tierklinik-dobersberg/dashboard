import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { LoginService } from '../login.service';
import { Observable } from 'rxjs';
import { User } from '../users.service';
import { Router } from '@angular/router';
import {  } from 'protractor';

@Component({
  selector: 'cl-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  _user: Observable<User>;

  @Output()
  readonly toggleNav = new EventEmitter<void>();

  constructor(private _loginService: LoginService,
              private _router: Router) { }

  ngOnInit() {
    this._user = this._loginService.user;
  }
  
  _logout() {
    this._router.navigate(['/login']);
    this._loginService.logout();
  }
  
  _toggleSidenav() {
    this.toggleNav.next();
  }

}
