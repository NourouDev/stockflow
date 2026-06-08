import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AUTH_SERVICE } from './auth.service.interface';
import { USER_REPOSITORY } from './repositories/user.repository.interface';
import { FirestoreUserRepository } from './repositories/user.repository';
import { FirebaseJwtStrategy } from './strategies/firebase-jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'firebase-jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'stockflow-dev-secret',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION') || '15m',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    { provide: AUTH_SERVICE, useClass: AuthService },
    { provide: USER_REPOSITORY, useClass: FirestoreUserRepository },
    FirebaseJwtStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [AUTH_SERVICE, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}