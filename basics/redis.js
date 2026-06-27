import { createClient } from 'redis';

const client = createClient({
    username: 'default',
    password: 'NNtFzWSaiOmVMd37geHos4QAb09Non4R',
    socket: {
        host: 'end-pebble-efficient-77129.db.redis.io',
        port: 15644
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

await client.set('foo', 'bar');
const result = await client.get('foo');
console.log(result)  // >>> bar

export default client;

