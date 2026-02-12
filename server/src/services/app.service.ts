import { Injectable } from '@nestjs/common';
import {CronJob} from "cron";

@Injectable()
export class AppService {

  constructor() {

  }
  getHello(): string {
    return 'Hello World!';
  }

  isItTime(cronExpression: string): boolean {
    try {
      const job = new CronJob(cronExpression, () => {});

      // Отримуємо дату НАСТУПНОГО запуску відносно "хвилину тому"
      const now = new Date();
      const nextRun = job.nextDate().toJSDate();

      // Якщо наступний запуск запланований на поточну хвилину
      return (
          nextRun.getFullYear() === now.getFullYear() &&
          nextRun.getMonth() === now.getMonth() &&
          nextRun.getDate() === now.getDate() &&
          nextRun.getHours() === now.getHours() &&
          nextRun.getMinutes() === now.getMinutes()
      );
    } catch {
      return false;
    }
  }
}