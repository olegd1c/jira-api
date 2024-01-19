import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { StatusUser } from "@shared_models/users.model";

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  name: string;

  @Prop({ type: MongooseSchema.Types.ObjectId , ref: 'Team' })
  team?: MongooseSchema.Types.ObjectId

  @Prop()
  jiraLogin: string;

  @Prop()
  telegramLogin: string;

  @Prop()
  status: StatusUser;
}

let UserSchema = SchemaFactory.createForClass(User);

/*
UserSchema.virtual('TeamOb', {
  ref: 'Team', // The model to use
  localField: 'team1', // Find people where `localField`
  foreignField: '_id1', // is equal to `foreignField`
  justOne: false
});
*/

export {UserSchema};