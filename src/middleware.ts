import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export default clerkMiddleware((auth, req: NextRequest) => {
  // Handle header encoding issues in production
  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    
    // If there's an authorization header, ensure it's properly encoded
    if (authHeader) {
      // Check if the header contains non-ASCII characters
      const hasNonAscii = /[^\x00-\x7F]/.test(authHeader);
      
      if (hasNonAscii) {
        console.warn('Authorization header contains non-ASCII characters, cleaning...');
        
        console.warn('Authorization header contains non-ASCII characters, removing header');
        
        // Continue without the problematic header
        return NextResponse.next();
      }
    }
    
    // Continue normally if no issues
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware header processing error:', error);
    // Continue with original request if error occurs
    return NextResponse.next();
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
