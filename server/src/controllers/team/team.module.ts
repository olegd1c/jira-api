import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import TeamController from './team.controller';
import { TeamSchema } from './team.schema';
import TeamService from './team.service';
 
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Team', schema: TeamSchema }]),
  ],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [MongooseModule],
})
class TeamModule {}
 
export default TeamModule;