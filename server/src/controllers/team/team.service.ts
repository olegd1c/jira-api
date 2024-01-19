import { Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Team, TeamDocument } from './team.schema';
import { PostDto } from './dto/post.dto';
import { StatusTeam } from "@shared_models/team.model";
 
@Injectable()
class TeamService {
  constructor(@InjectModel(Team.name) private model: Model<TeamDocument>) {}

  async findAll() {
    return this.model
    .find()
      .populate('users');
  }

  async findOne(id: string) {
    const post = await this.model.findById(id);
    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }

  create(postData: PostDto) {
    const createdPost = new this.model(postData);
    return createdPost.save();
  }

  async update(id: string, postData: PostDto) {
    const post = await this.model
      .findByIdAndUpdate(id, postData)
      .setOptions({ overwrite: true, new: true });
    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }

  async delete(postId: string) {
    const result = await this.model.findByIdAndDelete(postId);
    if (!result) {
      throw new NotFoundException();
    }
  }


  async deleteAll() {
    (await this.model.find()).forEach(item => {
      this.delete(item.id);
    });
  }

  async findForReview(): Promise<TeamDocument[]> {
    return this.model.find({checkReview: true, status: StatusTeam.active, reviewChatId: {$ne:null}}).populate('users');
  }
  
}
 
export default TeamService;