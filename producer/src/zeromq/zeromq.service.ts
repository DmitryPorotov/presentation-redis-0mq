import { Injectable } from '@nestjs/common';
import {Push, Subscriber} from "zeromq";
import {env} from "process";
import {randomUUID} from "crypto";

const zmqServerPushUrl = env.ZMQ_SERVER_PULL_URL || "tcp://localhost:10002";
const zmqServerSubscribeUrl = env.ZMQ_SERVER_PULL_URL || "tcp://localhost:10001";

@Injectable()
export class ZeromqService {
    private isInit: boolean = false;
    private subscriber;
    private queueClient;
    private outstandingMessages: Map<string, {resolve: (val: any) => void, reject: (val: any) => void}> = new Map();
    async init(): Promise<void> {
        if (this.isInit) return ;
        this.isInit = true;
        this.subscriber = new Subscriber();
        await this.subscriber.connect(zmqServerSubscribeUrl);
        this.subscriber.subscribe("server1");

        this.queueClient = new Push();
        await this.queueClient.connect(zmqServerPushUrl);

        for await (const [topic, msg] of this.subscriber) {
            console.log(
                "received a message related to:",
                topic,
                "containing message:",
                msg,
            );
            const data = JSON.parse(msg);
            const uuid = data.uuid;
            const {resolve, reject} = this.outstandingMessages.get(uuid);
            this.outstandingMessages.delete(uuid);
            if (data.ok) {
                resolve(data.data);
            }
            else {
                reject(data.message);
            }
        }
    }

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
            this.queueClient.send(JSON.stringify(msg));
        });
    }

}
