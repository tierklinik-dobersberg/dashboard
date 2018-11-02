import { Component, OnInit, HostBinding, Host } from '@angular/core';
import { LoginService } from '../login.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';
import { UsersService } from '../users.service';

@Component({
  selector: 'cl-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
          style({transform: 'translateY(25%)', opacity: 0}),
          animate('200ms ease-in-out', style({transform: 'translateY(-2%)', opacity: 0.3})),
          animate('300ms ease-in-out', style({transform: 'translateY(0%)', opacity: 0.95}))
      ]),
    ]),
    trigger('host', [
      transition(':leave', [
          style({position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}),
          animate('300ms ease-in-out', style({opacity: 0})),
      ])
    ])
  ]
})
export class LoginComponent implements OnInit {
  _username: string = '';
  _password: string = '';
  _newPassword: string = '';
  _passwordChangeRequired: boolean = false;
  _oldPasswordRequired: boolean = false;
  
  _invalidCreds: boolean = false;

  constructor(private _loginService: LoginService,
              private _userService: UsersService,
              private _router: Router) { }

  ngOnInit() {
    if (!!this._loginService.currentUser && this._loginService.currentUser.mustChangePassword) {
      this._passwordChangeRequired = true;
      this._oldPasswordRequired = true;
    }
    
    this._loginService.user
      .subscribe(user => {
        if (!!user) {
          this._passwordChangeRequired = user.mustChangePassword || false;
          if (this._passwordChangeRequired && this._password === '') {
            this._oldPasswordRequired = true;
          }
        }
      });
  }

  @HostBinding('@host')
  host = true;

  _changePassword() {
    this._userService.changePassword(this._loginService.currentUser.username, this._password, this._newPassword)
      .subscribe(() => {
        this._router.navigate(['/dashboard']);
      });
  }

  _login() {
    this._loginService.login(this._username, this._password)
      .subscribe(
        (user) => {
          if (!user.mustChangePassword) {
            this._router.navigate(['/dashboard']);
          } else {
            this._passwordChangeRequired = true;
          }
          
        },
        (err: HttpErrorResponse) => {
          if (err.status === 401 || err.status === 403) {
            this._invalidCreds = true;
          } else {
            console.error(err);
          }
        },
      );
  }
}
