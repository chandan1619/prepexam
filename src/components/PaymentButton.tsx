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

    // If already enrolled, don't try to enroll again
    if (isEnrolled) {
      toast({
        title: "Already Enrolled",
        description: "You are already enrolled in this course.",
      });
      return;
    }

    setLoading(true);

    try {
      // Enroll user (free enrollment with limited access)
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
        // Handle the "Already enrolled" error gracefully
        if (data.error === "Already enrolled") {
          toast({
            title: "Already Enrolled",
            description: "You are already enrolled in this course.",
          });
          onEnrollmentSuccess(); // Still call success to refresh the UI
        } else {
          throw new Error(data.error || "Enrollment failed");
        }
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

    // WhatsApp redirect for payment
    const message = encodeURIComponent(
      `Hi! I want to purchase the full course: "${examTitle}". Please help me with the payment process. Course Price: ₹${amount}. My email: ${user?.emailAddresses[0]?.emailAddress || 'Not provided'}`
    );
    
    const whatsappUrl = `https://wa.me/918789449507?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Redirected to WhatsApp",
      description: "Please complete the payment process via WhatsApp. You'll receive access once payment is confirmed.",
    });
  };

  // These functions are no longer needed for WhatsApp payment flow
  // Keeping them for backward compatibility but they won't be used
  const initiatePayment = async () => {
    console.log("WhatsApp payment flow - Razorpay not needed");
  };

  const verifyPayment = async (paymentResponse: any) => {
    console.log("WhatsApp payment flow - verification handled manually");
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
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.087z"/>
                </svg>
                Contact on WhatsApp - ₹{amount}
              </div>
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
        <div className="flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.087z"/>
          </svg>
          Start Learning (Free) - Contact for Premium ₹{amount}
        </div>
      )}
    </button>
  );
}