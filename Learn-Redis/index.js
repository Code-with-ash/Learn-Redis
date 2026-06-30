import express from "express";
import dotenv from "dotenv";
import userRoutes from "./src/routes/userRoutes.js";
import postRoutes from "./src/routes/postRoutes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ──────────────────────────────────────────────────
app.use(express.json());

// ─── Routes ─────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "Redis Practice API",
    status: "healthy",
    version: "1.0.0",
    endpoints: {
      users: "/api/users",
      posts: "/api/posts",
    },
  });
});

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// ─── Start server ───────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});