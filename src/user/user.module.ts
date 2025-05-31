import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './model/user.model';
import { MailService } from '../services/mail.service';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, MailService],
  exports: [UserService], // Export if needed by other modules
})
export class UserModule {}