import {
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
    UnauthorizedException,
    Scope,
    Inject
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { AuthGuard } from '@nestjs/passport';
  import { REQUEST } from '@nestjs/core';
  import { Request } from 'express';
  
  @Injectable({ scope: Scope.REQUEST })
  export class JwtAuthGuard extends AuthGuard('jwt') {
    permissions: string[] = null;

    constructor(private reflector: Reflector, @Inject(REQUEST) private readonly request: Request) {
      super()
    }

    canActivate(context: ExecutionContext) {
      // Add your custom authentication logic here
      // for example, call super.logIn(request) to establish a session.
      this.permissions = this.reflector.get<string[]>('permissions', context.getHandler());

      return super.canActivate(context);
    }
  
    handleRequest(err, user, info) {
      // You can throw an exception based on either "info" or "err" arguments
      if (err || !user) {
        throw err || new UnauthorizedException();
      }

      let isAccess = false;  
      user.permissions.map( uP => {
        this.permissions.map(p => {
          if (p === uP) {
            isAccess = true;
          }
        });
      });

      if (!isAccess) {
        throw new HttpException('access denided', HttpStatus.FORBIDDEN);
      }

      return user;
    }
  }
  