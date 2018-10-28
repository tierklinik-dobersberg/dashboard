import { Injectable } from '@angular/core';
import { HttpClient, HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { User } from './users.service';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

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
              private _router: Router) { }

  getCurrentUser(): Observable<User> {
    return this._http.get<User>('/api/users/login')
      .pipe(
        tap(user => this._user.next(user), err => this._user.next(null))
      );
  }
  
  login(user: string, password: string): Observable<User> {
    return this._http.post<User>('/api/users/login', {
      username: user,
      password: password,
    }).pipe(tap(user => this._user.next(user), err => this._user.next(null)));
  }

  logout() {
    this.login('', '').subscribe(); 
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req)
      .pipe(
        catchError(err => {
          if (err instanceof HttpErrorResponse && err.status === 401) {
            if (!this._router.url.startsWith('/login')) {
              this._router.navigate(['/login']);
            }
          }

          return throwError(err);
        })
      )
  }
}
