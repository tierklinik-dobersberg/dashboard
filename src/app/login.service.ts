import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private _http: HttpClient) { }
  
  login(user: string, password: string): Observable<void> {
    return this._http.post<void>('/api/users/login', {
      username: user,
      password: password,
    });
  }
}
