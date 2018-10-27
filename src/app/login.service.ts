import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { User } from './users.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private _user: BehaviorSubject<User|null> = new BehaviorSubject(null);
  
  get user(): Observable<User|null> {
    return this._user;
  }
  
  constructor(private _http: HttpClient) { }
  
  login(user: string, password: string): Observable<User> {
    return this._http.post<User>('/api/users/login', {
      username: user,
      password: password,
    }).pipe(tap(user => this._user.next(user), err => this._user.next(null)));
  }
}
