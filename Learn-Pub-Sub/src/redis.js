// redis.js — Redis Client FACTORY
// 
// WHY A FACTORY? In Redis, when a client calls .subscribe(), it enters 
// "subscriber mode" and can ONLY run subscribe/unsubscribe commands.
// It CANNOT run .publish(), .get(), .set(), or anything else.
//
// So we need SEPARATE client instances:
//   - One for the publisher (to call .publish())
//   - One for each subscriber (to call .subscribe())
//
// A factory function creates a NEW client every time it's called.
// This is the opposite of a singleton (which shares one client everywhere).

import { createClient } from 'redis';

// This function returns a brand new Redis client each time you call it.
// Each client is its own independent connection to Redis.
function createRedisClient() {

    // createClient() makes a new Redis client with connection config
    const client = createClient({
        username: 'default',
        password: 'NNtFzWSaiOmVMd37geHos4QAb09Non4R',
        socket: {
            host: 'end-pebble-efficient-77129.db.redis.io',
            port: 15644
        }
    });

    // .on('error') registers an event listener — if Redis has a connection
    // issue, this logs it instead of crashing your app silently
    client.on('error', (err) => console.error('Redis Client Error:', err));

    // Return the client (NOT yet connected — caller must await .connect())
    return client;
}

// Export the factory function (not a client instance!)
// Every file that imports this will call createRedisClient() to get 
// its OWN separate client
export default createRedisClient;
