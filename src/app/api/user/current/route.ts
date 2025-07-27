import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Log request headers for debugging (only in production issues)
    const authHeader = request.headers.get('authorization');
    if (authHeader && /[^\x00-\x7F]/.test(authHeader)) {
      console.warn('Non-ASCII characters detected in authorization header');
    }

    const { userId } = await auth();

    if (!userId) {
      console.log("Auth failed: No userId returned from Clerk auth()");
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
