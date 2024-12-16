import {createClient} from "redis";
import {env} from "process";

const redisUrl = env.REDIS_URL || "redis://localhost:6379";
const workerName = env.HOSTNAME || "worker1";

// a simulated mongo database with multiple nodes which does a lot of joins
const db = {
    1 : {
        username: "User1",
    },
    2 : {
        username: "User2",
    }
};

async function start() {
    // a publisher which will publish responses to queries
    const publisher = createClient({
        url: redisUrl
    });
    publisher.on('error', (err) => console.error('Redis Pub Client Error', err));
    await publisher.connect();
    // a queue (list) listener which will wait for an item to be added to the list
    const queueClient = createClient({
        url: redisUrl
    });
    queueClient.on('error', (err) => console.error('Redis List Client Error', err));
    await queueClient.connect();

    while (true) {
        const reply = await queueClient.blPop(['users_data'], 0) as {key: string, element: string};
        // the server sends the id of a user, a uuid of the message,
        // and the returnTo field which is a channel name to which the reply should be published
        const data: {
            id: number
            returnTo: string
            uuid: string
        } = JSON.parse(reply.element);
        // the uuid is used to match the reply to the request
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
        await publisher.publish(data.returnTo, JSON.stringify(retVal));
    }
}

start();
