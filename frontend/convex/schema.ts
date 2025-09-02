import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// id & created_date created by default
export default defineSchema({
  users: defineTable({
    userName: v.string(),
    email: v.string(),
    image: v.string(),
    storageId: v.optional(v.id("_storage")), // will be needed when we want to delete/change user's photo
    clerkId: v.string(),
  }).index("by_clerk_id", ["clerkId"]),

  familyMembers: defineTable({
    userId: v.id("users"),
    name: v.string(),
    gender: v.string(),
    hijabStatus: v.boolean(),
    images: v.array(v.string()),
    storageIds: v.array(v.id("_storage")), // will be needed when we want to delete a member
    // API processing status tracking
    apiStatus: v.union(
      v.literal("queued"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    apiTaskId: v.optional(v.string()),
    apiError: v.optional(v.string()),
    lastUpdated: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["apiStatus"]),
});
