import { PassportStrategy } from '@nestjs/passport'
import { Strategy, ExtractJwt } from 'passport-jwt'
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from './jwt-payload.interface';
//import * as config from '@config/config';
import { User } from '@models/user.model';
import { JiraService } from 'src/services/jira.service';
import { ConfigService } from '@nestjs/config';

//const jwtConfig = config.JWT;
const configService = new ConfigService();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private jiraService: JiraService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET || configService.get('JWT_SECRET'),
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        const { username, password } = payload;
        let user = { username, password };

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

        return user;
    }
}
