import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type Role = 'admin' | 'user';
export type UserType = 'assistent' | 'doctor' | 'other';

export interface User {
  username: string;
  role: Role;
  type: UserType;
  hoursPerWeek: number;
  enabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private _http: HttpClient) { }
  
  listUsers(): Observable<User[]> {
    return this._http.get<User[]>('/api/users/');
  }
  
  createUser(name: string, role: Role, type: UserType, hoursPerWeek: number, password: string, enabled = true): Observable<void> {
    return this._http.post<void>(`/api/users/${name}`, {
      role: role,
      type: type,
      hoursPerWeek: hoursPerWeek,
      password: password,
      enabled: enabled
    });
  }

  updateUser(name: string, role: Role, type: UserType, hoursPerWeek: number, enabled = true): Observable<void> {
    return this._http.put<void>(`/api/users/${name}`, {
      role: role,
      type: type,
      hoursPerWeek: hoursPerWeek,
      enabled: enabled
    });
  }

  deleteUser(name: string): Observable<void> {
    return this._http.delete<void>(`/api/users/${name}`);
  }
}
