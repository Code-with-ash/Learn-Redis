import prisma from "../src/db.js";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clean up existing data
  await prisma.post.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // Create users with profiles
  const alice = await prisma.user.create({
    data: {
      name: "Alice Johnson",
      email: "alice@example.com",
      profile: {
        create: {
          bio: "Full-stack developer who loves Redis",
          avatar: "https://i.pravatar.cc/150?u=alice",
        },
      },
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: "Bob Smith",
      email: "bob@example.com",
      profile: {
        create: {
          bio: "Backend engineer, caching enthusiast",
          avatar: "https://i.pravatar.cc/150?u=bob",
        },
      },
    },
  });

  const charlie = await prisma.user.create({
    data: {
      name: "Charlie Brown",
      email: "charlie@example.com",
      profile: {
        create: {
          bio: "DevOps engineer working with distributed systems",
          avatar: "https://i.pravatar.cc/150?u=charlie",
        },
      },
    },
  });

  // Create posts
  await prisma.post.createMany({
    data: [
      {
        title: "Getting Started with Redis",
        content: "Redis is an in-memory data structure store...",
        published: true,
        authorId: alice.id,
      },
      {
        title: "Cache-Aside Pattern",
        content: "The cache-aside pattern is the most common caching strategy...",
        published: true,
        authorId: alice.id,
      },
      {
        title: "Redis vs Memcached",
        content: "Both are in-memory stores but Redis supports more data types...",
        published: true,
        authorId: bob.id,
      },
      {
        title: "TTL Best Practices",
        content: "Setting the right TTL is crucial for cache performance...",
        published: false,
        authorId: bob.id,
      },
      {
        title: "Cache Invalidation Strategies",
        content: "There are only two hard things in CS: cache invalidation...",
        published: true,
        authorId: charlie.id,
      },
    ],
  });

  const counts = {
    users: await prisma.user.count(),
    profiles: await prisma.profile.count(),
    posts: await prisma.post.count(),
  };

  console.log("✅ Seed complete:", counts);
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
