import { Injectable } from "@nestjs/common";
import { MongooseModuleOptions, MongooseOptionsFactory } from "@nestjs/mongoose";
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {

  constructor(private configService:ConfigService) {}

  createMongooseOptions(): MongooseModuleOptions {
    console.log(this.configService.get<string>('MONGODB_URI'));
    return {
      uri: this.configService.get<string>('MONGODB_URI'),
    };
  }
}