// order_created.js — Publisher Module
//
// This file is responsible for PUBLISHING messages to a Redis channel.
// It creates its OWN dedicated Redis client (separate from subscribers).

// Import the factory function — NOT a client, but a function that CREATES clients
import createRedisClient from "../redis.js";

// Call the factory to create a brand new Redis client just for publishing
const publisherClient = createRedisClient();

// .connect() establishes the actual TCP connection to the Redis server
// We await it at the top level so the client is ready before any publish call
await publisherClient.connect();

// The publisher function takes a channel name and a message object
// It's async because .publish() returns a Promise that we need to await
const publisher = async (channel, message) => {
    try {
        // .publish(channel, message) sends the message to ALL clients 
        // that are currently subscribed to this channel
        // 
        // JSON.stringify() converts the JS object to a string because
        // Redis can only send strings, not objects
        //
        // .publish() returns the NUMBER of subscribers that received the message
        const subscriberCount = await publisherClient.publish(channel, JSON.stringify(message));

        // Log how many subscribers got the message — helpful for debugging
        // If this shows 0, it means nobody is listening!
        console.log(`[Publisher] Published to "${channel}" — ${subscriberCount} subscriber(s) received it`);
    } catch (err) {
        // If Redis is down or the connection is lost, this catches the error
        // instead of letting it crash your entire server
        console.error(`[Publisher] Failed to publish to "${channel}":`, err);
    }
}

export default publisher;
