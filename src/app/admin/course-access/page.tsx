"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, XCircle, MessageCircle, Users, CreditCard } from "lucide-react";

// Your WhatsApp number for reference
const WHATSAPP_NUMBER = "918789449507";

interface Course {
  id: string;
  title: string;
  slug: string;
  priceInINR: number;
}

interface UserAccess {
  id: string;
  clerkId: string;
  email: string;
  role: string;
  isEnrolled: boolean;
  hasPaid: boolean;
  enrollmentDate: string | null;
  purchaseDate: string | null;
  paymentMethod: string | null;
  amount: number | null;
}

export default function CourseAccessManagement() {
  const { user } = useUser();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [users, setUsers] = useState<UserAccess[]>([]);
  const [loading, setLoading] = useState(false);
  const [enableLoading, setEnableLoading] = useState<string | null>(null);
  
  // Form state for enabling access
  const [targetUserId, setTargetUserId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchUsers();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      console.log("Fetching courses from /api/admin/courses...");
      const response = await fetch("/api/admin/courses");
      const data = await response.json();
      console.log("Courses API response:", { status: response.status, data });
      
      if (response.ok) {
        // The API returns courses directly, not wrapped in a courses property
        const coursesArray = Array.isArray(data) ? data : [];
        console.log("Setting courses:", coursesArray);
        setCourses(coursesArray);
        
        if (coursesArray.length === 0) {
          toast({
            title: "No Courses Found",
            description: "No courses are available. Please create some courses first.",
          });
        }
      } else {
        console.error("Failed to fetch courses:", data.error);
        toast({
          title: "Error",
          description: data.error || "Failed to fetch courses",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch courses. Please check your connection.",
        variant: "destructive",
      });
    }
  };

  const fetchUsers = async () => {
    if (!selectedCourse) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/enable-course-access?examId=${selectedCourse}`);
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users || []);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch users",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const enableCourseAccess = async (userClerkId: string, customAmount?: number) => {
    if (!selectedCourse) return;
    
    setEnableLoading(userClerkId);
    try {
      const selectedCourseData = courses.find(c => c.id === selectedCourse);
      const amount = customAmount || selectedCourseData?.priceInINR || 0;
      
      const response = await fetch("/api/admin/enable-course-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetUserId: userClerkId,
          examId: selectedCourse,
          paymentMethod: "WhatsApp",
          amount: amount,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Success",
          description: data.message,
        });
        fetchUsers(); // Refresh the users list
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to enable course access",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enable course access",
        variant: "destructive",
      });
    } finally {
      setEnableLoading(null);
    }
  };

  const handleManualEnable = async () => {
    if (!targetUserId || !selectedCourse) {
      toast({
        title: "Error",
        description: "Please enter a user ID and select a course",
        variant: "destructive",
      });
      return;
    }

    const amount = paymentAmount ? parseInt(paymentAmount) : undefined;
    await enableCourseAccess(targetUserId, amount);
    
    // Clear form
    setTargetUserId("");
    setPaymentAmount("");
  };

  if (!user) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Please sign in to access admin panel
            </h2>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Course Access Management
            </h1>
            <p className="text-gray-600">
              Manage user access to courses after WhatsApp payments
            </p>
          </div>

          {/* Course Selection */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Select Course
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="course-select">Course</Label>
                  <select
                    id="course-select"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a course...</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title} - ₹{course.priceInINR}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manual Access Enable */}
          {selectedCourse && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Enable Access Manually
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="user-id">User Clerk ID</Label>
                    <Input
                      id="user-id"
                      value={targetUserId}
                      onChange={(e) => setTargetUserId(e.target.value)}
                      placeholder="user_xxxxxxxxxx"
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount (optional)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Leave empty for course price"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleManualEnable}
                      disabled={enableLoading === targetUserId}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {enableLoading === targetUserId ? "Enabling..." : "Enable Access"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Users List */}
          {selectedCourse && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Course Users ({users.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading users...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No users found for this course
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Payment
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {user.email}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.clerkId}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {user.isEnrolled ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span className="text-sm">
                                  {user.isEnrolled ? "Enrolled" : "Not Enrolled"}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                {user.hasPaid ? (
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                      <span className="text-sm font-medium text-green-600">
                                        Paid ₹{user.amount}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      via {user.paymentMethod}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-red-500" />
                                    <span className="text-sm text-red-600">Not Paid</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {!user.hasPaid && (
                                <Button
                                  onClick={() => enableCourseAccess(user.clerkId)}
                                  disabled={enableLoading === user.clerkId}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {enableLoading === user.clerkId ? "Enabling..." : "Enable Access"}
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
}