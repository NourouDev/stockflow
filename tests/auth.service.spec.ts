import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { AuthService } from '../src/modules/auth/auth.service';
import { FirebaseService } from '../src/shared/firebase/firebase.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepo: Record<string, ReturnType<typeof vi.fn>>;
  let mockFirebase: Record<string, ReturnType<typeof vi.fn>>;
  let mockJwtService: Record<string, ReturnType<typeof vi.fn>>;

  const mockUser = {
    id: 'user-123',
    firebaseUid: 'google-oauth2|123456',
    email: 'test@example.com',
    displayName: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    role: 'viewer' as const,
    isActive: true,
    authProvider: 'google' as const,
    photoURL: 'https://example.com/photo.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDecodedToken = {
    uid: 'google-oauth2|123456',
    email: 'test@example.com',
    name: 'Test User',
    picture: 'https://example.com/photo.jpg',
    sub: '123456',
    aud: 'test-app',
    iat: 123,
    exp: 456,
    iss: 'https://securetoken.google.com/test-app',
  };

  beforeEach(() => {
    mockUserRepo = {
      findById: vi.fn(),
      findByFirebaseUid: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
      existsByFirebaseUid: vi.fn(),
    };

    mockFirebase = {
      verifyIdToken: vi.fn(),
      auth: vi.fn(),
      firestore: vi.fn(),
      docRef: vi.fn(),
      collectionRef: vi.fn(),
      runTransaction: vi.fn(),
      batch: vi.fn(),
      subCollectionRef: vi.fn(),
      collectionGroupRef: vi.fn(),
    };

    mockJwtService = {
      sign: vi.fn().mockReturnValue('mock-jwt-token'),
      verifyAsync: vi.fn(),
    };

    // Set env vars for the service to use
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRATION = '15m';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_REFRESH_EXPIRATION = '7d';

    authService = new AuthService(
      mockUserRepo as any,
      mockFirebase as unknown as FirebaseService,
      mockJwtService as unknown as JwtService,
    );
  });

  describe('authenticateWithGoogle', () => {
    it('should create a new user if first time signing in', async () => {
      mockFirebase.verifyIdToken.mockResolvedValue(mockDecodedToken);
      mockUserRepo.findByFirebaseUid.mockResolvedValue(null);
      mockUserRepo.create.mockResolvedValue(mockUser);

      const result = await authService.authenticateWithGoogle('valid-google-token');

      expect(mockFirebase.verifyIdToken).toHaveBeenCalledWith('valid-google-token');
      expect(mockUserRepo.findByFirebaseUid).toHaveBeenCalledWith('google-oauth2|123456');
      expect(mockUserRepo.create).toHaveBeenCalledWith({
        firebaseUid: 'google-oauth2|123456',
        email: 'test@example.com',
        displayName: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        photoURL: 'https://example.com/photo.jpg',
        authProvider: 'google',
      });
      expect(result.user).toEqual(mockUser);
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.refreshToken).toBe('mock-jwt-token');
    });

    it('should return existing user on subsequent sign in', async () => {
      mockFirebase.verifyIdToken.mockResolvedValue(mockDecodedToken);
      mockUserRepo.findByFirebaseUid.mockResolvedValue(mockUser);

      const result = await authService.authenticateWithGoogle('valid-google-token');

      expect(mockUserRepo.create).not.toHaveBeenCalled();
      expect(result.user).toEqual(mockUser);
    });

    it('should throw if user is deactivated', async () => {
      const deactivatedUser = { ...mockUser, isActive: false };
      mockFirebase.verifyIdToken.mockResolvedValue(mockDecodedToken);
      mockUserRepo.findByFirebaseUid.mockResolvedValue(deactivatedUser);

      await expect(
        authService.authenticateWithGoogle('valid-google-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if Firebase token is invalid', async () => {
      mockFirebase.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      await expect(
        authService.authenticateWithGoogle('invalid-token'),
      ).rejects.toThrow();
    });
  });

  describe('authenticateWithPhone', () => {
    const phoneDecodedToken = {
      ...mockDecodedToken,
      uid: 'phone|987654',
      phone_number: '+15551234567',
      name: undefined,
    };

    const phoneUser = {
      ...mockUser,
      firebaseUid: 'phone|987654',
      phoneNumber: '+15551234567',
      authProvider: 'phone' as const,
    };

    it('should create new phone user with display name', async () => {
      mockFirebase.verifyIdToken.mockResolvedValue(phoneDecodedToken);
      mockUserRepo.findByFirebaseUid.mockResolvedValue(null);
      mockUserRepo.create.mockResolvedValue(phoneUser);

      const result = await authService.authenticateWithPhone('valid-phone-token', 'John');

      expect(mockUserRepo.create).toHaveBeenCalledWith({
        firebaseUid: 'phone|987654',
        phoneNumber: '+15551234567',
        displayName: 'John',
        authProvider: 'phone',
      });
      expect(result.user).toEqual(phoneUser);
    });

    it('should use phone number as display name if not provided', async () => {
      mockFirebase.verifyIdToken.mockResolvedValue(phoneDecodedToken);
      mockUserRepo.findByFirebaseUid.mockResolvedValue(null);
      mockUserRepo.create.mockResolvedValue(phoneUser);

      await authService.authenticateWithPhone('valid-phone-token');

      expect(mockUserRepo.create).toHaveBeenCalledWith({
        firebaseUid: 'phone|987654',
        phoneNumber: '+15551234567',
        displayName: '+15551234567',
        authProvider: 'phone',
      });
    });

    it('should return existing phone user', async () => {
      mockFirebase.verifyIdToken.mockResolvedValue(phoneDecodedToken);
      mockUserRepo.findByFirebaseUid.mockResolvedValue(phoneUser);

      const result = await authService.authenticateWithPhone('valid-phone-token');

      expect(mockUserRepo.create).not.toHaveBeenCalled();
      expect(result.user).toEqual(phoneUser);
    });

    it('should throw if phone user is deactivated', async () => {
      const deactivatedUser = { ...phoneUser, isActive: false };
      mockFirebase.verifyIdToken.mockResolvedValue(phoneDecodedToken);
      mockUserRepo.findByFirebaseUid.mockResolvedValue(deactivatedUser);

      await expect(
        authService.authenticateWithPhone('valid-phone-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should return a new token pair when refresh token is valid', async () => {
      const decodedPayload = { sub: 'user-123', role: 'viewer' };
      mockJwtService.verifyAsync.mockResolvedValue(decodedPayload);
      mockUserRepo.findById.mockResolvedValue(mockUser);

      const result = await authService.refreshToken('valid-refresh-token');

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.refreshToken).toBe('mock-jwt-token');
    });

    it('should throw if user is deactivated', async () => {
      const decodedPayload = { sub: 'user-123', role: 'viewer' };
      mockJwtService.verifyAsync.mockResolvedValue(decodedPayload);
      mockUserRepo.findById.mockResolvedValue({ ...mockUser, isActive: false });

      await expect(
        authService.refreshToken('valid-refresh-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if refresh token is invalid', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Token expired'));

      await expect(
        authService.refreshToken('invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser);

      const result = await authService.getProfile('user-123');
      expect(result).toEqual(mockUser);
    });

    it('should throw if user not found', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(
        authService.getProfile('nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('should update and return user', async () => {
      const dto = { firstName: 'Updated' };
      const updatedUser = { ...mockUser, firstName: 'Updated' };
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.update.mockResolvedValue(updatedUser);

      const result = await authService.updateProfile('user-123', dto);
      expect(result.firstName).toBe('Updated');
      expect(mockUserRepo.update).toHaveBeenCalledWith('user-123', dto);
    });

    it('should throw if user not found', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(
        authService.updateProfile('nonexistent', { firstName: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('logout', () => {
    it('should not throw', async () => {
      await expect(
        authService.logout('user-123'),
      ).resolves.toBeUndefined();
    });
  });
});