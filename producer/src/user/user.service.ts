import { Inject, Injectable } from '@nestjs/common';
import { MessageBrokerInterface } from '../message.broker.interface';
import con from '../constants';

@Injectable()
export class UserService {
  constructor(
    @Inject(con.MESSAGE_BROKER_PROVIDER)
    private readonly userBroker: MessageBrokerInterface,
  ) {}

  async getUserData(id: number) {
    return this.userBroker.getUserData(id);
  }
}
