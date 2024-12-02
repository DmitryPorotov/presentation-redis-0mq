import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RedisModule } from '../redis/redis.module';
import { ZeromqModule } from '../zeromq/zeromq.module';

@Module({
  imports: [RedisModule, ZeromqModule],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
