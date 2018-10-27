import { Component, OnInit } from '@angular/core';
import { LoginService } from '../login.service';
import { Observable } from 'rxjs';
import { User } from '../users.service';

@Component({
  selector: 'cl-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  _user: Observable<User>;

  constructor(private _loginService: LoginService) { }

  ngOnInit() {
    this._user = this._loginService.user;
  }

}
