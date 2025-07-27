import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Check for problematic headers and log them
    const authHeader = request.headers.get('authorization');
    if (authHeader && /[^\x00-\x7F]/.test(authHeader)) {
      console.warn('Non-ASCII characters detected in authorization header');
      console.warn('Header value:', authHeader.replace(/[^\x00-\x7F]/g, '?'));
    }

    let userId: string | null = null;

    let authResult = "authResult" as any; // Placeholder for auth result type
    
    try {
      authResult = await auth();
      userId = authResult.userId;
    } catch (authError) {
      console.error("Clerk auth error:", authError);
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }

    if (!userId) {
      console.log(
        "Auth failed: No userId returned from Clerk auth()",
        authResult
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        clerkId: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      console.log(`User not found in database for clerkId: ${userId}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    
    // Check if it's a header-related error
    if (error instanceof Error && error.message.includes('header')) {
      console.error("Header-related error detected:", error.message);
      return NextResponse.json(
        { error: "Authentication header error" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
