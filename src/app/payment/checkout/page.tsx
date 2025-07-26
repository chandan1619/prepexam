"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star, ArrowLeft, CreditCard, Smartphone } from "lucide-react";
import Link from "next/link";

// Add global Razorpay type
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const examId = searchParams.get("examId");
  const courseSlug = searchParams.get("courseSlug");

  useEffect(() => {
    async function fetchCourse() {
      if (!examId) return;
      
      try {
        const res = await fetch(`/api/course/${examId}`);
        const data = await res.json();
        if (res.ok && data.course) {
          setCourse(data.course);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      }
      setPageLoading(false);
    }
    
    fetchCourse();
  }, [examId]);

  const handlePayment = async () => {
    if (!user || !course) return;

    setLoading(true);
    try {
      // Create payment order
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ examId: course.id }),
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
        description: `Upgrade to Premium - ${course.title}`,
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
      console.error("Payment error:", error);
      setLoading(false);
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
          examId: course.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to success page
        window.location.href = `/payment/success?payment_id=${paymentResponse.razorpay_payment_id}&order_id=${paymentResponse.razorpay_order_id}&course=${courseSlug}`;
      } else {
        throw new Error(data.error || "Payment verification failed");
      }
    } catch (error: any) {
      console.error("Payment verification error:", error);
      // Redirect to failure page
      window.location.href = `/payment/failed?error=payment_failed&order_id=${paymentResponse.razorpay_order_id}`;
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading checkout...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!course || !user) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Course not found
            </h2>
            <Link href="/exams">
              <Button>Browse Courses</Button>
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-8">
            <Link 
              href={`/exams/${courseSlug || course.slug || course.id}`}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Course
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Course Information */}
            <div>
              <Card className="shadow-xl border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <CardTitle className="text-2xl">Upgrade to Premium</CardTitle>
                  <p className="text-blue-100">Unlock all course content and features</p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-gray-600">{course.description}</p>
                  </div>

                  {/* Course Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">{course.modules?.length || 0}</div>
                      <div className="text-sm text-gray-600">Modules</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-600">∞</div>
                      <div className="text-sm text-gray-600">Lifetime Access</div>
                    </div>
                  </div>

                  {/* Premium Features */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Premium Features:
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">Access to all premium modules</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">Advanced practice questions</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">Detailed solutions and explanations</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">Progress tracking and analytics</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">Priority support</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">Lifetime access to updates</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Section */}
            <div>
              <Card className="shadow-xl border-0 overflow-hidden">
                <CardHeader className="bg-white border-b">
                  <CardTitle className="text-xl text-gray-900">Complete Your Purchase</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Pricing */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6 mb-6">
                    <div className="text-center">
                      <div className="text-sm opacity-90 mb-1">Total Amount</div>
                      <div className="text-4xl font-bold mb-2">₹{course.priceInINR}</div>
                      <div className="text-sm opacity-90">One-time payment • No recurring charges</div>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Accepted Payment Methods:</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 p-3 border rounded-lg">
                        <Smartphone className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium">UPI</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 border rounded-lg">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium">Cards</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 border rounded-lg">
                        <span className="text-sm font-medium">Net Banking</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 border rounded-lg">
                        <span className="text-sm font-medium">Wallets</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Button */}
                  <Button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : (
                      `Pay ₹${course.priceInINR} Now`
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 mt-4 text-center">
                    Secure payment powered by Razorpay • Your data is protected
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}