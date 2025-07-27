"use client";

import { Lock, Star, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LockedModuleContentProps {
  moduleTitle: string;
  courseTitle: string;
  coursePrice: number;
  onUpgrade: () => void;
  loading?: boolean;
}

export default function LockedModuleContent({
  moduleTitle,
  courseTitle,
  coursePrice,
  onUpgrade,
  loading = false,
}: LockedModuleContentProps) {
  return (
    <Card className="shadow-xl border-0 overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50">
      <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100 border-b text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-200 mb-4">
          <Lock className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-xl text-gray-900">
          Premium Content Locked
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          "{moduleTitle}" is a Premium Module
        </h3>
        
        <p className="text-gray-600 mb-6">
          Unlock this module and all other premium content in "{courseTitle}" to continue your learning journey.
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
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6 mb-6">
          <div className="text-sm opacity-90 mb-1">Upgrade to Premium</div>
          <div className="text-3xl font-bold mb-2">₹{coursePrice}</div>
          <div className="text-sm opacity-90">One-time payment • Lifetime access</div>
        </div>

        {/* Upgrade Button */}
        <Button
          onClick={onUpgrade}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </div>
          ) : (
            `Upgrade Now - ₹${coursePrice}`
          )}
        </Button>

        <p className="text-xs text-gray-500 mt-4">
          Secure payment powered by Razorpay • UPI, Cards, and more
        </p>
      </CardContent>
    </Card>
  );
}