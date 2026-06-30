import { Router } from "express";
import prisma from "../db.js";
import client from "../../redis.js";

const router = Router();

// ─── GET all posts ───────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: { author: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// ─── GET single post by id ──────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    // Check Redis cache first
    const cached = await client.get(`post:${postId}`);
    if (cached) {
      console.log("Post Cache HIT");
      return res.json(JSON.parse(cached));
    }

    console.log("Post Cache MISS");

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Cache for 1 hour
    await client.setEx(`post:${postId}`, 60 * 60, JSON.stringify(post));

    return res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return res.status(500).json({ error: "Failed to fetch post" });
  }
});

// ─── CREATE post ─────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { title, content, published, authorId } = req.body;

    const post = await prisma.post.create({
      data: {
        title,
        content,
        published: published || false,
        authorId,
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    return res.status(201).json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ error: "Failed to create post" });
  }
});

// ─── UPDATE post ─────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { title, content, published } = req.body;

    const post = await prisma.post.update({
      where: { id: postId },
      data: { title, content, published },
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    return res.json(post);
  } catch (error) {
    console.error("Error updating post:", error);
    return res.status(500).json({ error: "Failed to update post" });
  }
});

// ─── DELETE post ─────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    await prisma.post.delete({
      where: { id: postId },
    });

    return res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).json({ error: "Failed to delete post" });
  }
});

export default router;
