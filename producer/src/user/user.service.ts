import { Injectable } from '@nestjs/common';
import {RedisService} from "../redis/redis.service";
import {ZeromqService} from "../zeromq/zeromq.service";

@Injectable()
export class UserService {
    constructor(private readonly redisService: ZeromqService) {
    }

    async getUserData(id: number) {
        return this.redisService.getUserData(id);
    }
}
