import { Injectable } from '@angular/core';
import { HttpClient, HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { User } from './users.service';
import { tap, catchError, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HypnoloadService } from './components/hypnoload/hypnoload.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService implements HttpInterceptor {
  private _user: BehaviorSubject<User|null> = new BehaviorSubject(null);
  
  get user(): Observable<User|null> {
    return this._user;
  }

  get currentUser(): User | null {
    return this._user.getValue();
  }
  
  constructor(private _http: HttpClient,
              private _snackbar: MatSnackBar,
              private _loader: HypnoloadService,
              private _router: Router) { }

  getCurrentUser(): Observable<User> {
    return this._http.get<User>('/api/users/login')
      .pipe(
        tap(user => this._user.next(user), err => this._user.next(null))
      );
  }
  
  login(user: string, password: string): Observable<User> {
    this._loader.show();

    return this._http.post<User>('/api/users/login', {
      username: user,
      password: password,
    }).pipe(
        finalize(() => this._loader.hide()),
        tap(
          user => {
            this._user.next(user);
          }, 
          err => {
            this._user.next(null);
          }
        )
      );
  }

  logout() {
    this.login('', '').subscribe(
      {
        complete: () => this._router.navigate(['/login'])
      }
    ); 
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req)
      .pipe(
        catchError(err => {
          if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
            if (!this._router.url.startsWith('/login')) {
              this._router.navigate(['/login']);
            }
          } else {
            this._snackbar.open(`Network Error: ${err.message || err.statusText || err.status}`, 'OK');
          }

          return throwError(err);
        })
      )
  }
}
