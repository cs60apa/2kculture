import { QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";
import { convexToJson, jsonToConvex } from "convex/values";
import { ConvexError } from "convex/values";

// Configure auth for the Clerk issuer domain from your environment
const clerkIssuer = "https://lasting-vulture-86.clerk.accounts.dev";

export async function getUser(ctx: QueryCtx | MutationCtx | ActionCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Unauthenticated call");
  }

  // Verify the issuer
  if (identity.tokenIdentifier.startsWith(clerkIssuer) === false) {
    throw new ConvexError("Invalid token issuer");
  }

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
