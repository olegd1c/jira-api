import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt/jwt-payload.interface';
import { Permissions } from '@shared_models/permission.enum';

import { JiraService } from 'src/services/jira.service';
import { ConfigService } from '@nestjs/config';
import UserService from "@app/controllers/user/user.service";

const configService = new ConfigService();

@Injectable()
export class AuthService {

    constructor(
        private jwtService: JwtService,
        private jiraService: JiraService,
        private userService: UserService,
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

        const notifUsersSet = new Set(configService.get<string>('NOTIFICATION_USERS', '').split(','));
        const usersExecutors = await this.userService.findExecutors();

        usersExecutors.forEach(user => {
            if (user.jiraLogin) notifUsersSet.add(user.jiraLogin);
        });

        if (notifUsersSet.has(username)) {
            permissions.push(Permissions.notify);
        }

        const reminderUsersSet = new Set(configService.get<string>('REMINDER_USERS', '').split(','));
        if (reminderUsersSet.has(username)) {
            permissions.push(Permissions.reminder);
        }

       const payload: JwtPayload = { username, password, permissions };
       const accessToken = this.jwtService.sign(payload, {secret: configService.get('JWT_SECRET')});

       return {accessToken: accessToken, username: result.displayName, permissions: permissions};
    }
}
