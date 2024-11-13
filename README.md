# Redis and ZMQ message queues demo
This demo has a Nest.js server which communicates with workers using either Redis or ZMQ. Workers have a "database" with 2 records. Redis (or ZMQ) balances load between 2 workers.
You need _docker_ and _docker compose_ installed for this demo. 

```docker compose up``` to run the demo.

Redis is the default message broker in this demo. To switch to ZMQ uncomment
the ```MESSAGE_BROKER_PROVIDER: "ZMQ_MESSAGE_BROKER"``` line in the _docker-compose.yml_ file

## Demo flow

1. Start the docker compose
2. In browser go to ```http://localhost:3000/user/1``` (or ```/user/2```) to get user data
3. See in docker window that each time a different worker is answering
3. Request ```/user/6``` to crash a worker
4. Request ```/user/1``` to see that a healthy worker is still answering
5. Uncomment ```restart: on-failure``` in _docker-compose.yml_
6. Restart dockers
7. See that now every time you crash a worker it is immediately restarted.

## The point of the demo
If a worker was an another web server and was not load balanced then when it would crash there would be no one to handle 
the traffic while an orchestrator was restarting it. If there are multiple instance of the worker which are load balanced 
and if one of them crashes then others still can handle the healthy traffic while the crashed one is being restarted.
 
