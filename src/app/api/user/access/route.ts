import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');
    const moduleId = searchParams.get('moduleId');

    if (!examId) {
      return NextResponse.json({ error: "Exam ID is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is enrolled in the exam
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_examId: {
          userId: user.id,
          examId: examId
        }
      }
    });

    // Check if user has purchased the exam
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: user.id,
        examId: examId,
        paymentStatus: "SUCCESS"
      }
    });

    const hasAccess = enrollment !== null;
    const hasPaid = purchase !== null;

    // If checking specific module access
    if (moduleId) {
      const module = await prisma.module.findUnique({
        where: { id: moduleId },
        include: { exam: true }
      });

      if (!module) {
        return NextResponse.json({ error: "Module not found" }, { status: 404 });
      }

      // Free modules are accessible to enrolled users
      if (module.isFree) {
        return NextResponse.json({
          hasAccess: hasAccess, // Need to be enrolled to access even free modules
          hasPaid: hasPaid,
          isEnrolled: hasAccess,
          isFreeModule: true
        });
      }

      // Paid modules require both enrollment AND payment
      return NextResponse.json({
        hasAccess: hasAccess && hasPaid, // Need both enrollment and payment
        hasPaid: hasPaid,
        isEnrolled: hasAccess,
        isFreeModule: false
      });
    }

    // General exam access - enrolled users can access free content
    // Full access requires payment for paid courses
    const exam = await prisma.exam.findUnique({
      where: { id: examId }
    });

    const fullAccess = exam?.priceInINR === 0 ? hasAccess : (hasAccess && hasPaid);

    return NextResponse.json({
      hasAccess: hasAccess, // Can access free modules if enrolled
      hasPaid: hasPaid,
      isEnrolled: hasAccess,
      hasFullAccess: fullAccess // Can access all modules
    });

  } catch (error) {
    console.error("Error checking user access:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}