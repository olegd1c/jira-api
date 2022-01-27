import CasesService from '@app/controllers/case/case.service';
import { User } from '@app/models/user.model';
import { HttpService, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CronJob } from 'cron';

@Injectable()
export class TelegramBotService {

  private url = 'https://api.telegram.org/bot';
  
  constructor(private httpService: HttpService, private configService: ConfigService, private casesService: CasesService) {

  }

  async sendMessage(data: {message: string}, user: User): Promise<any> {
    const token = this.configService.get('TELEGRAM_CHAT_TOKEN');
    const chatId = this.configService.get('TELEGRAM_CHAT_ID');
    const botId = this.configService.get('TELEGRAM_BOT_ID');

    const message = data.message + 'Автор сообщения: ' + user.displayName +"\n\n";

    let apiUrl = `${this.url}${botId}:${token}/sendMessage?chat_id=-${chatId}&text=${message}`;
    apiUrl = encodeURI(apiUrl);
    const headersRequest = {
        'Content-Type': 'application/json'
    };

    const result = await this.httpService.get(apiUrl, { headers: headersRequest }).toPromise();
    return result && result.status == 200 ? true : false;
  }

  async sendReminder(): Promise<any> {
    const token = this.configService.get('TELEGRAM_CHAT_TOKEN');
    const chatId = this.configService.get('TELEGRAM_CHAT_ID_MK_FRONT');
    const botId = this.configService.get('TELEGRAM_BOT_ID');

    //const message = data.message + 'Автор сообщения: ' + user.displayName +"\n\n";
    const message = 'Стендап 10.30'+"\n\n"+'@BogusUA @olegd1c';

    let apiUrl = `${this.url}${botId}:${token}/sendMessage?chat_id=-${chatId}&text=${message}`;
    apiUrl = encodeURI(apiUrl);
    const headersRequest = {
        'Content-Type': 'application/json'
    };
    const result = await this.httpService.get(apiUrl, { headers: headersRequest }).toPromise();

    return result && result.status == 200 ? true : false;
  }

  async sendReminderCron(): Promise<any> {
    const token = this.configService.get('TELEGRAM_CHAT_TOKEN');
    //const chatId = this.configService.get('TELEGRAM_CHAT_ID_MK_FRONT');
    const botId = this.configService.get('TELEGRAM_BOT_ID');
    
    //const data = await import('../data/tasks.json');
    const data = await this.casesService.findCurrent();

    data.forEach((item) => {

      const cr = new CronJob(item.cronTime, () => {
        this.sendNotify(item, botId, token);
      });
      
      cr.start();

      setTimeout(() => {
        cr.stop();
      }, 61*1000);
    });

    //const message = data.message + 'Автор сообщения: ' + user.displayName +"\n\n";

  }

  private sendNotify(item, botId, token) {
    const message = prepareMessage(item);
    const chatId = item.chatId;
  
    let apiUrl = `${this.url}${botId}:${token}/sendMessage?chat_id=-${chatId}&text=${message}`;
    apiUrl = encodeURI(apiUrl);
    const headersRequest = {
      'Content-Type': 'application/json'
    };
  
    this.httpService.get(apiUrl, { headers: headersRequest }).subscribe();
  }
}

function prepareMessage(item: { time: string; title: string; chatId: number; users: { name: string; }[]; }) {
  let mess = item.title+"\n";
  item.users.forEach(u => {
    mess = mess + u.name+"\n";
  });
  
  return mess;
}