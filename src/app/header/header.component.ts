import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { } from 'protractor';
import { Observable } from 'rxjs';
import { LoginService } from '../login.service';
import { User } from '../users.service';

@Component({
  selector: 'cl-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  _user: Observable<User>;

  @Output()
  readonly toggleNav = new EventEmitter<void>();

  constructor(private _loginService: LoginService) { }

  ngOnInit() {
    this._user = this._loginService.user;
  }
  
  _logout() {
    this._loginService.logout();
  }
  
  _toggleSidenav() {
    this.toggleNav.next();
  }

}
