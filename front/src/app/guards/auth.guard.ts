import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate } from '@angular/router';
import {AuthenticationService} from '@app/services/authentication.service';

@Injectable()
export class AuthGuard implements CanActivate {
    private urlTo: string;
    private result: boolean;

    constructor() {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        this.result = true;
        if (AuthenticationService.getAccessToken()) {
            if  (route.data && route.data['permissions']) {
                if (!this.canPermission(route.data['permissions'])) {
                        this.urlTo = '/auth';
                        this.result = false;
                }
            } else {
                this.result = true;
            }

        } else {
            this.urlTo = '/auth';
            this.result = false;
        }

        return this.result;
    }

    canPermission(tryPermissins: Array<string>) {
        let result = false;
        const permissions = AuthenticationService.getPermissions();
        tryPermissins.map(elem => {
            result = result || !!permissions.find(item => item === elem);
        });
        return result;
    }
}
