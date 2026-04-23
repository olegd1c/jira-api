import { Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Case, CaseDocument } from './case.schema';
import { PostDto } from './dto/post.dto';
import { getWeekType, WeekType } from '@app/utils/utils';
 
@Injectable()
class CasesService {
  constructor(@InjectModel(Case.name) private caseModel: Model<CaseDocument>) {}

  async findAll() {
    return this.caseModel.find();
  }

  async findCurrent() {

    const weekType = getWeekType();
    const currentDate = new Date();
    const currentTime = ('0'+currentDate.getHours()).slice(-2) + ':' + ('0'+currentDate.getMinutes()).slice(-2);

    return this.caseModel.find({ time: currentTime, days: { $in: [currentDate.getDay()] }})
      .or([{ weekType: WeekType.all }, { weekType: weekType }])
    ;
  }

  async findOne(id: string) {
    const post = await this.caseModel.findById(id);
    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }

  create(postData: PostDto) {
    const createdPost = new this.caseModel(postData);
    return createdPost.save();
  }

  async update(id: string, postData: PostDto) {
    const post = await this.caseModel
      .findByIdAndUpdate(id, postData)
      .setOptions({ overwrite: true, new: true });
    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }

  async delete(postId: string) {
    const result = await this.caseModel.findByIdAndDelete(postId);
    if (!result) {
      throw new NotFoundException();
    }
  }


  async deleteAll() {
    (await this.caseModel.find()).forEach(item => {
      this.delete(item.id);
    });
  }
}
 
export default CasesService;