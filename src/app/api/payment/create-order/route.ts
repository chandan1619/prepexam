import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import Razorpay from "razorpay";

const prisma = new PrismaClient();

// Initialize Razorpay only if credentials are available
let razorpay: Razorpay | null = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

export async function POST(request: NextRequest) {
  try {
    // Check if Razorpay is configured
    if (!razorpay) {
      return NextResponse.json({
        error: "Payment gateway not configured. Please contact support."
      }, { status: 503 });
    }

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

    // Check if there's already a pending payment
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: user.id,
        examId: examId,
        paymentStatus: "PENDING"
      }
    });

    if (existingPurchase) {
      return NextResponse.json({ 
        orderId: existingPurchase.orderId,
        amount: existingPurchase.amount,
        currency: "INR"
      });
    }

    // Create Razorpay order
    const options = {
      amount: exam.priceInINR * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        examId: examId,
        userId: user.id,
        examTitle: exam.title
      }
    };

    const order = await razorpay.orders.create(options);

    // Create purchase record
    const purchase = await prisma.purchase.create({
      data: {
        userId: user.id,
        examId: examId,
        amount: exam.priceInINR,
        orderId: order.id,
        paymentStatus: "PENDING"
      }
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      examTitle: exam.title,
      userEmail: user.email
    });

  } catch (error) {
    console.error("Error creating payment order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}