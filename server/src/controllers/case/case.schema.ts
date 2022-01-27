import { WeekType } from '@app/utils/utils';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from '../../mongo/schemas/user.shema';

export type CaseDocument = Case & Document;

@Schema()
export class Case {
  @Prop()
  time: string;

  @Prop()
  title: string;

  @Prop()
  chatId: number;

  @Prop()
  users: User[];

  @Prop()
  cronTime: string;

  @Prop()
  weekType: WeekType;
}

export const CaseSchema = SchemaFactory.createForClass(Case);