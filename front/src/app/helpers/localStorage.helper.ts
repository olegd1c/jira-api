import {Injectable} from '@angular/core';

@Injectable()
export class LocalStorageHelper {

    static stored_time : number = 60 * 60 * 24;
    private static timePrefix:string = '_time';

    public static setStorageForATime(name, value):boolean {
        var date = new Date();
        var schedule = Math.round((date.setSeconds(date.getSeconds() + this.stored_time)) / 1000);
        try {
            localStorage.setItem(name, value);
            localStorage.setItem(name + this.timePrefix, String(schedule));
        }
        catch (e) {
                return false;
        }
        return true
    }

    public static setStorage(name, value):boolean {
        localStorage.setItem(name, value);

        return true
    }

    public static removeStorage(name):boolean {
        try {
            localStorage.removeItem(name);
            localStorage.removeItem(name + this.timePrefix);
        } catch (e) {
            return false;
        }
        return true;
    }

    public static updateLeaveStorageTime(name):void {
        var date = new Date();
        var schedule = Math.round((date.setSeconds(date.getSeconds() + this.stored_time)) / 1000);
        localStorage.setItem(name + this.timePrefix, String(schedule));
    }

    public static getlocalStorage(name):string {
        var date = new Date();
        var current = Math.round( +date / 1000);
        // Get Schedule
        var end_stored_time = localStorage.getItem(name + this.timePrefix);
        if (end_stored_time == undefined || end_stored_time == 'null') {
            end_stored_time = '0';
        }
        // Expired
        if (Number(end_stored_time) < current) {
            // Remove
            LocalStorageHelper.removeStorage(name);
            return null;
        } else {
            LocalStorageHelper.updateLeaveStorageTime(name);
            try {
                return localStorage.getItem(name);
            } catch(e) {

                return null;
            }
        }
    }

    public static getStorageValue(name):string {
        return localStorage.getItem(name);
    }
}
