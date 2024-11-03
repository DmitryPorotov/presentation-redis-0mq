import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { RedisModule } from './redis/redis.module';
import { ZeromqModule } from './zeromq/zeromq.module';

@Module({
  imports: [UserModule, RedisModule, ZeromqModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
