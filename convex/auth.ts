// Helper functions for authentication and authorization
import { QueryCtx } from "./_generated/server";
import { DataModel } from "./_generated/dataModel";

export const verifyAdmin = async (ctx: QueryCtx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const user = await ctx.db
    .query("users")
    .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
    .first();

  if (!user || user.role !== "admin") {
    return null;
  }

  return user;
};
