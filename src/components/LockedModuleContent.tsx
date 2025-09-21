"use client";

import { MessageCircle, Star, CheckCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LockedModuleContentProps {
  moduleTitle: string;
  courseTitle: string;
  coursePrice: number;
  whatsappNumber?: string;
  loading?: boolean;
}

export default function LockedModuleContent({
  moduleTitle,
  courseTitle,
  coursePrice,
  whatsappNumber = "918789449507", // Your WhatsApp number
  loading = false,
}: LockedModuleContentProps) {
  
  const handleWhatsAppRedirect = () => {
    const message = encodeURIComponent(
      `Hi! I want to purchase the full course: "${courseTitle}". I'm currently trying to access the module "${moduleTitle}" which is locked. Please help me with the payment process. Course Price: ₹499 (50% OFF from ₹999)`
    );
    
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };
  return (
    <Card className="shadow-xl border-0 overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50">
      <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100 border-b text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-200 mb-4">
          <MessageCircle className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-xl text-gray-900">
          Premium Content - WhatsApp Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          &quot;{moduleTitle}&quot; is a Premium Module
        </h3>
        
        <p className="text-gray-600 mb-6">
          To unlock this module and all other premium content in &quot;{courseTitle}&quot;, please contact us on WhatsApp for payment processing.
        </p>

        {/* Premium Features */}
        <div className="bg-white rounded-lg p-6 mb-6 text-left">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            What you'll get with Premium:
          </h4>
          <ul className="space-y-3">
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
          </ul>
        </div>

        {/* Pricing */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg p-6 mb-6">
          <div className="text-sm opacity-90 mb-1">Upgrade to Premium</div>
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-lg opacity-75 line-through">₹999</span>
            <div className="text-3xl font-bold">₹499</div>
            <div className="bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
              50% OFF
            </div>
          </div>
          <div className="text-sm opacity-90">One-time payment • Lifetime access</div>
        </div>

        {/* WhatsApp Button */}
        <Button
          onClick={handleWhatsAppRedirect}
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Contact on WhatsApp - ₹499 (50% OFF)
            </div>
          )}
        </Button>

        <p className="text-xs text-gray-500 mt-4">
          Secure payment via WhatsApp • UPI, Bank Transfer, and more
        </p>
      </CardContent>
    </Card>
  );
}