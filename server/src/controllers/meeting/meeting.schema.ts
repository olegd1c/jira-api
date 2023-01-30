import { WeekType } from '@app/utils/utils';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Team } from '../team/team.schema';
import { User } from '../user/user.schema';

export type MeetingDocument = Meeting & Document;

export enum StatusMeeting {
  disabled = 0,
  active = 1
}

@Schema({ toJSON: { virtuals: true, getters: true }, toObject: { virtuals: true, getters: true }})
export class Meeting {
  @Prop()
  time?: string;

  @Prop()
  title: string;

  @Prop({ type: MongooseSchema.Types.ObjectId , ref: 'Team' })
  team?: MongooseSchema.Types.ObjectId | Team

  @Prop()
  cronTime?: string;

  @Prop()
  weekType?: WeekType;

  @Prop()
  status?: StatusMeeting;

  @Type(() => User)
  users?: User[];
}

const MeetingSchema = SchemaFactory.createForClass(Meeting);

MeetingSchema.virtual('users', {
  ref: 'User', // The model to use
  localField: 'team', // Find people where `localField`
  foreignField: 'team', // is equal to `foreignField`
  justOne: false
});

export {MeetingSchema};