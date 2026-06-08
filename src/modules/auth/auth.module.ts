import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AUTH_SERVICE, IAuthService } from './auth.service.interface';
import { USER_REPOSITORY, IUserRepository } from './repositories/user.repository.interface';

@Module({
  controllers: [],  // Controllers will be added when implemented
  providers: [
    { provide: AUTH_SERVICE, useClass: AuthService },
    // UserRepository will be registered when the Firestore implementation is built
    // { provide: USER_REPOSITORY, useClass: FirestoreUserRepository },
  ],
  exports: [AUTH_SERVICE],
})
export class AuthModule {}