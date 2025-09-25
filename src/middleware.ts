import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Custom function to clean headers
function cleanHeaders(request: NextRequest): NextRequest {
  const headers = new Headers(request.headers);
  
  // Check and clean authorization header
  const authHeader = headers.get('authorization');
  if (authHeader && /[^\x00-\x7F]/.test(authHeader)) {
    console.warn('Cleaning non-ASCII characters from authorization header');
    // Remove non-ASCII characters from the header
    const cleanedAuth = authHeader.replace(/[^\x00-\x7F]/g, '');
    headers.set('authorization', cleanedAuth);
  }
  
  // Check and clean other common headers that might have issues
  const cookieHeader = headers.get('cookie');
  if (cookieHeader && /[^\x00-\x7F]/.test(cookieHeader)) {
    console.warn('Cleaning non-ASCII characters from cookie header');
    const cleanedCookie = cookieHeader.replace(/[^\x00-\x7F]/g, '');
    headers.set('cookie', cleanedCookie);
  }
  
  return new NextRequest(request.url, {
    method: request.method,
    headers: headers,
    body: request.body,
  });
}

const isPublicRoute = createRouteMatcher([
  "/",
  "/api/webhooks/clerk",
  "/blog",
  "/blog/(.*)",
  "/exams",
  "/exams/(.*)",
  "/sign-in",
  "/sign-up",
  "/api/blog/featured",
  "/api/blog/slug/(.*)",
  "/api/courses",
  "/api/course/(.*)",
  // Clerk OAuth callback routes - CRITICAL for external OAuth providers
  "/api/auth/callback/(.*)",
  "/sso-callback",
  "/api/auth/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Clean headers first
  const cleanedReq = cleanHeaders(req);
  
  // If it's not a public route, protect it
  if (!isPublicRoute(cleanedReq)) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }
  
  return NextResponse.next();
}, {
  authorizedParties: process.env.NODE_ENV === 'production'
    ? ['https://www.edmissions.site']
    : [
        'https://www.edmissions.site',
        'http://localhost:3000',
        'http://localhost:3001',
        'https://localhost:3000',
        'https://localhost:3001',
        process.env.NEXT_PUBLIC_CLERK_DOMAIN || 'http://localhost:3000'
      ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
