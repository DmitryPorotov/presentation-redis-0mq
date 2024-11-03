import { Module } from '@nestjs/common';
import { ZeromqService } from './zeromq.service';

@Module({
  providers: [ZeromqService],
  exports: [ZeromqService]
})
export class ZeromqModule {}
