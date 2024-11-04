import {Provider} from "@nestjs/common";
import {RedisService} from "./redis.service";
import con from '../constants'

export const redisProviders: Provider[] = [
    {
        useClass: RedisService,
        provide: con.REDIS_MESSAGE_BROKER
    }
];
