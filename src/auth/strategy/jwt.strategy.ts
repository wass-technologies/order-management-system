import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.BL_JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const user = await this.authService.validate(payload.userId); 
    if (!user) {
        throw new UnauthorizedException('Authentication failed.');
    }
    return {
      userId: user.id,
      email: user.email,
      accountId: user.id,
      roles: user.roles, 
      permissions: user.permissions,
    };
}
}
