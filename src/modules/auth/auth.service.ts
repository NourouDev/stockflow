import { Injectable, Inject } from '@nestjs/common';
import { IAuthService, AuthResult, TokenPair, UpdateProfileDto } from './auth.service.interface';
import { IUserRepository, USER_REPOSITORY } from './repositories/user.repository.interface';
import { FirebaseService } from '../../shared/firebase/firebase.service';
import { User } from './interfaces/user.interface';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    private readonly firebase: FirebaseService,
  ) {}

  async authenticateWithGoogle(idToken: string): Promise<AuthResult> {
    const decoded = await this.firebase.verifyIdToken(idToken);
    
    let user = await this.userRepo.findByFirebaseUid(decoded.uid);
    
    if (!user) {
      user = await this.userRepo.create({
        firebaseUid: decoded.uid,
        email: decoded.email,
        displayName: decoded.name,
        firstName: decoded.name?.split(' ')[0],
        lastName: decoded.name?.split(' ').slice(1).join(' '),
        photoURL: decoded.picture,
        authProvider: 'google',
      });
    }

    const accessToken = 'placeholder-access-token'; // Will implement JWT issuance
    const refreshToken = 'placeholder-refresh-token';

    return { user, accessToken, refreshToken };
  }

  async authenticateWithPhone(idToken: string, displayName?: string): Promise<AuthResult> {
    const decoded = await this.firebase.verifyIdToken(idToken);
    
    let user = await this.userRepo.findByFirebaseUid(decoded.uid);
    
    if (!user) {
      user = await this.userRepo.create({
        firebaseUid: decoded.uid,
        phoneNumber: decoded.phone_number,
        displayName: displayName || decoded.phone_number,
        authProvider: 'phone',
      });
    }

    const accessToken = 'placeholder-access-token';
    const refreshToken = 'placeholder-refresh-token';

    return { user, accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    throw new Error('Not implemented yet');
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    // Will implement token invalidation
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    return this.userRepo.update(userId, dto);
  }
}