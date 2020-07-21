import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

    constructor(
        private authService: AuthService
    ) {}

    /*
    @Post('/signup')
    signUp(@Body(ValidationPipe) authCredo: AuthCredentialsDto) {
        return this.authService.signUp(authCredo);
    }
    */

    @Post('/signin')
    signIn(@Body(ValidationPipe) authCredo: AuthCredentialsDto): Promise<{accessToken: string}> {
        return this.authService.signIn(authCredo);
    }
}
