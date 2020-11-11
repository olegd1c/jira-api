import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt/jwt-payload.interface';
import { Permissions } from '@shared_models/permission.enum';

import { JiraService } from 'src/services/jira.service';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

@Injectable()
export class AuthService {

    constructor(
        private jwtService: JwtService,
        private jiraService: JiraService
    ) {}

    async signIn(authCredentialsDto: AuthCredentialsDto): Promise<{accessToken: string, username: string, permissions: string[]}> {
       const username = authCredentialsDto.username;
       const password = authCredentialsDto.password;

       const user = {username, password};
       let result;

       try {
           result = await this.jiraService.getJiraApi(user);
       } catch(e) {

       }

       if (!result) {
           throw new UnauthorizedException('Invalid credentials');
       }

       let permissions = [Permissions.view];
       const notif_users: string[] = [configService.get('NOTIFICATION_USERS')];
       if (notif_users && notif_users.length) {
        notif_users.map(item => {
            if (item === username) {
                permissions.push(Permissions.notify);
            }
        });
       }
       const payload: JwtPayload = { username, password, permissions };
       const accessToken = this.jwtService.sign(payload, {secret: configService.get('JWT_SECRET')});

       return {accessToken: accessToken, username: result.displayName, permissions: permissions};
    }
}
