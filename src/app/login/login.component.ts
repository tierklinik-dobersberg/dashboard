import { Component, OnInit, HostBinding, Host } from '@angular/core';
import { LoginService } from '../login.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';

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

  _invalidCreds: boolean = false;

  constructor(private _loginService: LoginService,
              private _router: Router) { }

  ngOnInit() {
  }

  @HostBinding('@host')
  host = true;

  _login() {
    this._loginService.login(this._username, this._password)
      .subscribe(
        () => this._router.navigate(['/dashboard']),
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
