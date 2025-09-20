import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

// Enable full course access for a specific user
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the current user is an admin
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { targetUserId, examId, paymentMethod = "WhatsApp", amount } = await request.json();

    if (!targetUserId || !examId) {
      return NextResponse.json({ 
        error: "Target user ID and exam ID are required" 
      }, { status: 400 });
    }

    // Find the target user
    const targetUser = await prisma.user.findUnique({
      where: { clerkId: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    // Check if exam exists
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Check if user is already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_examId: {
          userId: targetUser.id,
          examId: examId
        }
      }
    });

    // If not enrolled, create enrollment first
    if (!existingEnrollment) {
      await prisma.enrollment.create({
        data: {
          userId: targetUser.id,
          examId: examId
        }
      });
    }

    // Check if purchase already exists
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: targetUser.id,
        examId: examId,
        paymentStatus: "SUCCESS"
      }
    });

    if (existingPurchase) {
      return NextResponse.json({ 
        message: "User already has full access to this course",
        purchase: existingPurchase
      });
    }

    // Create a successful purchase record
    const purchase = await prisma.purchase.create({
      data: {
        userId: targetUser.id,
        examId: examId,
        amount: amount || exam.priceInINR,
        paymentStatus: "SUCCESS",
        paymentMethod: paymentMethod,
        paymentId: `whatsapp_${Date.now()}`, // Generate a unique payment ID
        orderId: `order_whatsapp_${Date.now()}`, // Generate a unique order ID
      },
      include: {
        user: {
          select: {
            email: true,
            clerkId: true
          }
        },
        exam: {
          select: {
            title: true,
            slug: true
          }
        }
      }
    });

    return NextResponse.json({
      message: "Full course access enabled successfully",
      purchase: purchase
    });

  } catch (error) {
    console.error("Error enabling course access:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get all users with their course access status
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the current user is an admin
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');

    if (!examId) {
      return NextResponse.json({ error: "Exam ID is required" }, { status: 400 });
    }

    // Get all users with their enrollment and purchase status for this exam
    const users = await prisma.user.findMany({
      include: {
        enrollments: {
          where: { examId: examId },
          include: {
            exam: {
              select: {
                title: true,
                slug: true,
                priceInINR: true
              }
            }
          }
        },
        purchases: {
          where: { 
            examId: examId,
            paymentStatus: "SUCCESS"
          }
        }
      }
    });

    const usersWithAccess = users.map(user => ({
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      role: user.role,
      isEnrolled: user.enrollments.length > 0,
      hasPaid: user.purchases.length > 0,
      enrollmentDate: user.enrollments[0]?.createdAt || null,
      purchaseDate: user.purchases[0]?.createdAt || null,
      paymentMethod: user.purchases[0]?.paymentMethod || null,
      amount: user.purchases[0]?.amount || null
    }));

    return NextResponse.json({
      users: usersWithAccess,
      totalUsers: usersWithAccess.length,
      enrolledUsers: usersWithAccess.filter(u => u.isEnrolled).length,
      paidUsers: usersWithAccess.filter(u => u.hasPaid).length
    });

  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}