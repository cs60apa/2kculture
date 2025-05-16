// import { authMiddleware } from "@clerk/nextjs";

// export default authMiddleware({
//   // Routes that can be accessed while signed out
//   publicRoutes: ["/", "/api/uploadthing", "/api/webhook"],
// });

// export const config = {
//   // Protects all routes, including api/trpc.
//   // See https://clerk.com/docs/references/nextjs/auth-middleware
//   // for more information about configuring your Middleware
//   matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
// };

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that should NOT be protected
const isPublicRoute = createRouteMatcher(["/", "/library", "/api/uploadthing", "/api/webhook"]);

export default clerkMiddleware(async (auth, req) => {
  // Only protect routes that are not in the public routes list
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
