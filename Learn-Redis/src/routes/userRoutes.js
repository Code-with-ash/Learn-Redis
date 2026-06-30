import { Router } from "express";
import prisma from "../db.js";
import client from "../../redis.js";
const router = Router();

// ─── GET all users ───────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { profile: true },
    });
    return res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ─── GET single user by id ──────────────────────────────────────
router.get("/:id", async (req, res) => {
  const start = Date.now();

  try {
    const userId = parseInt(req.params.id);

    const cached = await client.get(`user:${userId}`);

    if (cached) {
      console.log("Cache HIT");
      return res.json(JSON.parse(cached));
    }

    console.log("Cache MISS");

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        posts: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await client.setEx(
      `user:${userId}`,
      60 * 60 * 24,
      JSON.stringify(user)
    );

    return res.json(user);

  } finally {
    console.log(`GET_USER: ${Date.now() - start}ms`);
  }
});

// ─── CREATE user ─────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { name, email, bio, avatar } = req.body;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        profile: bio || avatar ? { create: { bio, avatar } } : undefined,
      },
      include: { profile: true },
    });

    return res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Email already exists" });
    }
    return res.status(500).json({ error: "Failed to create user" });
  }
});

// ─── UPDATE user ─────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { name, email, bio, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        profile: {
          upsert: {
            create: { bio, avatar },
            update: { bio, avatar },
          },
        },
      },
      include: { profile: true },
    });
    await client.del(`user:${userId}`);
    console.log(`User ${userId} deleted from cache`);
    await client.setEx(
      `user:${userId}`,
      60 * 60 * 24,
      JSON.stringify(user)
    );
    console.log(`User ${userId} updated in cache`);
    return res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ error: "Failed to update user" });
  }
});

// ─── DELETE user ─────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    await prisma.user.delete({
      where: { id: userId },
    });

    // Invalidate cache for deleted user
    await client.del(`user:${userId}`);
    console.log(`Cache invalidated for user:${userId}`);

    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
