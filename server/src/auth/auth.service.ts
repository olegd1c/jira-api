import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt/jwt-payload.interface';

import * as config from '../config/config';
import { JiraService } from 'src/services/jira.service';

const jwtConfig = config.JWT;

@Injectable()
export class AuthService {

    constructor(
        private jwtService: JwtService,
        private jiraService: JiraService
    ) {}

    /*
    async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
        return this.userRepository.signUp(authCredentialsDto);
    }
    */

    async signIn(authCredentialsDto: AuthCredentialsDto): Promise<{accessToken: string, username: string}> {
       //const username = await this.userRepository.validateUserPassword(authCredentialsDto);
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
        


       const payload: JwtPayload = { username, password };
       const accessToken = this.jwtService.sign(payload, {secret: '1234'});

       return {accessToken: accessToken, username: username};
    }
}
