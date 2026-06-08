import { User, UserRole } from './interfaces/user.interface';

export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  displayName?: string;
}

export const AUTH_SERVICE = Symbol('AUTH_SERVICE');

export interface IAuthService {
  /** Verify a Firebase Google OAuth ID token. Creates or syncs user in Firestore. */
  authenticateWithGoogle(idToken: string): Promise<AuthResult>;

  /** Verify a Firebase Phone OTP ID token. Creates or syncs user in Firestore. */
  authenticateWithPhone(idToken: string, displayName?: string): Promise<AuthResult>;

  /** Refresh an expired session token. */
  refreshToken(refreshToken: string): Promise<TokenPair>;

  /** Log out — invalidate refresh token. */
  logout(userId: string, refreshToken?: string): Promise<void>;

  /** Get the current user's profile. */
  getProfile(userId: string): Promise<User>;

  /** Update the current user's profile. */
  updateProfile(userId: string, dto: UpdateProfileDto): Promise<User>;
}