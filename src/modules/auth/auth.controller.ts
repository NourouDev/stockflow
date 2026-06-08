import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { IAuthService, AUTH_SERVICE, AuthResult, TokenPair } from './auth.service.interface';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { PhoneAuthDto } from './dto/phone-auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './interfaces/user.interface';
import { JwtPayload } from './strategies/firebase-jwt.strategy';
import { Inject } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: IAuthService,
  ) {}

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleAuth(@Body() dto: GoogleAuthDto): Promise<AuthResult> {
    return this.authService.authenticateWithGoogle(dto.idToken);
  }

  @Post('phone')
  @HttpCode(HttpStatus.OK)
  async phoneAuth(@Body() dto: PhoneAuthDto): Promise<AuthResult> {
    return this.authService.authenticateWithPhone(dto.idToken, dto.displayName);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto): Promise<TokenPair> {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentUser() user: JwtPayload,
    @Body() _body: { refreshToken?: string },
  ): Promise<void> {
    return this.authService.logout(user.sub, _body.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: JwtPayload): Promise<User> {
    return this.authService.getProfile(user.sub);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ): Promise<User> {
    return this.authService.updateProfile(user.sub, dto);
  }
}