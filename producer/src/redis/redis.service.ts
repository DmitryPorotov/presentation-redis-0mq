import { Injectable } from '@nestjs/common';
import {createClient} from 'redis';
import {randomUUID} from "crypto";
import { env } from "process";

const redisUrl = env.REDIS_URL || "redis://localhost:6379";

@Injectable()
export class RedisService {
    private isInit: boolean = false;
    private subscriber;
    private queueClient;
    private outstandingMessages: Map<string, {resolve: (val: any) => void, reject: (val: any) => void}> = new Map();
    async init(): Promise<void> {
        if (this.isInit) return ;
        this.isInit = true;
        this.subscriber = createClient({
            url: redisUrl
        });
        this.subscriber.on('error', (err) => console.error('Redis Sub Client Error', err));
        await this.subscriber.connect();

        await this.subscriber.pSubscribe(['server1'], this.onMessageFromWorker);

        this.queueClient = createClient({
            url: redisUrl
        });
        this.queueClient.on('error', (err) => console.error('Redis List Client Error', err));
        await this.queueClient.connect();
    }

    private onMessageFromWorker = (message: string) => {
        const data = JSON.parse(message);
        const uuid = data.uuid;
        const {resolve, reject} = this.outstandingMessages.get(uuid);
        this.outstandingMessages.delete(uuid);
        if (data.ok) {
            resolve(data.data);
        }
        else {
            reject(data.message);
        }
    };

    async getUserData(id: number): Promise<object> {
        await this.init();
        return new Promise(async (resolve, reject) => {
            const msg = {
                id,
                returnTo: "server1",
                uuid: randomUUID()
            };
            this.outstandingMessages.set(msg.uuid, {
                resolve,
                reject
            });
            this.queueClient.lPush('users_data', JSON.stringify(msg))
        });
    }
}
