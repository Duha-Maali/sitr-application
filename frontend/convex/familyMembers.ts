// convex/users.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUser } from "./users";

export const createFM = mutation({
  args: {
    name: v.string(),
    gender: v.string(),
    hijabStatus: v.boolean(),
    images: v.array(v.string()),
    storageIds: v.array(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthUser(ctx);

    const imageUrls = await Promise.all(
      args.storageIds.map((storageId) => ctx.storage.getUrl(storageId))
    );
    if (imageUrls.includes(null))
      throw new Error("One or more images not found");

    const filteredImageUrls = imageUrls.filter(
      (url): url is string => url !== null
    );

    // create a FM in db
    const newFamilyMemberId = await ctx.db.insert("familyMembers", {
      name: args.name,
      gender: args.gender,
      hijabStatus: args.hijabStatus,
      userId: currentUser._id,
      images: filteredImageUrls,
      storageIds: args.storageIds,
      apiStatus: "queued", // Initial state
      lastUpdated: Date.now(),
    });

    return {
      familyMemberId: newFamilyMemberId,
      publicImageUrls: filteredImageUrls,
    };
  },
});

export const getFM = query({
  handler: async (ctx) => {
    const currentUser = await getAuthUser(ctx);
    // get all posts
    const FM = await ctx.db
      .query("familyMembers")
      .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
      .collect();
    if (FM.length === 0) return [];
    const familyMembers = await Promise.all(
      FM.map(async (FM) => {
        return FM;
      })
    );
    return familyMembers;
  },
});

export const deleteFM = mutation({
  args: {
    FmId: v.id("familyMembers"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthUser(ctx);

    const FM = await ctx.db.get(args.FmId);
    if (!FM) throw new Error("Family member not found");

    // Prevent deletion while processing
    if (FM.apiStatus === "processing") {
      throw new Error("Cannot delete during processing");
    }

    // verify ownership
    if (FM.userId !== currentUser._id) {
      throw new Error("Not authorized to delete this family member");
    }

    // delete the storage file
    for (const storageId of FM.storageIds) {
      await ctx.storage.delete(storageId);
    }

    // delete the family member
    await ctx.db.delete(args.FmId);
  },
});

export const updateFM = mutation({
  args: {
    FmId: v.id("familyMembers"),
    name: v.string(),
    gender: v.string(),
    hijabStatus: v.boolean(),
    images: v.array(v.string()),
    storageIds: v.array(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthUser(ctx);

    const FM = await ctx.db.get(args.FmId);
    if (!FM) throw new Error("Family member not found");

    // Verify ownership
    if (FM.userId !== currentUser._id) {
      throw new Error("Not authorized to update this family member");
    }

    // Validate storage IDs and get URLs
    const imageUrls = await Promise.all(
      args.storageIds.map((storageId) => ctx.storage.getUrl(storageId))
    );
    if (imageUrls.includes(null))
      throw new Error("One or more images not found");

    const filteredImageUrls = imageUrls.filter(
      (url): url is string => url !== null
    );

    // Update the family member
    await ctx.db.patch(args.FmId, {
      name: args.name,
      gender: args.gender,
      hijabStatus: args.hijabStatus,
      images: filteredImageUrls,
      storageIds: args.storageIds,
      lastUpdated: Date.now(),
      apiStatus: "queued",
    });

    return {
      publicImageUrls: filteredImageUrls,
    };
  },
});

export const deleteFMStorage = mutation({
  args: {
    storageIds: v.array(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    // Iterate over the storageIds and delete each one
    for (const storageId of args.storageIds) {
      await ctx.storage.delete(storageId);
    }
  },
});

export const updateApiStatus = mutation({
  args: {
    FmId: v.id("familyMembers"),
    apiStatus: v.union(
      v.literal("queued"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    apiTaskId: v.optional(v.string()),
    apiError: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthUser(ctx);

    const FM = await ctx.db.get(args.FmId);
    if (!FM) throw new Error("Family member not found");

    // Verify ownership
    if (FM.userId !== currentUser._id) {
      throw new Error("Not authorized to update this family member");
    }

    // Update the API status
    await ctx.db.patch(args.FmId, {
      apiStatus: args.apiStatus,
      apiTaskId: args.apiTaskId,
      apiError: args.apiError,
      lastUpdated: Date.now(),
    });
  },
});

