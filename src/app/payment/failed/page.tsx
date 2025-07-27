"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PageLayout from "@/components/layout/PageLayout";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

function PaymentFailedPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const error = searchParams.get("error");
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    // Auto redirect after 15 seconds
    const timer = setTimeout(() => {
      router.push("/exams");
    }, 15000);

    return () => clearTimeout(timer);
  }, [router]);

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case "payment_failed":
        return "Your payment could not be processed. Please try again.";
      case "payment_cancelled":
        return "Payment was cancelled. You can try again when you're ready.";
      case "insufficient_funds":
        return "Insufficient funds in your account. Please check your balance and try again.";
      case "card_declined":
        return "Your card was declined. Please try with a different payment method.";
      case "network_error":
        return "Network error occurred. Please check your connection and try again.";
      default:
        return "Something went wrong with your payment. Please try again.";
    }
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Error Icon */}
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Payment Failed
            </h1>
            <p className="text-gray-600 mb-8">
              {getErrorMessage(error)}
            </p>

            {/* Error Details */}
            {orderId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left">
                <h3 className="font-semibold text-gray-900 mb-3">Transaction Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-mono text-gray-900">{orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-red-600 font-semibold">Failed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="text-gray-900">{new Date().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Troubleshooting Tips */}
            <div className="bg-blue-50 rounded-lg p-4 mb-8 text-left">
              <h3 className="font-semibold text-blue-900 mb-3">What you can try:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Check your internet connection</li>
                <li>• Verify your card details</li>
                <li>• Ensure sufficient balance</li>
                <li>• Try a different payment method</li>
                <li>• Contact your bank if the issue persists</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={() => router.back()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-5 w-5" />
                Try Again
              </button>
              
              <Link href="/exams" className="block">
                <button className="w-full bg-white text-gray-700 px-6 py-3 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2">
                  <ArrowLeft className="h-5 w-5" />
                  Back to Courses
                </button>
              </Link>
            </div>

            {/* Support Contact */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">
                Need help? Contact our support team
              </p>
              <a
                href="mailto:support@edmission.com"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                support@edmission.com
              </a>
            </div>

            {/* Auto Redirect Notice */}
            <p className="text-xs text-gray-500 mt-6">
              You will be automatically redirected to courses in 15 seconds.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default function PaymentFailedPage() {
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
      <PaymentFailedPageContent />
    </Suspense>
  );
}