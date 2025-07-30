import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { moduleId, question, solution, year, type, options, correct } = await req.json();
    
    console.log("PYQ API received data:", { moduleId, question, solution, year, type, options, correct });
    
    if (!moduleId || !question || !solution || !year) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const pyq = await prisma.pYQ.create({
      data: {
        moduleId,
        question,
        solution,
        year,
        type: type || "descriptive",
        options: options || [],
        correct: correct !== undefined ? correct : null,
      },
    });
    
    console.log("PYQ created successfully:", pyq);
    return NextResponse.json({ pyq });
  } catch (error) {
    console.error("PYQ API Error:", error);
    
    // Check if it's an authentication error
    if (error instanceof Error && error.message.includes("Not authorized")) {
      return NextResponse.json(
        { error: "Not authorized: Admin access required" },
        { status: 403 }
      );
    }
    
    // Check if it's a database error
    if (error instanceof Error && error.message.includes("Prisma")) {
      return NextResponse.json(
        { error: "Database error: " + error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Server error: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}
