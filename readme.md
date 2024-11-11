# Redis and ZMQ message queues demo
This demo has a Nest.js server which communicates with workers using either Redis or ZMQ. Workers have a "database" with 2 records. Redis (or ZMQ) balances load between 2 workers.
You need _docker_ and _docker compose_ installed for this demo. 

```docker compose up``` to run the demo.

Redis is the default message broker in this demo. To switch to ZMQ uncomment
the ```MESSAGE_BROKER_PROVIDER: "ZMQ_MESSAGE_BROKER"``` line in the _docker-compose.yml_ file
