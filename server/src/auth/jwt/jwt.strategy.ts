import { PassportStrategy } from '@nestjs/passport'
import { Strategy, ExtractJwt } from 'passport-jwt'
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from './jwt-payload.interface';
import { User } from '@models/user.model';
import { JiraService } from 'src/services/jira.service';
import { ConfigService } from '@nestjs/config';
import { decrypt } from '../../utils/crypto.helper';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private jiraService: JiraService,
        private configService: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET || configService.get('JWT_SECRET'),
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        const { username, password, permissions } = payload;
        const secret = this.configService.get('JWT_SECRET');
        let user = { 
            username: decrypt(username, secret), 
            password: decrypt(password, secret), 
            permissions 
        };

        let result;
        try {
            result = await this.jiraService.getJiraApi(user);
        } catch (e) {

        }

        if (!result) {
            user = null;
            throw new UnauthorizedException('');
        }
        user = Object.assign(user, { displayName: result.displayName })
        return user;
    }
}
