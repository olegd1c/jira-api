import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from './jwt/jwt.strategy';
import * as config from '@config/config';
import { JiraService } from 'src/services/jira.service';

//const jwtConfig = config.get('jwt');
const jwtConfig = config.JWT;

@Module({
  imports: [
    PassportModule.register({defaultStrategy: 'jwt'}),
    JwtModule.register({
      secret: process.env.JWT_SECRET || jwtConfig.secret,
      signOptions: {
        expiresIn: jwtConfig.expiresIn
      }
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JiraService
  ],
  exports: [
    JwtStrategy,
    PassportModule
  ]
})
export class AuthModule {}
