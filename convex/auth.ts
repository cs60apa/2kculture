import { QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";
import { ConvexError } from "convex/values";

export async function getUser(ctx: QueryCtx | MutationCtx | ActionCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Unauthenticated call");
  }

  // We don't need to verify the issuer anymore as Clerk handles this
  // through the ConvexProviderWithClerk configuration
  return identity;
}

export const verifyAdmin = async (ctx: QueryCtx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const user = await ctx.db
    .query("users")
    .filter((q) => q.eq(q.field("userId"), identity.subject))
    .first();

  if (!user || user.role !== "admin") {
    return null;
  }

  return user;
};
