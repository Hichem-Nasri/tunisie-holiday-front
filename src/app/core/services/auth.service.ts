import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API_URL = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}


  // ✅ récupérer l'utilisateur connecté
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/users/me`);
  }

  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post<{ token: string }>(
      `${this.API_URL}/auth/login`,
      data
    ).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
      })
    );
  }

register(data: {
 name: string;
    email: string;
    password: string;
    type: string;
  }): Observable<void> {
    return this.http.post<void>(
      `${this.API_URL}/auth/register`,
      data
    );
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
