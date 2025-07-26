"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/components/ui/use-toast";

interface PaymentButtonProps {
  examId: string;
  examTitle: string;
  amount: number;
  isEnrolled: boolean;
  onEnrollmentSuccess: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentButton({
  examId,
  examTitle,
  amount,
  isEnrolled,
  onEnrollmentSuccess,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();

  const handleEnrollment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to enroll in this course.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Always enroll first (free enrollment with limited access)
      const response = await fetch("/api/enrollment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ examId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Enrollment Successful!",
          description: data.message || "You have been enrolled in the course.",
        });
        onEnrollmentSuccess();
      } else {
        throw new Error(data.error || "Enrollment failed");
      }
    } catch (error: any) {
      toast({
        title: "Enrollment Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to make a payment.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await initiatePayment();
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async () => {
    try {
      // Create order
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ examId }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || "Failed to create order");
      }

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Configure Razorpay options
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "PrepExam",
        description: `Enrollment for ${examTitle}`,
        order_id: orderData.orderId,
        prefill: {
          email: user?.emailAddresses[0]?.emailAddress || "",
          name: user?.fullName || "",
        },
        theme: {
          color: "#3B82F6",
        },
        handler: async (response: any) => {
          await verifyPayment(response);
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      throw new Error(error.message || "Payment initialization failed");
    }
  };

  const verifyPayment = async (paymentResponse: any) => {
    try {
      const response = await fetch("/api/payment/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          examId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Payment Successful!",
          description: "You have been enrolled in the course.",
        });
        onEnrollmentSuccess();
      } else {
        throw new Error(data.error || "Payment verification failed");
      }
    } catch (error: any) {
      toast({
        title: "Payment Verification Failed",
        description: error.message || "Please contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isEnrolled) {
    // If enrolled but course has paid content, show upgrade option
    if (amount > 0) {
      return (
        <div className="space-y-3">
          <button
            disabled
            className="w-full bg-green-600 text-white px-8 py-4 rounded-xl font-semibold cursor-not-allowed opacity-75"
          >
            ✓ Enrolled (Free Access)
          </button>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              `Unlock All Modules - ₹${amount}`
            )}
          </button>
        </div>
      );
    } else {
      return (
        <button
          disabled
          className="w-full bg-green-600 text-white px-8 py-4 rounded-xl font-semibold cursor-not-allowed opacity-75"
        >
          ✓ Enrolled
        </button>
      );
    }
  }

  return (
    <button
      onClick={handleEnrollment}
      disabled={loading}
      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Processing...
        </div>
      ) : amount === 0 ? (
        "Enroll for Free"
      ) : (
        `Start Learning (Free) - Upgrade for ₹${amount}`
      )}
    </button>
  );
}