import { Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { PostDto } from './dto/post.dto';
import { getWeekType, WeekType } from '@app/utils/utils';
 
@Injectable()
class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find().populate('team');
  }

  async findCurrent() {

    const weekType = getWeekType();
    const currentDate = new Date();
    const currentTime = ('0'+currentDate.getHours()).slice(-2) + ':' + ('0'+currentDate.getMinutes()).slice(-2);

    return this.userModel.find({ time: currentTime, days: { $in: [currentDate.getDay()] }})
      .or([{ weekType: WeekType.all }, { weekType: weekType }])
    ;
  }

  async findOne(id: string) {
    const post = await this.userModel.findById(id);
    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }

  create(postData: PostDto) {
    const createdPost = new this.userModel(postData);
    return createdPost.save();
  }

  async update(id: string, postData: PostDto) {
    const post = await this.userModel
      .findByIdAndUpdate(id, postData)
      .setOptions({ overwrite: true, new: true });
    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }

  async delete(postId: string) {
    const result = await this.userModel.findByIdAndDelete(postId);
    if (!result) {
      throw new NotFoundException();
    }
  }


  async deleteAll() {
    (await this.userModel.find()).forEach(item => {
      this.delete(item.id);
    });
  }
}
 
export default UserService;