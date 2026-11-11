import { HttpClient } from '@angular/common/http';
import { Service, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  AuthResult,
  LoginCredentials,
  PublicUser,
  RegisterCredentials,
} from '../_models/auth.model';
import { environment } from '../../../environments/environment.development';

const API_URL = environment.API_URL;
const ACCESS_TOKEN_KEY = 'jabber-chat.accessToken';

@Service()
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly accessTokenSignal = signal<string | null>(
    localStorage.getItem(ACCESS_TOKEN_KEY),
  );
  private readonly currentUserSignal = signal<PublicUser | null>(null);

  readonly accessToken = this.accessTokenSignal.asReadonly();
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.accessTokenSignal() !== null);

  async login(credentials: LoginCredentials): Promise<PublicUser> {
    const result = await firstValueFrom(
      this.http.post<AuthResult>(`${API_URL}/auth/login`, credentials),
    );
    this.setSession(result);
    return result.user;
  }

  async register(credentials: RegisterCredentials): Promise<PublicUser> {
    const result = await firstValueFrom(
      this.http.post<AuthResult>(`${API_URL}/auth/register`, credentials),
    );
    this.setSession(result);
    return result.user;
  }

  async loadCurrentUser(): Promise<PublicUser | null> {
    if (!this.isAuthenticated()) {
      return null;
    }
    try {
      const user = await firstValueFrom(this.http.get<PublicUser>(`${API_URL}/auth/me`));
      this.currentUserSignal.set(user);
      return user;
    } catch {
      this.logout();
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    this.accessTokenSignal.set(null);
    this.currentUserSignal.set(null);
  }

  private setSession(result: AuthResult): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
    this.accessTokenSignal.set(result.accessToken);
    this.currentUserSignal.set(result.user);
  }
}
