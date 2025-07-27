"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PageLayout from "@/components/layout/PageLayout";
import { CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

function PaymentSuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  const paymentId = searchParams.get("payment_id");
  const orderId = searchParams.get("order_id");
  const courseSlug = searchParams.get("course");

  useEffect(() => {
    // Auto redirect after 10 seconds
    const timer = setTimeout(() => {
      if (courseSlug) {
        router.push(`/exams/${courseSlug}/study`);
      } else {
        router.push("/dashboard");
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [router, courseSlug]);

  useEffect(() => {
    if (paymentId && orderId) {
      // You could fetch payment details here if needed
      setPaymentDetails({
        paymentId,
        orderId,
        timestamp: new Date().toLocaleString(),
      });
    }
    setLoading(false);
  }, [paymentId, orderId]);

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Processing payment...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>

            {/* Success Message */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Payment Successful!
            </h1>
            <p className="text-gray-600 mb-8">
              Thank you for your purchase. You have been successfully enrolled in the course.
            </p>

            {/* Payment Details */}
            {paymentDetails && (
              <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left">
                <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="font-mono text-gray-900">{paymentDetails.paymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-mono text-gray-900">{paymentDetails.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date & Time:</span>
                    <span className="text-gray-900">{paymentDetails.timestamp}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              {courseSlug ? (
                <Link href={`/exams/${courseSlug}/study`} className="block">
                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 flex items-center justify-center gap-2">
                    Continue Learning
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </Link>
              ) : (
                <Link href="/dashboard" className="block">
                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 flex items-center justify-center gap-2">
                    Go to Dashboard
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </Link>
              )}
              
              <Link href="/exams" className="block">
                <button className="w-full bg-white text-gray-700 px-6 py-3 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200">
                  Browse More Courses
                </button>
              </Link>
            </div>

            {/* Auto Redirect Notice */}
            <p className="text-xs text-gray-500 mt-6">
              You will be automatically redirected to {courseSlug ? 'your course' : 'your dashboard'} in 10 seconds.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </PageLayout>
    }>
      <PaymentSuccessPageContent />
    </Suspense>
  );
}