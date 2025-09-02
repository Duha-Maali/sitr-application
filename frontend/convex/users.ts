// convex/users.ts
import { v } from "convex/values";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  return await ctx.storage.generateUploadUrl();
});

// Defines required fields
export const createUser = mutation({
  args: {
    userName: v.string(),
    email: v.string(),
    image: v.string(),
    clerkId: v.string(),
  },
  // Check for Existing User
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
    // If found, exits without creating a duplicate
    if (existingUser) return;

    // create a user in db
    const newUser = await ctx.db.insert("users", {
      userName: args.userName,
      email: args.email,
      image: args.image,
      clerkId: args.clerkId,
    });
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    return user;
  },
});

export async function getAuthUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  const currentUser = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();
  if (!currentUser) throw new Error("User not found");

  return currentUser;
}

export const updateProfile = mutation({
  args: {
    userName: v.string(),
    image: v.string(),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthUser(ctx);

    if (!args.storageId) {
      await ctx.db.patch(currentUser._id, {
        userName: args.userName,
      });
    } else {
      const imageUrl = await ctx.storage.getUrl(args.storageId);
      if (!imageUrl) throw new Error("Image not found");

      // delete prev storage file
      const currentStorage = currentUser.storageId;
      currentStorage && (await ctx.storage.delete(currentStorage));

      await ctx.db.patch(currentUser._id, {
        userName: args.userName,
        image: imageUrl,
        storageId: args.storageId,
      });
    }
  },
});

export const currentUser = query({
  handler: async (ctx) => {
    return await getAuthUser(ctx);
  },
});
