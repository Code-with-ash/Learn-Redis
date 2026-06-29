// analytics_subscriber.js — Analytics Tracking Subscriber
//
// This subscriber listens for "order:created" events and
// handles analytics tracking (logging order data, metrics, etc.)
//
// Separate client = separate connection = can subscribe independently.

// Import the factory function to create our own dedicated client
import createRedisClient from "../redis.js";

// Create a brand new Redis client just for this subscriber
const subscriberClient = createRedisClient();

// Connect to Redis — must happen before we can subscribe
await subscriberClient.connect();

// Subscribe to the "order:created" channel
// This runs alongside the other subscribers — Redis "fans out" the message
// to ALL subscribers on the same channel
await subscriberClient.subscribe("order:created", (message) => {
    try {
        // Parse the JSON string back into a JS object
        const order = JSON.parse(message);

        // In production, this is where you'd:
        //   - Log to an analytics service (Mixpanel, Amplitude, etc.)
        //   - Update dashboards and metrics
        //   - Track conversion funnels
        console.log(`[Analytics] Order ${order.orderId} created. Tracking analytics for user ${order.userId}`);
    } catch (err) {
        // Catch errors so a bad message doesn't crash the subscriber
        console.error("[Analytics] Failed to process message:", err);
    }
});

// Log that this subscriber is ready and listening
console.log("[Analytics Subscriber] Listening for order:created events...");