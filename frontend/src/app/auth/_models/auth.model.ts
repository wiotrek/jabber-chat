export interface PublicUser {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResult {
  accessToken: string;
  user: PublicUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
  displayName?: string;
}

export interface RegisterFormModel {
  email: string;
  username: string;
  password: string;
  displayName: string;
}
