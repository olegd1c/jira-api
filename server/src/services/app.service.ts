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
      // 1. Створюємо об'єкт CronJob (другий аргумент - пуста функція)
      const job = new CronJob(cronExpression, () => {});

      // 2. Отримуємо дату останнього запуску відносно "зараз"
      const lastExecution = job.lastDate();

      if (!lastExecution) return false;

      // 3. Отримуємо поточний час і скидаємо секунди/мілісекунди для точного порівняння
      const now = new Date();
      now.setSeconds(0, 0);

      const lastRun = new Date(lastExecution);
      lastRun.setSeconds(0, 0);

      // 4. Порівнюємо (в мілісекундах)
      return now.getTime() === lastRun.getTime();
    } catch (error) {
      // Якщо маска крона в базі виявилася битою
      return false;
    }
  }
}