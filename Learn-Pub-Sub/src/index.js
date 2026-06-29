// index.js — Main Entry Point
//
// This is where everything starts. It:
//   1. Imports and starts all subscribers (so they listen for messages)
//   2. Sets up the Express API server
//   3. On POST /create-order, publishes an event via the publisher
//
// IMPORTANT: The subscribers MUST be imported here, otherwise they never 
// execute and nobody listens for published messages!

import express from "express";

// Import the publisher function (this also creates & connects the publisher's Redis client)
import publisher from "./publishers/order_created.js";

// BUG FIX: Import all subscribers!
// Even though we don't use a variable from these imports, the act of importing
// them causes their code to execute — which creates their Redis clients,
// connects them, and calls .subscribe() to start listening.
//
// Without these imports, the subscribers NEVER run, and published messages
// go into the void with zero listeners.
import "./subscribers/email_subscriber.js";
import "./subscribers/inventory_subscriber.js";
import "./subscribers/analytics_subscriber.js";

// Create the Express app
const app = express();

// express.json() is middleware that parses incoming JSON request bodies
// Without this, req.body would be undefined for JSON POST requests
app.use(express.json());

// POST /create-order — receives order data and publishes it to Redis
app.post("/create-order", async (req, res) => {
    // Destructure the required fields from the request body
    const { userId, itemId, email } = req.body;

    // Build the order object with the data + auto-generated fields
    const order = {
        userId,
        itemId,
        email,
        orderId: Date.now(),       // Unique-ish ID based on timestamp
        createdAt: new Date()      // When the order was created
    }

    // Publish the "order:created" event to Redis
    // The publisher will send this to ALL subscribers listening on "order:created"
    // 
    // We AWAIT this because publisher() is now async — if Redis is down,
    // the error is caught inside the publisher instead of crashing the server
    await publisher("order:created", order);

    // Respond to the HTTP client (e.g., the frontend or curl)
    res.json({ message: "Order created successfully" });
})

// Start the Express server on port 3000
app.listen(3000, () => {
    console.log("Server is running at 3000");
})