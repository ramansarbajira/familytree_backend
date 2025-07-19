// relationships.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RelationshipsController } from './relationships.controller';
import { RelationshipsService } from './relationships.service';
import { Relationship } from './entities/relationship.model';
import { RelationshipTranslation } from './entities/relationship-translation.model';
import { RelationshipCustomLabelsModule } from './relationship-custom-labels.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Relationship, RelationshipTranslation]),
    RelationshipCustomLabelsModule,
  ],
  controllers: [RelationshipsController],
  providers: [RelationshipsService],
  exports: [RelationshipsService],
})
export class RelationshipsModule {}
