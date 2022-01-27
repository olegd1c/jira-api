import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import CaseController from './case.controller';
import { Case, CaseSchema } from './case.schema';
import CasesService from './case.service';
 
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Case', schema: CaseSchema }]),
  ],
  controllers: [CaseController],
  providers: [CasesService],
  exports: [MongooseModule],
})
class CasesModule {}
 
export default CasesModule;