import { Injectable } from '@nestjs/common';
import { Push, Subscriber } from 'zeromq';
import { randomUUID } from 'crypto';
import { MessageBrokerInterface } from '../message.broker.interface';
import con from '../constants';

@Injectable()
export class ZeromqService implements MessageBrokerInterface {
  private isInit: boolean = false;
  private subscriber;
  private queueClient;
  private outstandingMessages: Map<
    string,
    { resolve: (val: any) => void; reject: (val: any) => void }
  > = new Map();
  async init(): Promise<void> {
    if (this.isInit) return;
    this.isInit = true;
    this.subscriber = new Subscriber();
    await this.subscriber.connect(con.ZMQ_SERVER_SUBSCRIBE_URL);
    this.subscriber.subscribe('server1');

    this.queueClient = new Push();
    await this.queueClient.connect(con.ZMQ_SERVER_PUSH_URL);
    this.readPub();
  }
  private async readPub() {
    for await (const [topic, msg] of this.subscriber) {
      const data = JSON.parse(msg);
      const uuid = data.uuid;
      const { resolve, reject } = this.outstandingMessages.get(uuid);
      this.outstandingMessages.delete(uuid);
      if (data.ok) {
        resolve(data.data);
      } else {
        reject(data.message);
      }
    }
  }
  async getUserData(id: number): Promise<object> {
    return new Promise(async (resolve, reject) => {
      const msg = {
        id,
        returnTo: 'server1',
        uuid: randomUUID(),
      };
      this.outstandingMessages.set(msg.uuid, {
        resolve,
        reject,
      });
      this.queueClient.send(JSON.stringify(msg));
    });
  }
}
