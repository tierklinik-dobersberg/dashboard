import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginService } from './login.service';
import { tap } from 'rxjs/operators';

export type Role = 'admin' | 'user';
export type UserType = 'assistent' | 'doctor' | 'other';

export interface User {
  username: string;
  role: Role;
  type: UserType;
  hoursPerWeek: number;
  enabled: boolean;
  icon?: string;
  color: string;
  firstname?: string;
  lastname?: string;
  mailAddress?: string;
  phoneNumber?: string;
  googleCalendarID?: string;
  mustChangePassword?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private _http: HttpClient,
              private _loginService: LoginService) { }
  
  listUsers(): Observable<User[]> {
    return this._http.get<User[]>('/api/users/');
  }
  
  createUser(name: string,
             role: Role,
             type: UserType,
             hoursPerWeek: number,
             password: string,
             icon: string = '',
             enabled = true,
             firstname?: string,
             lastname?: string,
             phone?: string,
             mail?: string,
             googleCalendarID?: string, 
             mustChangePassword?: boolean): Observable<void> {
    return this._http.post<void>(`/api/users/${name}`, {
      role: role,
      type: type,
      hoursPerWeek: hoursPerWeek,
      password: password,
      enabled: enabled,
      color: '',
      icon: icon,
      firstname: firstname,
      lastname: lastname,
      phoneNumber: phone,
      mailAddress: mail,
      googleCalendarID: googleCalendarID,
      mustChangePassword: mustChangePassword
    });
  }

  updateUser(name: string,
             role: Role,
             type: UserType,
             hoursPerWeek: number,
             icon: string = '',
             enabled = true,
             firstname?: string,
             lastname?: string,
             phone?: string,
             mail?: string,
             googleCalendarID?: string,
             mustChangePassword?: boolean): Observable<void> {
    return this._http.put<void>(`/api/users/${name}`, {
      role: role,
      type: type,
      hoursPerWeek: hoursPerWeek,
      color: '',
      enabled: enabled,
      icon: icon,
      firstname: firstname,
      lastname: lastname,
      phoneNumber: phone,
      mailAddress: mail,
      googleCalendarID: googleCalendarID,
      mustChangePassword: mustChangePassword
    }).pipe(
      tap(result => {
        let currentUser = this._loginService.currentUser;
        if (!!currentUser && currentUser.username === name) {
        
          // Update the logged-in user object to reflect any changes
          this._loginService.getCurrentUser()
            .subscribe();
        }
      })
    );
  }

  changePassword(username: string, old: string, newpwd: string): Observable<void> {
    return this._http.put<void>(`/api/users/${username}/password`, {
      current: old,
      newPassword: newpwd,
    });
  }

  deleteUser(name: string): Observable<void> {
    return this._http.delete<void>(`/api/users/${name}`);
  }
}
