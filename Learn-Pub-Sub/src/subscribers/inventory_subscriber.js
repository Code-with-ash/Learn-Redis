// inventory_subscriber.js — Inventory Management Subscriber
//
// This subscriber listens for "order:created" events and
// handles updating the inventory (reducing stock count, etc.)
//
// Like every subscriber, it gets its OWN Redis client.

// Import the factory function to create our own dedicated client
import createRedisClient from "../redis.js";

// Create a brand new Redis client just for this subscriber
const subscriberClient = createRedisClient();

// Connect to Redis — must happen before we can subscribe
await subscriberClient.connect();

// Subscribe to the "order:created" channel
// Every time a new order is published, this callback fires
await subscriberClient.subscribe("order:created", (message) => {
    try {
        // Parse the JSON string back into a JS object
        const order = JSON.parse(message);

        // In production, this is where you'd update your database:
        //   - Decrease stock count for order.itemId
        //   - Mark item as reserved
        //   - Trigger restock alerts if stock is low
        console.log(`[Inventory] Order ${order.orderId} created. Updating inventory for item ${order.itemId}`);
    } catch (err) {
        // Catch errors so a bad message doesn't crash the subscriber
        console.error("[Inventory] Failed to process message:", err);
    }
});

// Log that this subscriber is ready and listening
console.log("[Inventory Subscriber] Listening for order:created events...");