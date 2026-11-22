import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { AuthResponse, Partner, User } from './models';

const TOKEN_KEY = 'th.token';
const USER_KEY = 'th.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly token = signal<string | null>(this.readToken());
  readonly user = signal<User | null>(this.readUser());
  readonly isLoggedIn = computed(() => !!this.token() && !!this.user());
  readonly isAdmin = computed(() => this.user()?.role === 'ADMIN');
  readonly isPartner = computed(() => this.user()?.role === 'PARTNER');

  login(email: string, password: string): Observable<AuthResponse> {
    return this.api.login(email, password).pipe(tap((res) => this.store(res)));
  }

  registerPartner(payload: Record<string, unknown>): Observable<AuthResponse> {
    return this.api.registerPartner(payload).pipe(tap((res) => this.store(res)));
  }

  refreshMe(): void {
    if (!this.token()) {
      return;
    }
    this.api.me().subscribe({
      next: (user) => this.setUser(user),
      error: () => undefined
    });
  }

  updatePartner(partner: Partner): void {
    const user = this.user();
    if (user) {
      this.setUser({ ...user, partner });
    }
  }

  logout(redirect = true): void {
    this.token.set(null);
    this.user.set(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      return;
    } finally {
      if (redirect) {
        this.router.navigate(['/connexion']);
      }
    }
  }

  homeRoute(): string {
    return this.isAdmin() ? '/admin' : '/partenaire';
  }

  private store(res: AuthResponse): void {
    this.token.set(res.token);
    this.setUser(res.user);
    try {
      localStorage.setItem(TOKEN_KEY, res.token);
    } catch {
      return;
    }
  }

  private setUser(user: User): void {
    this.user.set(user);
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      return;
    }
  }

  private readToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private readUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
