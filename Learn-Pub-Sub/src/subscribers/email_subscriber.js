// email_subscriber.js — Email Notification Subscriber
//
// This subscriber listens for "order:created" events and 
// handles sending email notifications.
//
// It has its OWN Redis client (separate from the publisher and other subscribers)
// because a client in subscriber mode can ONLY subscribe/unsubscribe.

// Import the factory function to create our own dedicated client
import createRedisClient from "../redis.js";

// Create a brand new Redis client just for this subscriber
const subscriberClient = createRedisClient();

// Connect to Redis — must happen before we can subscribe
await subscriberClient.connect();

// .subscribe(channel, callback) does two things:
//   1. Tells Redis "I want to receive messages on this channel"
//   2. Registers a callback that runs every time a message arrives
//
// The callback receives the message as a STRING (because Redis only sends strings)
await subscriberClient.subscribe("order:created", (message) => {
    try {
        // JSON.parse() converts the string back into a JS object
        // (the publisher used JSON.stringify() to send it)
        const order = JSON.parse(message);

        // In production, this is where you'd call an email API
        // (like SendGrid, AWS SES, etc.) to actually send the email
        console.log(`[Email] Sending email to ${order.email} for order ${order.orderId}`);
    } catch (err) {
        // If the message is malformed JSON or processing fails,
        // catch it so this subscriber doesn't crash
        console.error("[Email] Failed to process message:", err);
    }
});

// Log that this subscriber is ready and listening
console.log("[Email Subscriber] Listening for order:created events...");
