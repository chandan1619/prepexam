import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

// Get user enrollments
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        exam: {
          include: {
            modules: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });

    return NextResponse.json(enrollments);
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create enrollment (free enrollment)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { examId } = await request.json();

    if (!examId) {
      return NextResponse.json({ error: "Exam ID is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if exam exists and is published
    const exam = await prisma.exam.findFirst({
      where: { 
        id: examId,
        isPublished: true 
      }
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found or not published" }, { status: 404 });
    }

    // Check if user is already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_examId: {
          userId: user.id,
          examId: examId
        }
      }
    });

    if (existingEnrollment) {
      return NextResponse.json({ error: "Already enrolled" }, { status: 400 });
    }

    // Always allow free enrollment - users can access free modules
    // For paid courses, they'll need to pay to unlock premium modules
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        examId: examId
      },
      include: {
        exam: {
          include: {
            modules: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });

    return NextResponse.json({
      ...enrollment,
      message: exam.priceInINR > 0
        ? "Enrolled successfully! Some modules require payment to unlock."
        : "Enrolled successfully! All modules are free."
    });

  } catch (error) {
    console.error("Error creating enrollment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}