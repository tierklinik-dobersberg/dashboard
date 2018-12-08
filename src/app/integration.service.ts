import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GoogleAuthStatus {
    authenticated: boolean;
    
    profile?: {
        family_name: string;
        gender: string;
        given_name: string;
        id: string;
        link: string;
        locale: string;
        name: string;
        picture: string;
    };

    authURL?: string;
}

@Injectable({providedIn: 'root'})
export class IntegrationService {
    constructor(private _http: HttpClient) {}

    getGoogleAuthStatus(): Observable<GoogleAuthStatus> {
        return this._http.get<GoogleAuthStatus>('/api/config/integration/google');
    }

    unauthorizeGoogle(): Observable<GoogleAuthStatus> {
        return this._http.delete<GoogleAuthStatus>('/api/config/integration/google');
    }
    
    authorzite(code: string): Observable<GoogleAuthStatus> {
        return this._http.post<GoogleAuthStatus>('/api/config/integration/google', {
            code: code
        });
    }
}

