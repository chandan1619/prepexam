"use client";
import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import Link from "next/link";

type TREType = "TRE1" | "TRE2" | "TRE3";
type ClassType = "9-10" | "11-12";

interface QuestionPaper {
  id: string;
  title: string;
  treType: TREType;
  classType: ClassType;
  year: string;
  driveLink: string;
  description: string;
}

// Sample data - replace with actual data from your backend
const questionPapers: QuestionPaper[] = [
  {
    id: "1",
    title: "BPSC Previous Year Computer Science Question Paper",
    treType: "TRE1",
    classType: "11-12",
    year: "2024",
    driveLink:
      "https://drive.google.com/file/d/12zdVx1t56mZ_mT6Q32Y6JH6HbJrtJqc_/preview",
    description:
      "Bihar Public Service Commission previous year computer science question paper with comprehensive coverage of all topics",
  },
  {
    id: "2",
    title: "TRE 1 Computer Science - Class 11-12",
    treType: "TRE1",
    classType: "11-12",
    year: "2023",
    driveLink:
      "https://drive.google.com/file/d/1fVKZ6Hon9l-tl-apEJttRWG6fj-Y4mFU/preview",
    description: "Advanced level questions for senior classes",
  },
  {
    id: "3",
    title: "TRE 2 Computer Science - Class 9-10",
    treType: "TRE2",
    classType: "9-10",
    year: "2023",
    driveLink:
      "https://drive.google.com/file/d/1fVKZ6Hon9l-tl-apEJttRWG6fj-Y4mFU/preview",
    description: "TRE 2 examination papers with detailed explanations",
  },
  {
    id: "4",
    title: "TRE 2 Computer Science - Class 11-12",
    treType: "TRE2",
    classType: "11-12",
    year: "2023",
    driveLink:
      "https://drive.google.com/file/d/1LHQNLEi9w7mRYlqVvr6R-Y0rAr0W2joV/preview",
    description: "Higher secondary level TRE 2 question papers",
  },
  {
    id: "5",
    title: "TRE 3 Computer Science - Class 9-10",
    treType: "TRE3",
    classType: "9-10",
    year: "2024",
    driveLink:
      "https://drive.google.com/file/d/10CCn2jFbScwmcd0tqNrcJRg6ummFlhuL/preview",
    description: "Latest TRE 3 papers for middle school level",
  },
  {
    id: "6",
    title: "TRE 3 Computer Science - Class 11-12",
    treType: "TRE3",
    classType: "11-12",
    year: "2024",
    driveLink:
      "https://drive.google.com/file/d/15UKiMsogAnYNkPv0CUewlJe7_8Ep5c8n/preview",
    description: "Advanced TRE 3 question papers for senior classes",
  },
];

export default function PreviousYearQuestions() {
  const [selectedTRE, setSelectedTRE] = useState<TREType | "ALL">("ALL");
  const [selectedClass, setSelectedClass] = useState<ClassType | "ALL">("ALL");
  const [selectedPaper, setSelectedPaper] = useState<QuestionPaper | null>(
    null
  );

  const filteredPapers = questionPapers.filter((paper) => {
    const treMatch = selectedTRE === "ALL" || paper.treType === selectedTRE;
    const classMatch =
      selectedClass === "ALL" || paper.classType === selectedClass;
    return treMatch && classMatch;
  });

  const handleViewPaper = (paper: QuestionPaper) => {
    setSelectedPaper(paper);
  };

  const handleClosePaper = () => {
    setSelectedPaper(null);
  };

  return (
    <PageLayout>
      {/* Header Section */}
      <section className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <nav className="flex justify-center mb-8">
              <ol className="flex items-center space-x-2 text-purple-200">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </li>
                <li className="text-white font-medium">
                  BPSC Previous Year Computer Science Question Paper
                </li>
              </ol>
            </nav>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              BPSC Previous Year{" "}
              <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Computer Science Question Papers
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-purple-100 max-w-3xl mx-auto">
              Access comprehensive collection of BPSC and TRE computer science
              question papers for effective exam preparation
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-12 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl mb-4">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Find Your Papers
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Filter by exam type and class level to quickly find the question
                papers you need
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* TRE Type Filter */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Exam Type
                    </h3>
                    <p className="text-sm text-gray-600">
                      Choose your examination
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "ALL", label: "All Exams", icon: "🎯" },
                    { value: "TRE1", label: "TRE 1", icon: "1️⃣" },
                    { value: "TRE2", label: "TRE 2", icon: "2️⃣" },
                    { value: "TRE3", label: "TRE 3", icon: "3️⃣" },
                  ].map((tre) => (
                    <button
                      key={tre.value}
                      onClick={() =>
                        setSelectedTRE(tre.value as TREType | "ALL")
                      }
                      className={`group relative py-4 px-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                        selectedTRE === tre.value
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-200"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-transparent hover:border-purple-200"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-2xl">{tre.icon}</span>
                        <span className="text-sm font-bold">{tre.label}</span>
                      </div>
                      {selectedTRE === tre.value && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Class Filter */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Class Level
                    </h3>
                    <p className="text-sm text-gray-600">
                      Select your grade level
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "ALL", label: "All Classes", icon: "📚" },
                    { value: "9-10", label: "Class 9-10", icon: "🎓" },
                    { value: "11-12", label: "Class 11-12", icon: "🏆" },
                  ].map((classType) => (
                    <button
                      key={classType.value}
                      onClick={() =>
                        setSelectedClass(classType.value as ClassType | "ALL")
                      }
                      className={`group relative py-4 px-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                        selectedClass === classType.value
                          ? "bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg shadow-green-200"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-transparent hover:border-green-200"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-xl">{classType.icon}</span>
                        <span className="text-xs font-bold text-center leading-tight">
                          {classType.label}
                        </span>
                      </div>
                      {selectedClass === classType.value && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-purple-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium">
                    Found{" "}
                    <span className="font-bold text-purple-600 text-xl">
                      {filteredPapers.length}
                    </span>{" "}
                    question papers
                  </span>
                </div>
                {(selectedTRE !== "ALL" || selectedClass !== "ALL") && (
                  <button
                    onClick={() => {
                      setSelectedTRE("ALL");
                      setSelectedClass("ALL");
                    }}
                    className="inline-flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-xl font-semibold hover:bg-gray-50 transition-colors border border-gray-200"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Question Papers Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredPapers.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                No Question Papers Found
              </h3>
              <p className="text-gray-600 mb-8">
                Try adjusting your filters to see more results
              </p>
              <button
                onClick={() => {
                  setSelectedTRE("ALL");
                  setSelectedClass("ALL");
                }}
                className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPapers.map((paper) => (
                <div
                  key={paper.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          paper.treType === "TRE1"
                            ? "bg-blue-100 text-blue-700"
                            : paper.treType === "TRE2"
                            ? "bg-green-100 text-green-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {paper.treType}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                        Class {paper.classType}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                        {paper.year}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                      {paper.title}
                    </h3>

                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {paper.description}
                    </p>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleViewPaper(paper)}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        View PDF
                      </button>
                      <a
                        href={paper.driveLink.replace(
                          "/preview",
                          "/view?usp=sharing"
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PDF Viewer Modal */}
      {selectedPaper && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-full max-h-[95vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  {selectedPaper.title}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {selectedPaper.treType} • Class {selectedPaper.classType} •{" "}
                  {selectedPaper.year}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const iframe = document.querySelector("iframe");
                    if (iframe?.requestFullscreen) {
                      iframe.requestFullscreen();
                    }
                  }}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-xl transition-colors"
                  title="Fullscreen"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleClosePaper}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-xl transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 p-3 sm:p-6">
              <iframe
                src={selectedPaper.driveLink}
                className="w-full h-full rounded-xl border border-gray-200 min-h-[70vh] sm:min-h-[75vh]"
                title={selectedPaper.title}
                allow="autoplay"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-gray-600 text-sm text-center sm:text-left">
                  Having trouble viewing? Try opening in a new tab or use
                  fullscreen mode.
                </p>
                <div className="flex gap-3">
                  <a
                    href={selectedPaper.driveLink.replace(
                      "/preview",
                      "/view?usp=sharing"
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Open in New Tab
                  </a>
                  <button
                    onClick={handleClosePaper}
                    className="bg-gray-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
