import { User } from '@app/models/user.model';
import { HttpService, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class TelegramBotService {

  private url = 'https://api.telegram.org/bot';
  
  constructor(private httpService: HttpService, private configService: ConfigService) {

  }

  sendMessage(data: {message: string}, user: User): Observable<any> {
    const token = this.configService.get('TELEGRAM_CHAT_TOKEN');
    const chatId = this.configService.get('TELEGRAM_CHAT_ID');
    const botId = this.configService.get('TELEGRAM_BOT_ID');

    const message = data.message + 'Автор сообщения: ' + user.displayName +"\n\n";

    let apiUrl = `${this.url}${botId}:${token}/sendMessage?chat_id=-${chatId}&text=${message}`;
    apiUrl = encodeURI(apiUrl);
    const headersRequest = {
        'Content-Type': 'application/json'
    };

    return this.httpService.get(apiUrl, { headers: headersRequest });
  }

  
}