"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function StudyPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
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
  const [showQuizFeedback, setShowQuizFeedback] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState<string>("");
  const [quizQuestionIdx, setQuizQuestionIdx] = useState(0);

  useEffect(() => {
    async function fetchCourse() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/course/${slug}`);
        const data = await res.json();
        if (res.ok && data.course) {
          setCourse(data.course);
        } else {
          setError(data.error || "Course not found");
        }
      } catch (err) {
        setError("Failed to load course");
      }
      setLoading(false);
    }
    if (slug) fetchCourse();
  }, [slug]);

  console.log(course);

  // Helper: Get all lessons in a module (blogPosts, moduleQuestions, quizzes, pyqs)
  function getLessons(module: any) {
    return [
      ...(module.blogPosts || []).map((item: any) => ({
        type: "blogPost",
        ...item,
      })),
      ...(module.moduleQuestions || []).map((item: any) => ({
        type: "question",
        ...item,
      })),
      ...(module.quizzes || []).map((item: any) => ({ type: "quiz", ...item })),
      ...(module.pyqs || []).map((item: any) => ({ type: "pyq", ...item })),
    ];
  }

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

  const modules = course.modules;
  const currentModule = modules[currentModuleIdx];
  const lessons = getLessons(currentModule);
  const currentLesson = lessons[currentLessonIdx];

  // Navigation handlers
  const goToLesson = (modIdx: number, lesIdx: number) => {
    setCurrentModuleIdx(modIdx);
    setCurrentLessonIdx(lesIdx);
  };
  const goNext = () => {
    if (currentLessonIdx < lessons.length - 1) {
      setCurrentLessonIdx(currentLessonIdx + 1);
    } else if (currentModuleIdx < modules.length - 1) {
      setCurrentModuleIdx(currentModuleIdx + 1);
      setCurrentLessonIdx(0);
    }
  };
  const goPrev = () => {
    if (currentLessonIdx > 0) {
      setCurrentLessonIdx(currentLessonIdx - 1);
    } else if (currentModuleIdx > 0) {
      const prevLessons = getLessons(modules[currentModuleIdx - 1]);
      setCurrentModuleIdx(currentModuleIdx - 1);
      setCurrentLessonIdx(prevLessons.length - 1);
    }
  };

  return (
    <PageLayout>
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
            {modules.map((mod: any, mIdx: number) => (
              <li key={mod.id} className="relative">
                {mIdx > 0 && <div className="absolute -top-3 left-3 w-0.5 h-3 bg-gray-200"></div>}
                <div className="relative">
                  <div
                    className={`font-semibold mb-3 pl-6 ${
                      mIdx === currentModuleIdx
                        ? "text-blue-600"
                        : "text-gray-800"
                    }`}
                  >
                    <div className={`absolute left-0 top-1.5 w-3 h-3 rounded-full ${
                      mIdx < currentModuleIdx ? 'bg-green-500' :
                      mIdx === currentModuleIdx ? 'bg-blue-500 ring-4 ring-blue-100' :
                      'bg-gray-300'
                    }`}></div>
                    {mod.title}
                  </div>
                  <ul className="ml-6 space-y-2">
                    {getLessons(mod).map((les: any, lIdx: number) => (
                      <li key={les.id}>
                        <button
                          className={`text-left w-full px-3 py-2 rounded-lg transition-all duration-200 ${
                            mIdx === currentModuleIdx && lIdx === currentLessonIdx
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                              : "hover:bg-blue-50 text-gray-700 hover:text-blue-700"
                          } flex items-center gap-2`}
                          onClick={() => goToLesson(mIdx, lIdx)}
                        >
                          <span className={`${
                            mIdx === currentModuleIdx && lIdx === currentLessonIdx
                              ? "text-white"
                              : "text-blue-500"
                          }`}>
                            {les.type === "blogPost" && "📖"}
                            {les.type === "question" && "❓"}
                            {les.type === "quiz" && "📝"}
                            {les.type === "pyq" && "📅"}
                          </span>
                          <span className="line-clamp-1">
                            {les.title || les.question || les.year || "Lesson"}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
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
            </div>
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
                {["question", "mcq"].includes(currentLesson.type) && (
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
                                    ? idx === currentLesson.correct
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
                          selectedOption === currentLesson.correct
                            ? "bg-green-50 border-2 border-green-500"
                            : "bg-red-50 border-2 border-red-500"
                        }`}>
                          {selectedOption === currentLesson.correct ? (
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
                                The correct answer is: {String.fromCharCode(65 + currentLesson.correct)}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    {currentLesson.type === "true-false" && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="font-medium text-blue-800">
                          Correct Answer:{" "}
                          <span className="font-bold">
                            {currentLesson.correct === 1 ? "True" : "False"}
                          </span>
                        </div>
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
                    </div>
                    {currentLesson.questions &&
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
                                        onClick={() =>
                                          setSelectedOption(`${q.id}-${oidx}`)
                                        }
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
                                          The correct answer is: {String.fromCharCode(65 + q.correct)}
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
                                    currentLesson.questions.length - 1
                                  }
                                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Next
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                  </svg>
                                </Button>
                              </div>
                            </div>
                          );
                        })()}
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
                      </div>
                      <div className="text-lg text-gray-900 leading-relaxed">
                        {currentLesson.question}
                      </div>
                    </div>
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
                              dangerouslySetInnerHTML={{ __html: currentLesson.solution }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
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
