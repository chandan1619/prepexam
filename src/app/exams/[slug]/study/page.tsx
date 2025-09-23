"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Lock, AlertCircle } from "lucide-react";
import Link from "next/link";
import LockedModuleContent from "@/components/LockedModuleContent";
import QuizTimer from "@/components/QuizTimer";

// Add global Razorpay type
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function StudyPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { user } = useUser();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentModuleIdx, setCurrentModuleIdx] = useState(0);
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  // For MCQ: number | null, for quiz: string | null
  const [selectedOption, setSelectedOption] = useState<number | string | null>(
    null
  );
  const [quizQuestionIdx, setQuizQuestionIdx] = useState(0);
  const [userAccess, setUserAccess] = useState<any>(null);
  const [accessLoading, setAccessLoading] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);

  useEffect(() => {
    async function fetchCourseAndAccess() {
      if (!slug || !user) return;
      
      setLoading(true);
      setAccessLoading(true);
      setError("");
      
      try {
        // Fetch course first
        const courseRes = await fetch(`/api/course/${slug}`);
        const courseData = await courseRes.json();
        
        if (!courseRes.ok || !courseData.course) {
          setError(courseData.error || "Course not found");
          setLoading(false);
          setAccessLoading(false);
          return;
        }
        
        setCourse(courseData.course);
        
        // Then immediately check access
        try {
          const accessRes = await fetch(`/api/user/access?examId=${courseData.course.id}`);
          const accessData = await accessRes.json();
          if (accessRes.ok) {
            setUserAccess(accessData);
          }
        } catch (err) {
          console.error("Failed to check user access:", err);
        }
        
      } catch {
        setError("Failed to load course");
      }
      
      setLoading(false);
      setAccessLoading(false);
    }
    
    fetchCourseAndAccess();
  }, [slug, user]);

  // Ensure user starts with an accessible module
  useEffect(() => {
    if (!course || !course.modules) return;
    
    // Only run this logic after access check is complete
    if (accessLoading || userAccess === null) return;
    
    const modules = course.modules;
    const hasModuleAccessForInit = (moduleIndex: number) => {
      if (!course || !course.modules[moduleIndex]) return false;
      
      const moduleData = course.modules[moduleIndex];
      
      // User must be enrolled to access any module
      if (!userAccess?.isEnrolled) return false;
      
      // Free modules are accessible to enrolled users
      if (moduleData.isFree) return true;
      
      // For paid modules, user needs both enrollment AND payment
      return userAccess?.hasPaid || false;
    };

    if (modules.length > 0 && !hasModuleAccessForInit(currentModuleIdx)) {
      // Find the first accessible module
      const firstAccessibleModule = modules.findIndex((_: any, idx: number) => hasModuleAccessForInit(idx));
      if (firstAccessibleModule !== -1) {
        setCurrentModuleIdx(firstAccessibleModule);
        setCurrentLessonIdx(0);
      }
    }
  }, [userAccess, course, currentModuleIdx, accessLoading]);

  // Check if user has access to current module
  const hasModuleAccess = (moduleIndex: number) => {
    if (!course || !course.modules[moduleIndex]) return false;
    
    const moduleData = course.modules[moduleIndex];
    
    // If access is still loading, optimistically show free modules as accessible
    if (accessLoading || userAccess === null) {
      return moduleData.isFree;
    }
    
    // User must be enrolled to access any module
    if (!userAccess?.isEnrolled) return false;
    
    // Free modules are accessible to enrolled users
    if (moduleData.isFree) return true;
    
    // For paid modules, user needs both enrollment AND payment
    return userAccess?.hasPaid || false;
  };

  // WhatsApp payment flow - no longer needed since we're using WhatsApp redirect
  // This function is kept for backward compatibility but not used
  const handleUpgrade = async () => {
    // This is now handled by the WhatsApp redirect in LockedModuleContent
    console.log("WhatsApp payment flow - redirecting to WhatsApp");
  };


  console.log(course);

  // Helper: Get all lessons in a module (blogPosts, moduleQuestions, quizzes, pyqs)
  type LessonType =
    | { type: "blogPost"; id: string; title: string; content: string }
    | { type: "question"; id: string; question: string; options?: string[]; correct?: number }
    | { type: "quiz"; id: string; title: string; questions: Array<{ id: string; question: string; options?: string[]; correct?: number }>; passingMark?: number; timeLimit?: number; quizType?: string }
    | { type: "pyq"; id: string; question: string; solution?: string; year?: number; pyqType?: string; options?: string[]; correct?: number };

  function getLessons(module: {
    blogPosts?: Array<{ id: string; title: string; content: string; order?: number }>;
    moduleQuestions?: Array<{ id: string; question: string; options?: string[]; correct?: number; type?: string; order?: number }>;
    quizzes?: Array<{
      id: string;
      title: string;
      questions: Array<{ id: string; question: string; options?: string[]; correct?: number }>;
      passingMark?: number;
      timeLimit?: number;
      type?: string;
      order?: number;
    }>;
    pyqs?: Array<{ id: string; question: string; solution?: string; year?: number; order?: number; type?: string; options?: string[]; correct?: number }>;
  }): LessonType[] {
    const lessons = [
      ...(module.blogPosts || []).map((item): LessonType & { order: number } => ({
        type: "blogPost",
        ...item,
        order: item.order || 0,
      })),
      ...(module.moduleQuestions || []).map((item): LessonType & { order: number } => ({
        type: "question",
        id: item.id,
        question: item.question,
        options: item.options,
        correct: item.correct,
        order: item.order || 0,
      })),
      ...(module.quizzes || []).map((item): LessonType & { order: number; quizType?: string } => ({
        type: "quiz",
        id: item.id,
        title: item.title,
        questions: item.questions,
        passingMark: item.passingMark,
        timeLimit: item.timeLimit,
        quizType: item.type,
        order: item.order || 0,
      })),
      ...(module.pyqs || []).map((item): LessonType & { order: number; pyqType?: string; options?: string[]; correct?: number } => ({
        type: "pyq",
        id: item.id,
        question: item.question,
        solution: item.solution,
        year: item.year,
        pyqType: item.type,
        options: item.options,
        correct: item.correct,
        order: item.order || 0,
      })),
    ];

    // Sort by order field
    return lessons.sort((a, b) => a.order - b.order);
  }

  // Timer handlers
  const startQuizTimer = () => {
    setIsTimerActive(true);
    setQuizStartTime(new Date());
    setQuizAnswers({});
    setIsQuizSubmitted(false);
  };

  const handleTimeUp = () => {
    setIsTimerActive(false);
    submitQuiz(true); // Auto-submit when time is up
  };

  const submitQuiz = (isAutoSubmit = false) => {
    if (isQuizSubmitted) return;
    
    setIsQuizSubmitted(true);
    setIsTimerActive(false);
    
    // Calculate score
    const currentQuiz = currentLesson as any;
    if (currentQuiz.questions) {
      const totalQuestions = currentQuiz.questions.length;
      let correctAnswers = 0;
      
      currentQuiz.questions.forEach((question: any, index: number) => {
        const userAnswer = quizAnswers[question.id];
        if (userAnswer === question.correct) {
          correctAnswers++;
        }
      });
      
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      const passed = score >= (currentQuiz.passingMark || 40);
      
      // Show results
      alert(`Quiz ${isAutoSubmit ? 'Auto-' : ''}Submitted!\n\nScore: ${score}%\nCorrect: ${correctAnswers}/${totalQuestions}\nStatus: ${passed ? 'PASSED' : 'FAILED'}`);
    }
  };

  const handleQuizAnswer = (questionId: string, answerIndex: number) => {
    if (isQuizSubmitted) return;
    
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  // Progress calculation
  const totalLessons = course
    ? course.modules.reduce(
        (sum: number, m: any) => sum + getLessons(m).length,
        0
      )
    : 0;
  const completedLessons =
    currentModuleIdx * (course ? getLessons(course.modules[0]).length : 0) +
    currentLessonIdx;
  const progress = totalLessons
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading course...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !course) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {error || "Course not found"}
            </h2>
          </div>
        </div>
      </PageLayout>
    );
  }

  // If user is not signed in, redirect to sign in
  if (!user) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-8">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Sign In Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please sign in to access the study materials for this course.
            </p>
            <Link href="/sign-in">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  // If user is not enrolled in the course
  if (userAccess !== null && !userAccess.isEnrolled) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-8">
            <Lock className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Enrollment Required
            </h2>
            <p className="text-gray-600 mb-6">
              You need to enroll in this course to access the study materials.
            </p>
            <Link href={`/exams/${slug}`}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md">
                View Course & Enroll
              </Button>
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  const modules = course.modules;
  const currentModule = modules[currentModuleIdx];
  const lessons = getLessons(currentModule);
  const currentLesson = lessons[currentLessonIdx];

  // Navigation handlers
  const goToLesson = (modIdx: number, lesIdx: number) => {
    // Check if user has access to this module
    if (!hasModuleAccess(modIdx)) {
      // Show WhatsApp redirect for locked modules
      const moduleTitle = modules[modIdx]?.title || "Premium Module";
      const message = encodeURIComponent(
        `Hi! I want to purchase the full course: "${course.title}". I'm trying to access the module "${moduleTitle}" which is locked. Please help me with the payment process. Course Price: ₹${course.priceInINR}`
      );
      const whatsappUrl = `https://wa.me/918789449507?text=${message}`;
      window.open(whatsappUrl, '_blank');
      return;
    }
    
    // Reset quiz state when switching lessons
    setIsTimerActive(false);
    setQuizStartTime(null);
    setQuizAnswers({});
    setIsQuizSubmitted(false);
    setSelectedOption(null);
    setQuizQuestionIdx(0);
    
    setCurrentModuleIdx(modIdx);
    setCurrentLessonIdx(lesIdx);
  };
  const goNext = () => {
    // Reset quiz state when moving to next lesson
    setIsTimerActive(false);
    setQuizStartTime(null);
    setQuizAnswers({});
    setIsQuizSubmitted(false);
    setSelectedOption(null);
    setQuizQuestionIdx(0);
    
    if (currentLessonIdx < lessons.length - 1) {
      setCurrentLessonIdx(currentLessonIdx + 1);
    } else if (currentModuleIdx < modules.length - 1) {
      // Check if next module is accessible
      const nextModuleIdx = currentModuleIdx + 1;
      if (hasModuleAccess(nextModuleIdx)) {
        setCurrentModuleIdx(nextModuleIdx);
        setCurrentLessonIdx(0);
      } else {
        // Show WhatsApp redirect for locked next module
        const moduleTitle = modules[nextModuleIdx]?.title || "Premium Module";
        const message = encodeURIComponent(
          `Hi! I want to purchase the full course: "${course.title}". I'm trying to access the module "${moduleTitle}" which is locked. Please help me with the payment process. Course Price: ₹${course.priceInINR}`
        );
        const whatsappUrl = `https://wa.me/918789449507?text=${message}`;
        window.open(whatsappUrl, '_blank');
      }
    }
  };
  
  const goPrev = () => {
    // Reset quiz state when moving to previous lesson
    setIsTimerActive(false);
    setQuizStartTime(null);
    setQuizAnswers({});
    setIsQuizSubmitted(false);
    setSelectedOption(null);
    setQuizQuestionIdx(0);
    
    if (currentLessonIdx > 0) {
      setCurrentLessonIdx(currentLessonIdx - 1);
    } else if (currentModuleIdx > 0) {
      // Check if previous module is accessible
      const prevModuleIdx = currentModuleIdx - 1;
      if (hasModuleAccess(prevModuleIdx)) {
        const prevLessons = getLessons(modules[prevModuleIdx]);
        setCurrentModuleIdx(prevModuleIdx);
        setCurrentLessonIdx(prevLessons.length - 1);
      }
      // If previous module is locked, don't navigate (shouldn't happen in normal flow)
    }
  };

  return (
    <PageLayout>
      {/* Quiz Timer - only show for assessment quizzes */}
      {currentLesson?.type === "quiz" && (currentLesson as any)?.quizType === "ASSESSMENT" && (
        <QuizTimer
          timeLimit={(currentLesson as any).timeLimit || 30}
          onTimeUp={handleTimeUp}
          isActive={isTimerActive}
        />
      )}
      <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Sidebar: Modules & Lessons */}
        <aside className="w-full md:w-72 lg:w-80 bg-white/90 backdrop-blur-sm border-r p-4 overflow-y-auto md:h-[calc(100vh-64px)] md:sticky md:top-16 rounded-2xl md:rounded-none md:rounded-l-3xl shadow-xl transition-all duration-300 ease-in-out hover:shadow-2xl">
          <div className="sticky top-0 bg-white/80 backdrop-blur-sm pb-4 z-10">
            <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Learning Journey
            </h2>
            <div className="text-sm text-gray-500 mb-4">
              Your progress: {progress}% completed
            </div>
            <Progress value={progress} className="h-2 bg-gray-100" />
          </div>
          <ul className="space-y-6 mt-6">
            {modules.map((mod: any, mIdx: number) => {
              const moduleHasAccess = hasModuleAccess(mIdx);
              const isLocked = !moduleHasAccess;
              
              return (
                <li key={mod.id} className="relative">
                  {mIdx > 0 && <div className="absolute -top-3 left-3 w-0.5 h-3 bg-gray-200"></div>}
                  <div className="relative">
                    <div
                      className={`font-semibold mb-3 pl-6 flex items-center gap-2 ${
                        mIdx === currentModuleIdx
                          ? "text-blue-600"
                          : isLocked
                          ? "text-gray-400"
                          : "text-gray-800"
                      }`}
                    >
                      <div className={`absolute left-0 top-1.5 w-3 h-3 rounded-full ${
                        isLocked ? 'bg-gray-300' :
                        mIdx < currentModuleIdx ? 'bg-green-500' :
                        mIdx === currentModuleIdx ? 'bg-blue-500 ring-4 ring-blue-100' :
                        'bg-gray-300'
                      }`}></div>
                      <span className="flex-1">{mod.title}</span>
                      {isLocked && <Lock className="h-4 w-4 text-gray-400" />}
                      {mod.isFree && (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                          Free
                        </span>
                      )}
                    </div>
                    <ul className="ml-6 space-y-2">
                      {getLessons(mod).map((les: any, lIdx: number) => (
                        <li key={les.id}>
                          <button
                            className={`text-left w-full px-3 py-2 rounded-lg transition-all duration-200 ${
                              isLocked
                                ? "cursor-not-allowed opacity-50"
                                : mIdx === currentModuleIdx && lIdx === currentLessonIdx
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                                : "hover:bg-blue-50 text-gray-700 hover:text-blue-700"
                            } flex items-center gap-3`}
                            onClick={() => goToLesson(mIdx, lIdx)}
                            disabled={isLocked}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                              isLocked
                                ? "bg-gray-200 text-gray-400"
                                : mIdx === currentModuleIdx && lIdx === currentLessonIdx
                                ? "bg-white/20 text-white"
                                : les.type === "blogPost"
                                ? "bg-gradient-to-br from-green-100 to-emerald-100 text-green-600 border border-green-200"
                                : les.type === "question"
                                ? "bg-gradient-to-br from-orange-100 to-amber-100 text-orange-600 border border-orange-200"
                                : les.type === "quiz" && (les as any).quizType === "PRACTICE"
                                ? "bg-gradient-to-br from-purple-100 to-violet-100 text-purple-600 border border-purple-200"
                                : les.type === "quiz"
                                ? "bg-gradient-to-br from-red-100 to-rose-100 text-red-600 border border-red-200"
                                : les.type === "pyq"
                                ? "bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-600 border border-blue-200"
                                : "bg-gray-100 text-gray-600"
                            }`}>
                              {isLocked ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              ) : les.type === "blogPost" ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                              ) : les.type === "question" ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              ) : les.type === "quiz" && (les as any).quizType === "PRACTICE" ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                              ) : les.type === "quiz" ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              ) : les.type === "pyq" ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  les.type === "blogPost"
                                    ? "bg-green-100 text-green-700"
                                    : les.type === "question"
                                    ? "bg-orange-100 text-orange-700"
                                    : les.type === "quiz" && (les as any).quizType === "PRACTICE"
                                    ? "bg-purple-100 text-purple-700"
                                    : les.type === "quiz"
                                    ? "bg-red-100 text-red-700"
                                    : les.type === "pyq"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}>
                                  {les.type === "blogPost" && "📖 Topic"}
                                  {les.type === "question" && "❓ Practice"}
                                  {les.type === "quiz" && (les as any).quizType === "PRACTICE" && "🧪 Practice Test"}
                                  {les.type === "quiz" && (les as any).quizType !== "PRACTICE" && "📝 Quiz"}
                                  {les.type === "pyq" && "📅 PYQ"}
                                </span>
                              </div>
                              <span className="line-clamp-2 text-sm leading-tight">
                                {les.title || (les.question ?
                                  <div dangerouslySetInnerHTML={{
                                    __html: les.question.replace(/^<p>|<\/p>$/g, '')
                                  }} /> :
                                  les.year ? `Previous Year ${les.year}` : "Lesson")}
                              </span>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Main Study Area */}
        <main className="flex-1 p-4 md:p-6 flex flex-col">
          <div className="w-full max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {currentModule.title}
                </h2>
                <div className="flex items-center gap-2 text-gray-500">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Module {currentModuleIdx + 1} of {modules.length}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {currentLesson.type === "blogPost" && "Reading"}
                    {["question", "mcq"].includes(currentLesson.type) && "Practice"}
                    {currentLesson.type === "quiz" && "Quiz"}
                    {currentLesson.type === "pyq" && "Previous Year"}
                  </span>
                </div>
              </div>
              
              {/* Upgrade Button - Show only if user is enrolled but hasn't paid and course has premium content */}
              {userAccess?.isEnrolled && !userAccess?.hasPaid && course.priceInINR > 0 && (
                <div className="flex-shrink-0">
                  <button
                    onClick={() => {
                      const message = encodeURIComponent(
                        `Hi! I want to purchase the full course: "${course.title}". I'm currently enrolled but want to unlock all premium modules. Course Price: ₹${course.priceInINR}. My email: ${user?.emailAddresses[0]?.emailAddress || 'Not provided'}`
                      );
                      const whatsappUrl = `https://wa.me/918789449507?text=${message}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-200 hover:scale-105"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.087z"/>
                    </svg>
                    <span className="hidden sm:inline">Upgrade to Premium</span>
                    <span className="sm:hidden">Upgrade</span>
                    <span className="bg-white/20 px-2 py-1 rounded-lg text-sm font-bold">
                      ₹{course.priceInINR}
                    </span>
                  </button>
                </div>
              )}
            </div>
            {/* Check if current module is locked - but don't show locked state while access is loading */}
            {!hasModuleAccess(currentModuleIdx) && !accessLoading && userAccess !== null ? (
              <LockedModuleContent
                moduleTitle={currentModule.title}
                courseTitle={course.title}
                coursePrice={course.priceInINR}
                whatsappNumber="918789449507" // Your WhatsApp number
                loading={loading}
              />
            ) : (
              <Card className="shadow-xl border-0 mb-8 overflow-hidden bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <span className="text-2xl">
                      {currentLesson.type === "blogPost" && "📖"}
                      {["question", "mcq"].includes(currentLesson.type) && "❓"}
                      {currentLesson.type === "quiz" && "📝"}
                      {currentLesson.type === "pyq" && "📅"}
                    </span>
                    {currentLesson.type === "blogPost" && currentLesson.title}
                    {["question", "mcq"].includes(currentLesson.type) && "Practice Question"}
                    {currentLesson.type === "quiz" && `Quiz Assessment`}
                    {currentLesson.type === "pyq" && `Previous Year Question (${currentLesson.year})`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                {/* Render lesson content by type */}
                {currentLesson.type === "blogPost" && (
                  <div
                    className="prose max-w-none text-gray-800 richtext-content"
                    dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                  />
                )}
                {currentLesson.type === "question" && (
                  <div className="space-y-6">
                    <div className="p-6 bg-blue-50 rounded-xl">
                      <div className="text-lg text-gray-900 leading-relaxed">
                        {currentLesson.question}
                      </div>
                    </div>
                    {Array.isArray(currentLesson.options) &&
                    currentLesson.options.length > 0 ? (
                      <div className="grid gap-3">
                        {currentLesson.options.map(
                          (opt: string, idx: number) => (
                            <button
                              key={idx}
                              className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                                typeof selectedOption === "number" &&
                                selectedOption === idx
                                  ? idx === currentLesson.correct
                                    ? "border-green-500 bg-green-50 shadow-lg shadow-green-100"
                                    : "border-red-500 bg-red-50 shadow-lg shadow-red-100"
                                  : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                              }`}
                              onClick={() => setSelectedOption(idx)}
                            >
                              <div className="flex items-start gap-4">
                                <span className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm font-semibold ${
                                  typeof selectedOption === "number" &&
                                  selectedOption === idx
                                    ? idx === (currentLesson.correct || 0)
                                      ? "bg-green-500 text-white"
                                      : "bg-red-500 text-white"
                                    : "bg-gray-100 text-gray-600"
                                }`}>
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                <span className="flex-1 text-gray-700">{opt}</span>
                              </div>
                            </button>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-500 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        No options available for this question.
                      </div>
                    )}
                    {typeof selectedOption === "number" &&
                      selectedOption !== null && (
                        <div className={`mt-6 p-4 rounded-xl ${
                          selectedOption === (currentLesson.correct || 0)
                            ? "bg-green-50 border-2 border-green-500"
                            : "bg-red-50 border-2 border-red-500"
                        }`}>
                          {selectedOption === (currentLesson.correct || 0) ? (
                            <div className="flex items-center gap-2 text-green-700">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="font-semibold">Excellent! Your answer is correct!</span>
                            </div>
                          ) : (
                            <div className="space-y-2 text-red-700">
                              <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="font-semibold">Not quite right. Keep trying!</span>
                              </div>
                              <div className="text-sm">
                                The correct answer is: {String.fromCharCode(65 + (currentLesson.correct || 0))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                )}
                {currentLesson.type === "quiz" && (
                  <div>
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-xl mb-6">
                      <h3 className="text-xl font-bold mb-2">
                        {currentLesson.title || "Quiz Assessment"}
                      </h3>
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Passing: {currentLesson.passingMark}%</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span>{currentLesson.timeLimit} minutes</span>
                        </div>
                      </div>
                      
                      {/* Start Quiz Button - only for assessment quizzes */}
                      {(currentLesson as any)?.quizType === "ASSESSMENT" && !isTimerActive && !isQuizSubmitted && (
                        <div className="mt-4">
                          <Button
                            onClick={startQuizTimer}
                            className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-lg font-semibold"
                          >
                            Start Assessment Timer
                          </Button>
                        </div>
                      )}
                      
                      {/* Practice Quiz Info */}
                      {(currentLesson as any)?.quizType === "PRACTICE" && (
                        <div className="mt-4 bg-green-500/20 border border-green-300 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-green-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span className="font-semibold">Practice Mode - No Time Limit</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Quiz Status */}
                      {isQuizSubmitted && (
                        <div className="mt-4 bg-green-500/20 border border-green-300 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-green-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-semibold">Quiz Completed</span>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Show quiz content - for assessment: only if timer is active or submitted, for practice: always */}
                    {(((currentLesson as any)?.quizType === "ASSESSMENT" && (isTimerActive || isQuizSubmitted)) ||
                      (currentLesson as any)?.quizType === "PRACTICE") && currentLesson.questions &&
                    currentLesson.questions.length > 0 ? (
                      <div className="space-y-6">
                        {/* Progress indicator */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-sm text-gray-500">
                            Question {quizQuestionIdx + 1} of {currentLesson.questions.length}
                          </div>
                          <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 transition-all duration-300"
                              style={{ width: `${((quizQuestionIdx + 1) / currentLesson.questions.length) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        {/* Show one quiz question at a time */}
                        {(() => {
                          const q = currentLesson.questions[quizQuestionIdx];
                          return (
                            <div key={q.id} className="space-y-6">
                              <div className="p-6 bg-blue-50 rounded-xl">
                                <div className="text-lg text-gray-900 leading-relaxed">
                                  {q.question}
                                </div>
                              </div>
                              {q.options && (
                                <div className="grid gap-3">
                                  {q.options.map(
                                    (opt: string, oidx: number) => (
                                      <button
                                        key={oidx}
                                        className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                                          typeof selectedOption === "string" &&
                                          selectedOption === `${q.id}-${oidx}`
                                            ? oidx === q.correct
                                              ? "border-green-500 bg-green-50 shadow-lg shadow-green-100"
                                              : "border-red-500 bg-red-50 shadow-lg shadow-red-100"
                                            : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                                        }`}
                                        onClick={() => {
                                          if (!isQuizSubmitted || (currentLesson as any)?.quizType === "PRACTICE") {
                                            setSelectedOption(`${q.id}-${oidx}`);
                                            if ((currentLesson as any)?.quizType === "ASSESSMENT") {
                                              handleQuizAnswer(q.id, oidx);
                                            }
                                          }
                                        }}
                                        disabled={isQuizSubmitted && (currentLesson as any)?.quizType === "ASSESSMENT"}
                                      >
                                        <div className="flex items-start gap-4">
                                          <span className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm font-semibold ${
                                            typeof selectedOption === "string" &&
                                            selectedOption === `${q.id}-${oidx}`
                                              ? oidx === q.correct
                                                ? "bg-green-500 text-white"
                                                : "bg-red-500 text-white"
                                              : "bg-gray-100 text-gray-600"
                                          }`}>
                                            {String.fromCharCode(65 + oidx)}
                                          </span>
                                          <span className="flex-1 text-gray-700">{opt}</span>
                                        </div>
                                      </button>
                                    )
                                  )}
                                </div>
                              )}
                              {typeof selectedOption === "string" &&
                                selectedOption.startsWith(q.id) && (
                                  <div className={`p-4 rounded-xl ${
                                    Number(selectedOption.split("-")[1]) === q.correct
                                      ? "bg-green-50 border-2 border-green-500"
                                      : "bg-red-50 border-2 border-red-500"
                                  }`}>
                                    {Number(selectedOption.split("-")[1]) === q.correct ? (
                                      <div className="flex items-center gap-2 text-green-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="font-semibold">Correct answer!</span>
                                      </div>
                                    ) : (
                                      <div className="space-y-2 text-red-700">
                                        <div className="flex items-center gap-2">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                          </svg>
                                          <span className="font-semibold">Not quite right</span>
                                        </div>
                                        <div className="text-sm">
                                          The correct answer is: {String.fromCharCode(65 + (q.correct || 0))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              <div className="flex justify-between items-center pt-4 mt-6 border-t">
                                <Button
                                  onClick={() => {
                                    setSelectedOption(null);
                                    setQuizQuestionIdx((idx) =>
                                      Math.max(0, idx - 1)
                                    );
                                  }}
                                  disabled={quizQuestionIdx === 0}
                                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border-2 border-gray-200 hover:border-gray-300 shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Previous
                                </Button>
                                {/* Submit button only for assessment quizzes */}
                                {(currentLesson as any)?.quizType === "ASSESSMENT" && quizQuestionIdx === currentLesson.questions.length - 1 && !isQuizSubmitted ? (
                                  <Button
                                    onClick={() => submitQuiz(false)}
                                    className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                                  >
                                    Submit Quiz
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </Button>
                                ) : (
                                  <Button
                                    onClick={() => {
                                      setSelectedOption(null);
                                      setQuizQuestionIdx((idx) =>
                                        Math.min(
                                          currentLesson.questions.length - 1,
                                          idx + 1
                                        )
                                      );
                                    }}
                                    disabled={
                                      quizQuestionIdx ===
                                      currentLesson.questions.length - 1 ||
                                      (isQuizSubmitted && (currentLesson as any)?.quizType === "ASSESSMENT")
                                    }
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Next
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (currentLesson as any)?.quizType === "ASSESSMENT" && !isTimerActive && !isQuizSubmitted ? (
                      <div className="text-center py-8">
                        <div className="text-gray-500 mb-4">
                          Click "Start Assessment Timer" to begin the quiz
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        No questions in this quiz yet.
                      </div>
                    )}
                  </div>
                )}
                {currentLesson.type === "pyq" && (
                  <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          Year {currentLesson.year}
                        </div>
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {(currentLesson as any).pyqType === 'mcq' && 'Multiple Choice'}
                          {(currentLesson as any).pyqType === 'boolean' && 'True/False'}
                          {(currentLesson as any).pyqType === 'descriptive' && 'Descriptive'}
                        </div>
                      </div>
                      <div className="text-lg text-gray-900 leading-relaxed mb-4">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: currentLesson.question.replace(/^<p>|<\/p>$/g, '')
                          }}
                        />
                      </div>
                    </div>

                    {/* MCQ Options */}
                    {(currentLesson as any).pyqType === 'mcq' && (currentLesson as any).options && (
                      <div className="grid gap-3">
                        {(currentLesson as any).options.map((opt: string, idx: number) => (
                          <button
                            key={idx}
                            className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                              typeof selectedOption === "number" && selectedOption === idx
                                ? idx === (currentLesson as any).correct
                                  ? "border-green-500 bg-green-50 shadow-lg shadow-green-100"
                                  : "border-red-500 bg-red-50 shadow-lg shadow-red-100"
                                : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                            }`}
                            onClick={() => setSelectedOption(idx)}
                          >
                            <div className="flex items-start gap-4">
                              <span className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm font-semibold ${
                                typeof selectedOption === "number" && selectedOption === idx
                                  ? idx === ((currentLesson as any).correct || 0)
                                    ? "bg-green-500 text-white"
                                    : "bg-red-500 text-white"
                                  : "bg-gray-100 text-gray-600"
                              }`}>
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span className="flex-1 text-gray-700">{opt}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Boolean Options */}
                    {(currentLesson as any).pyqType === 'boolean' && (
                      <div className="grid gap-3">
                        {['True', 'False'].map((opt: string, idx: number) => (
                          <button
                            key={idx}
                            className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                              typeof selectedOption === "number" && selectedOption === idx
                                ? idx === (currentLesson as any).correct
                                  ? "border-green-500 bg-green-50 shadow-lg shadow-green-100"
                                  : "border-red-500 bg-red-50 shadow-lg shadow-red-100"
                                : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                            }`}
                            onClick={() => setSelectedOption(idx)}
                          >
                            <div className="flex items-start gap-4">
                              <span className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm font-semibold ${
                                typeof selectedOption === "number" && selectedOption === idx
                                  ? idx === ((currentLesson as any).correct || 0)
                                    ? "bg-green-500 text-white"
                                    : "bg-red-500 text-white"
                                  : "bg-gray-100 text-gray-600"
                              }`}>
                                {opt === 'True' ? 'T' : 'F'}
                              </span>
                              <span className="flex-1 text-gray-700">{opt}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Show feedback for MCQ and Boolean */}
                    {((currentLesson as any).pyqType === 'mcq' || (currentLesson as any).pyqType === 'boolean') &&
                     typeof selectedOption === "number" && selectedOption !== null && (
                      <div className={`p-4 rounded-xl ${
                        selectedOption === ((currentLesson as any).correct || 0)
                          ? "bg-green-50 border-2 border-green-500"
                          : "bg-red-50 border-2 border-red-500"
                      }`}>
                        {selectedOption === ((currentLesson as any).correct || 0) ? (
                          <div className="flex items-center gap-2 text-green-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-semibold">Excellent! Your answer is correct!</span>
                          </div>
                        ) : (
                          <div className="space-y-2 text-red-700">
                            <div className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              <span className="font-semibold">Not quite right. Keep trying!</span>
                            </div>
                            <div className="text-sm">
                              {(currentLesson as any).pyqType === 'mcq' &&
                                `The correct answer is: ${String.fromCharCode(65 + ((currentLesson as any).correct || 0))}`}
                              {(currentLesson as any).pyqType === 'boolean' &&
                                `The correct answer is: ${((currentLesson as any).correct || 0) === 0 ? 'True' : 'False'}`}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-center">
                      <Button
                        onClick={() => setShowSolution(true)}
                        className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        View Detailed Solution
                      </Button>
                    </div>
                    {showSolution && (
                      <div className="mt-6 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-xl"></div>
                        <div className="relative p-6 bg-white/90 backdrop-blur-sm rounded-xl border-2 border-purple-100 shadow-xl">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-purple-900">Detailed Solution</h4>
                            <Button
                              onClick={() => setShowSolution(false)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </Button>
                          </div>
                          <div className="prose prose-purple max-w-none">
                            <div
                              className="text-gray-800 leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: currentLesson.solution || "" }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                </CardContent>
              </Card>
            )}
            <div className="flex justify-between w-full mt-8">
              <Button
                onClick={goPrev}
                disabled={currentModuleIdx === 0 && currentLessonIdx === 0}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Previous
              </Button>
              <Button
                onClick={goNext}
                disabled={
                  currentModuleIdx === modules.length - 1 &&
                  currentLessonIdx === lessons.length - 1
                }
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </PageLayout>
  );
}
