import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { FirebaseService } from '../../../shared/firebase/firebase.service';

export interface JwtPayload {
  sub: string;       // User document ID
  firebaseUid: string;
  email?: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class FirebaseJwtStrategy extends PassportStrategy(Strategy, 'firebase-jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly firebase: FirebaseService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'stockflow-dev-secret',
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const doc = await this.firebase
      .collectionRef('users')
      .doc(payload.sub)
      .get();

    if (!doc.exists) {
      throw new UnauthorizedException('User not found');
    }

    const userData = doc.data();
    if (userData?.isActive === false) {
      throw new UnauthorizedException('User is deactivated');
    }

    return payload;
  }
}