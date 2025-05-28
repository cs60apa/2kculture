import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Function to promote a user to admin
export const promoteToAdmin = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // Get the existing user
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (!existingUser) {
      throw new Error("User not found");
    }

    // Update the user's role to admin
    await ctx.db.patch(existingUser._id, {
      role: "admin",
    });

    return await ctx.db.get(existingUser._id);
  },
});

// Function to get current user info
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .first();

    return {
      clerkUserId: identity.subject,
      ...user,
    };
  },
});
