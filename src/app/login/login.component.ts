import { Component, OnInit } from '@angular/core';
import { LoginService } from '../login.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'cl-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  _username: string = '';
  _password: string = '';

  _invalidCreds: boolean = false;

  constructor(private _loginService: LoginService,
              private _router: Router) { }

  ngOnInit() {
  }

  _login() {
    this._loginService.login(this._username, this._password)
      .subscribe(
        () => this._router.navigate(['/door']),
        (err: HttpErrorResponse) => {
          if (err.status === 401) {
            this._invalidCreds = true;
          } else {
            console.error(err);
          }
        },
      );
  }
}
