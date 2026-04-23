import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import MeetingController from './meeting.controller';
import { MeetingSchema } from './meeting.schema';
import MeetingService from './meeting.service';
 
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Meeting', schema: MeetingSchema }]),
  ],
  controllers: [MeetingController],
  providers: [MeetingService],
  exports: [MongooseModule],
})
class MeetingModule {}
 
export default MeetingModule;