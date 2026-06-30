# Learn Pub-Sub with Redis

A hands-on project to learn the **Publish/Subscribe** messaging pattern using **Redis** and **Node.js**.

## 🏗️ Architecture

```
Client (POST /create-order)
        │
        ▼
   Express Server
        │
        ▼
   Redis Publisher ──── "order:created" channel
        │
        ├── 📧 Email Subscriber
        ├── 📦 Inventory Subscriber
        └── 📊 Analytics Subscriber
```

## 🚀 How It Works

1. A client sends a `POST /create-order` request with order data
2. The server publishes an `order:created` event to Redis
3. Three independent subscribers listen for the event and handle it:
   - **Email Subscriber** — sends order confirmation
   - **Inventory Subscriber** — updates stock levels
   - **Analytics Subscriber** — logs order metrics

## 📦 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Message Broker:** Redis (Pub/Sub)

## 🛠️ Getting Started

```bash
# Install dependencies
npm install

# Start the server (subscribers auto-register on import)
node src/index.js

# Test with curl
curl -X POST http://localhost:3000/create-order \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "itemId": 42, "email": "test@example.com"}'
```

## 📚 Key Takeaway

Subscribers are imported in `index.js` — even without using a variable, the import triggers their code to execute, creating Redis clients and subscribing to channels.
