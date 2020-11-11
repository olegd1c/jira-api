import { PassportStrategy } from '@nestjs/passport'
import { Strategy, ExtractJwt } from 'passport-jwt'
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from './jwt-payload.interface';
import { User } from '@models/user.model';
import { JiraService } from 'src/services/jira.service';
import { ConfigService } from '@nestjs/config';

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
        let user = { username, password, permissions };

        let result;
        try {
            result = await this.jiraService.getJiraApi(user);
        } catch(e) {

        }
        
        //const user = this.userRepository.findOne({ username });

        if (!result) {
            user = null;
            throw new UnauthorizedException('');
        }
        user = Object.assign(user, {displayName: result.displayName})
        return user;
    }
}
