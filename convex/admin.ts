import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { verifyAdmin } from "./auth";
import { api } from "./_generated/api";

// Function to promote a user to admin
export const promoteToAdmin = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
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

    // Schedule action to update Clerk metadata
    await ctx.scheduler.runAfter(0, api.admin.updateClerkRole, {
      userId: args.userId
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

// Action to update Clerk role
export const updateClerkRole = action({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Build URL for Clerk API
    const url = `https://api.clerk.com/v1/users/${args.userId}/metadata`;
    
    // Make request to Clerk API
    const response = await fetch(url, {
      method: "PATCH", 
      headers: {
        "Authorization": `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        publicMetadata: {
          role: "admin"
        }
      })
    });

    if (!response.ok) {
      throw new Error("Failed to update Clerk metadata");
    }

    return true;
  }
});
