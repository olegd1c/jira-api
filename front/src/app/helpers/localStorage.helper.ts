import {Injectable} from '@angular/core';

@Injectable()
export class LocalStorageHelper {

  static stored_time: number = 60 * 60 * 24;
  private static timePrefix = '_time';
  private static settingsFilters = 'filters';

  public static setStorageForATime(name, value): boolean {
    const date = new Date();
    const schedule = Math.round((date.setSeconds(date.getSeconds() + this.stored_time)) / 1000);
    try {
      localStorage.setItem(name, value);
      localStorage.setItem(name + this.timePrefix, String(schedule));
    } catch (e) {
      return false;
    }
    return true;
  }

  public static setStorage(name, value): boolean {
    localStorage.setItem(name, value);

    return true;
  }

  public static removeStorage(name): boolean {
    try {
      localStorage.removeItem(name);
      localStorage.removeItem(name + this.timePrefix);
    } catch (e) {
      return false;
    }
    return true;
  }

  public static updateLeaveStorageTime(name): void {
    const date = new Date();
    const schedule = Math.round((date.setSeconds(date.getSeconds() + this.stored_time)) / 1000);
    localStorage.setItem(name + this.timePrefix, String(schedule));
  }

  public static getlocalStorage(name): string {
    const date = new Date();
    const current = Math.round(+date / 1000);
    // Get Schedule
    let end_stored_time = localStorage.getItem(name + this.timePrefix);
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
      } catch (e) {

        return null;
      }
    }
  }

  public static getStorageValue(name): string {
    return localStorage.getItem(name);
  }

  public static getFilters(item: string) {
    const data = LocalStorageHelper.getStorageValue(LocalStorageHelper.settingsFilters);
    let filters = {};

    if (data) {
      filters = JSON.parse(data);
    }
    return filters[item];
  }

  public static setFilters(item: string, value: any) {
    const data = LocalStorageHelper.getStorageValue('filters');
    let filters = {};

    if (data) {
      filters = JSON.parse(data);
    }
    filters[item] = value;

    LocalStorageHelper.setStorage(LocalStorageHelper.settingsFilters, JSON.stringify(filters));
  }
}
