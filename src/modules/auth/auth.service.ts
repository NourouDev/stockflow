import {
  Injectable,
  Inject,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IAuthService, AuthResult, TokenPair } from './auth.service.interface';
import {
  IUserRepository,
  USER_REPOSITORY,
} from './repositories/user.repository.interface';
import { FirebaseService } from '../../shared/firebase/firebase.service';
import { User } from './interfaces/user.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: IUserRepository,
    private readonly firebase: FirebaseService,
    private readonly jwtService: JwtService,
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

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    return this.generateTokens(user);
  }

  async authenticateWithPhone(
    idToken: string,
    displayName?: string,
  ): Promise<AuthResult> {
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

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    return this.generateTokens(user);
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.getRefreshSecret(),
      });

      // Ensure the user still exists
      const user = await this.userRepo.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or deactivated');
      }

      return this.generateTokenPair(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    // For now, we rely on short-lived access tokens and client-side token removal.
    // A refresh token blacklist can be added for production.
    // The frontend should delete the tokens from storage.
    return;
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    return this.userRepo.update(userId, dto);
  }

  private async generateTokens(user: User): Promise<AuthResult> {
    const { accessToken, refreshToken } = this.generateTokenPair(user);
    return { user, accessToken, refreshToken };
  }

  private generateTokenPair(user: User): TokenPair {
    const payload = {
      sub: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRATION || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.getRefreshSecret(),
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    });

    return { accessToken, refreshToken };
  }

  private getRefreshSecret(): string {
    return (
      process.env.JWT_REFRESH_SECRET ||
      process.env.JWT_SECRET ||
      'stockflow-refresh-secret'
    );
  }
}