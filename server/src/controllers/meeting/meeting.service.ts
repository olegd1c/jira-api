import { Model } from 'mongoose';
import {Injectable, Logger, NotFoundException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Meeting, MeetingDocument } from './meeting.schema';
import { PostDto } from './dto/post.dto';
import { getWeekType, WeekType } from '@app/utils/utils';
 
@Injectable()
class MeetingService {
  private readonly logger = new Logger(MeetingService.name);

  constructor(@InjectModel(Meeting.name) private meetingModel: Model<MeetingDocument>) {}

  async findAll() {
    return (await this.meetingModel.find().populate('team'));
  }

  async findCurrent() {

    const weekType = getWeekType();
    const currentDate = new Date();
    const currentTime = ('0'+currentDate.getHours()).slice(-2) + ':' + ('0'+currentDate.getMinutes()).slice(-2);

    return this.meetingModel.find({ time: currentTime})
      .or([{ weekType: WeekType.all }, { weekType: weekType }]).populate('team').populate('users')
    ;
  }

  async findOne(id: string) {
    const post = await this.meetingModel.findById(id);
    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }

  create(postData: PostDto) {
    const createdPost = new this.meetingModel(postData);
    return createdPost.save();
  }

  async update(id: string, postData: PostDto) {
    const post = await this.meetingModel
      .findByIdAndUpdate(id, postData)
      .setOptions({ overwrite: true, new: true });
    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }

  async delete(postId: string) {
    const result = await this.meetingModel.findByIdAndDelete(postId);
    if (!result) {
      throw new NotFoundException();
    }
  }

  async deleteAll() {
    (await this.meetingModel.find()).forEach(item => {
      this.delete(item.id);
    });
  }
}
 
export default MeetingService;