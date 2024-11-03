import {Pull, Push, Publisher} from "zeromq";
import {env} from 'process';

const zmqWorkerPullUrl = env.ZMQ_WORKER_PULL_URL || "tcp://localhost:20002";
const zmqWorkerPushUrl = env.ZMQ_WORKER_PULL_URL || "tcp://localhost:20001";
const zmqServerPullUrl = env.ZMQ_SERVER_PULL_URL || "tcp://localhost:10002";
const zmqServerPublishUrl = env.ZMQ_SERVER_PULL_URL || "tcp://localhost:10001";

async function start() {
    const workerPullSocket = new Pull();
    await workerPullSocket.bind(zmqWorkerPullUrl as string);
    const workerPushSocket = new Push();
    await workerPushSocket.bind(zmqWorkerPushUrl as string);

    const serverPullSocket = new Pull();
    await serverPullSocket.bind(zmqServerPullUrl as string);
    const serverPublishSocket = new Publisher();
    await serverPublishSocket.bind(zmqServerPublishUrl as string);


    for await (const [msg] of serverPullSocket) {
        await workerPushSocket.send(msg);
        const reply = await workerPullSocket.receive();
        const data = JSON.parse(reply[0].toString());
        await serverPublishSocket.send([data.returnTo, reply[0]]);
    }

}

start();