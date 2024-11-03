import {Pull, Push} from "zeromq";
import {env} from 'process';

const workerName = env.HOSTNAME || "worker1";
const zmqPullUrl = env.ZMQ_PULL_URL || "tcp://localhost:20001";
const zmqPushUrl = env.ZMQ_PUSH_URL || "tcp://localhost:20002";

const db = {
    1 : {
        username: "User1",
    },
    2 : {
        username: "User2",
    }
};


async function start() {
    const pullSocket = new Pull();
    pullSocket.connect(zmqPullUrl as string);
    const pushSocket = new Push();
    pushSocket.connect(zmqPushUrl as string);
    for await (const [message] of pullSocket) {
        const data = JSON.parse(message.toString());
        const retVal: {
            uuid: string,
            ok: boolean,
            message?: string,
            data?: any,
            returnTo: string
        } = {
            uuid: data.uuid,
            ok: true,
            returnTo: data.returnTo
        };
        if (data.id in db) {
            // @ts-ignore
            retVal.data = db[data.id]
        }
        else {
            retVal.ok = false;
            retVal.message = `No user id ${data.id} found.`;
        }
        console.log(`[worker-${workerName}]: ${JSON.stringify(retVal)}`);
        await pushSocket.send(JSON.stringify(retVal));
    }
}

start();