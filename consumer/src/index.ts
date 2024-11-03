import {createClient} from "redis";
import {env} from "process";

const redisUrl = env.REDIS_URL || "redis://localhost:6379";
const workerName = env.HOSTNAME || "worker1";

const db = {
    1 : {
        username: "User1",
    },
    2 : {
        username: "User2",
    }
};

async function start() {
    const publisher = createClient({
        url: redisUrl
    });
    publisher.on('error', (err) => console.error('Redis Pub Client Error', err));
    await publisher.connect();
    const queueClient = createClient({
        url: redisUrl
    });
    queueClient.on('error', (err) => console.error('Redis List Client Error', err));
    await queueClient.connect();

    while (true) {
        const reply = await queueClient.blPop(['users_data'], 0);
        // @ts-ignore
        const data = JSON.parse(reply.element);
        const retVal: {
            uuid: string,
            ok: boolean,
            message?: string,
            data?: any
        } = {
            uuid: data.uuid,
            ok: true
        };
        if (
            data.id == 6
        ) {
            throw new Error('Borked');
        }
        if (data.id in db) {
            // @ts-ignore
            retVal.data = db[data.id];
        }
        else {
            retVal.ok = false;
            retVal.message = `No user id ${data.id} found.`;
        }
        console.log(`[worker-${workerName}]: ${JSON.stringify(retVal)}`);
        publisher.publish(data.returnTo, JSON.stringify(retVal));
    }
}

start();