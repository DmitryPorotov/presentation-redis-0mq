import { Provider } from '@nestjs/common';
import { RedisService } from './redis.service';
import con from '../constants';

export const redisProviders: Provider[] = [
  {
    useFactory: async () => {
      const inst = new RedisService();
      await inst.init();
      return inst;
    },
    provide: con.REDIS_MESSAGE_BROKER,
  },
];
