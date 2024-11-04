import { Module } from '@nestjs/common';
import {zeromqProviders} from "./zeromq.providers";

@Module({
  providers: [...zeromqProviders],
  exports: [...zeromqProviders]
})
export class ZeromqModule {}
