import {Provider} from "@nestjs/common";
import con from '../constants';
import {ZeromqService} from './zeromq.service';

export const zeromqProviders: Provider[] = [
    {
        provide: con.ZMQ_MESSAGE_BROKER,
        useClass: ZeromqService
    }
];