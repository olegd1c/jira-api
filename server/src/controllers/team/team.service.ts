import { Model } from 'mongoose';
import { Injectable, NotFoundException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Team, TeamDocument } from './team.schema';
import { PostDto } from './dto/post.dto';
import { StatusTeam } from "@shared_models/team.model";

@Injectable()
class TeamService implements OnModuleInit {
  private readonly logger = new Logger(TeamService.name);

  constructor(@InjectModel(Team.name) private model: Model<TeamDocument>) { }

  async onModuleInit() {
    await this.migrateWebHookField();
  }

  async migrateWebHookField() {
    try {
      // @ts-ignore - ігноруємо, бо webHook офіційно вже видалено зі схеми
      const docsToMigrate = await this.model.countDocuments({ webHook: { $exists: true } });
      if (docsToMigrate > 0) {
        this.logger.log(`Found ${docsToMigrate} teams with old webHook field. Migrating to chat_url...`);
        // Використовуємо updateMany для масового перейменування
        await this.model.updateMany(
          { webHook: { $exists: true } },
          { $rename: { 'webHook': 'chat_url' } },
          { strict: false } // Дозволяємо працювати з полями поза схемою
        );
        this.logger.log('Database migration (webHook -> chat_url) completed successfully.');
      }
    } catch (err) {
      this.logger.error(`Migration failed: ${err.message}`);
    }
  }

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
    return this.model.find({ checkReview: true, status: StatusTeam.active, reviewChatId: { $ne: null } }).populate('users');
  }

  async findForTimeTracking(): Promise<TeamDocument[]> {
    return this.model.find({ checkReview: true, status: StatusTeam.active }).populate('users');
  }

}

export default TeamService;