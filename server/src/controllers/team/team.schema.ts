import { Type } from 'class-transformer';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../user/user.schema';

export type TeamDocument = Team & Document;

@Schema({ toJSON: { virtuals: true, getters: true }, toObject: { virtuals: true, getters: true }})
export class Team {
  @Prop()
  name: string;

  @Prop()
  reviewChatId: number;

  @Prop()
  teamChatId?: number;

  @Prop()
  boardId: number;

  @Prop()
  checkReview: boolean;

  @Type(() => User)
  users: User[];

}

let TeamSchema = SchemaFactory.createForClass(Team);

TeamSchema.virtual('users', {
  ref: 'User', // The model to use
  localField: '_id', // Find people where `localField`
  foreignField: 'team', // is equal to `foreignField`
  justOne: false
});

export {TeamSchema};