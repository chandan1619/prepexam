import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  FileText,
  HelpCircle,
  ClipboardList,
  Calendar,
  Trash2,
  Clock,
  Star,
  CheckCircle,
  Edit,
} from "lucide-react";
import RichTextEditor from "./RichTextEditor";
import { LoadingOverlay, ButtonLoader } from "./ui/loader";

interface Topic {
  id: string;
  title: string;
  content: string;
  duration: string;
}

interface Question {
  id: string;
  question: string;
  type: "multiple-choice" | "true-false" | "essay" | "fill-blank";
  options?: string[];
  correct?: number;
  correctAnswer: string;
  explanation: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  type: 'PRACTICE' | 'ASSESSMENT';
  questions: Question[];
  timeLimit: number;
  passingScore: number;
}

interface PreviousYearQuestion {
  id: string;
  year: number;
  question: string;
  solution: string;
  difficulty: "easy" | "medium" | "hard";
  marks: number;
  type?: "mcq" | "boolean" | "descriptive";
  options?: string[];
  correct?: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
  questions: Question[];
  quizzes: Quiz[];
  previousYearQuestions: PreviousYearQuestion[];
  moduleQuestions: Array<{
    id: string;
    question: string;
    type?: string;
    options?: string[];
    correct?: number;
  }>; // Added for standalone questions
}

interface ModuleContentManagerProps {
  module: Module;
  onModuleUpdate: (module: Module) => void;
}

export function ModuleContentManager({
  module,
  onModuleUpdate,
}: ModuleContentManagerProps) {
  const [activeTab, setActiveTab] = useState("topics");
  const [isAddingContent, setIsAddingContent] = useState<string | null>(null);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // Topic Management
  const [newTopic, setNewTopic] = useState({
    title: "",
    content: "",
    duration: "",
  });

  const addTopic = async () => {
    if (!newTopic.title.trim()) {
      alert("Please enter a topic title");
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Adding topic...");

    try {
      const topic: Topic = {
        id: Date.now().toString(),
        ...newTopic,
      };

      await onModuleUpdate({
        ...module,
        topics: [...(module.topics || []), topic],
      });

      setNewTopic({ title: "", content: "", duration: "" });
      setIsAddingContent(null);
    } catch (error) {
      console.error("Failed to add topic:", error);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const deleteTopic = (topicId: string) => {
    onModuleUpdate({
      ...module,
      topics: (module.topics || []).filter((t) => t.id !== topicId),
    });
  };

  const editTopic = (topic: Topic) => {
    setEditingTopic(topic);
    setNewTopic({
      title: topic.title,
      content: topic.content,
      duration: topic.duration,
    });
    setIsAddingContent("edit-topic");
  };

  const updateTopic = async () => {
    if (!editingTopic || !newTopic.title.trim()) {
      alert("Please enter a topic title");
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Updating topic...");

    try {
      const updatedTopic: Topic = {
        ...editingTopic,
        title: newTopic.title,
        content: newTopic.content,
        duration: newTopic.duration,
      };

      await onModuleUpdate({
        ...module,
        topics: (module.topics || []).map((t) =>
          t.id === editingTopic.id ? updatedTopic : t
        ),
      });

      setNewTopic({ title: "", content: "", duration: "" });
      setEditingTopic(null);
      setIsAddingContent(null);
    } catch (error) {
      console.error("Failed to update topic:", error);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  // Question Management

  // Quiz Management
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);


  const deleteQuiz = (quizId: string) => {
    onModuleUpdate({
      ...module,
      quizzes: module.quizzes.filter((q) => q.id !== quizId),
    });
  };


  // Previous Year Questions Management
  const [newPrevQuestion, setNewPrevQuestion] = useState({
    year: new Date().getFullYear(),
    question: "",
    solution: "",
    difficulty: "medium" as PreviousYearQuestion["difficulty"],
    marks: 1,
    type: "descriptive" as "mcq" | "boolean" | "descriptive",
    options: ["", "", "", ""],
    correct: 0 as number | undefined,
  });

  const addPreviousYearQuestion = () => {
    if (!newPrevQuestion.question.trim()) {
      alert("Please enter a question");
      return;
    }

    // Validate MCQ options
    if (newPrevQuestion.type === "mcq") {
      const filledOptions = newPrevQuestion.options.filter(opt => opt.trim());
      if (filledOptions.length < 2) {
        alert("Please provide at least 2 options for multiple choice questions");
        return;
      }
    }

    const prevQuestion: PreviousYearQuestion = {
      id: Date.now().toString(),
      ...newPrevQuestion,
      options: newPrevQuestion.type === "descriptive" ? [] : newPrevQuestion.options,
      correct: newPrevQuestion.type === "descriptive" ? undefined : newPrevQuestion.correct,
    };

    onModuleUpdate({
      ...module,
      previousYearQuestions: [...module.previousYearQuestions, prevQuestion],
    });

    setNewPrevQuestion({
      year: new Date().getFullYear(),
      question: "",
      solution: "",
      difficulty: "medium",
      marks: 1,
      type: "descriptive",
      options: ["", "", "", ""],
      correct: 0,
    });
    setIsAddingContent(null);
  };

  const deletePrevQuestion = (questionId: string) => {
    onModuleUpdate({
      ...module,
      previousYearQuestions: module.previousYearQuestions?.filter(
        (q) => q.id !== questionId
      ),
    });
  };

  const getDifficultyBadgeVariant = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "default";
      case "medium":
        return "secondary";
      case "hard":
        return "destructive";
      default:
        return "outline";
    }
  };

  // If viewing a specific quiz
  if (selectedQuiz) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedQuiz(null)}>
            ← Back to Quizzes
          </Button>
          <div>
            <h3 className="text-lg font-semibold">{selectedQuiz.title}</h3>
            <p className="text-sm text-gray-600">{selectedQuiz.description}</p>
          </div>
        </div>
        {/* Direct Question Creation for the Quiz */}
        <Card className="shadow-md border-0 mb-4">
          <CardHeader>
            <CardTitle className="text-base">Add Questions to {selectedQuiz.type === 'PRACTICE' ? 'Practice Set' : 'Quiz'}</CardTitle>
          </CardHeader>
          <CardContent>
            <QuizQuestionForm
              quizId={selectedQuiz.id}
              onSuccess={() => window.location.reload()}
            />
          </CardContent>
        </Card>
        {/* Existing quiz questions display (optional) */}
        <div className="space-y-3">
          <h4 className="font-medium mt-6">Questions in this Quiz</h4>
          {selectedQuiz.questions && selectedQuiz.questions.length > 0 ? (
            selectedQuiz.questions.map((question: Question, index: number) => (
              <Card key={question.id} className="shadow-md border-0">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          Q{index + 1}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {question.type?.replace("-", " ") || "MCQ"}
                        </Badge>
                      </div>
                      <h5 className="font-semibold text-gray-900 mb-2">
                        {question.question}
                      </h5>
                      {question.options && (
                        <div className="space-y-1 mb-2">
                          {question.options.map(
                            (option: string, optIndex: number) => (
                              <div
                                key={optIndex}
                                className={`text-sm p-2 rounded ${
                                  question.correct === optIndex
                                    ? "bg-green-100 text-green-800 border border-green-200"
                                    : "bg-gray-100"
                                }`}
                              >
                                {String.fromCharCode(65 + optIndex)}. {option}
                              </div>
                            )
                          )}
                        </div>
                      )}
                      {question.type === "true-false" && (
                        <div className="mb-2">
                          Correct Answer:{" "}
                          <span className="font-bold">
                            {question.correct === 1 ? "True" : "False"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No questions in this quiz yet.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="topics" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Topics ({module.topics?.length || 0})
        </TabsTrigger>
        <TabsTrigger value="quizzes" className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          Quizzes ({module.quizzes.length})
        </TabsTrigger>
        <TabsTrigger value="previous" className="flex items-center gap-2">
          <Calendar className="h-3 w-3 mr-1" />
          Previous Year ({module.previousYearQuestions?.length})
        </TabsTrigger>
      </TabsList>

      {/* Topics Tab */}
      <TabsContent value="topics" className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Topics</h3>
          <Button size="sm" onClick={() => setIsAddingContent("topic")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Topic
          </Button>
        </div>

        {(isAddingContent === "topic" || isAddingContent === "edit-topic") && (
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="text-base">
                {isAddingContent === "edit-topic" ? "Edit Topic" : "Add New Topic"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="topic-title">Topic Title</Label>
                <Input
                  id="topic-title"
                  value={newTopic.title}
                  onChange={(e) =>
                    setNewTopic((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter topic title..."
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="topic-duration">Duration</Label>
                <Input
                  id="topic-duration"
                  value={newTopic.duration}
                  onChange={(e) =>
                    setNewTopic((prev) => ({
                      ...prev,
                      duration: e.target.value,
                    }))
                  }
                  placeholder="e.g., 45 minutes"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Rich Content</Label>
                <RichTextEditor
                  value={newTopic.content}
                  onChange={(content) =>
                    setNewTopic((prev) => ({ ...prev, content }))
                  }
                  placeholder="Create rich content with text, images, videos, and links..."
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={isAddingContent === "edit-topic" ? updateTopic : addTopic}
                  disabled={isLoading}
                  className="cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <ButtonLoader size="sm" />
                      {isAddingContent === "edit-topic" ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    isAddingContent === "edit-topic" ? "Update Topic" : "Add Topic"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingContent(null);
                    setEditingTopic(null);
                    setNewTopic({ title: "", content: "", duration: "" });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {(module.topics || []).map((topic) => (
            <Card key={topic.id} className="shadow-md border-0">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {topic.title}
                    </h4>
                    {topic.content && (
                      // Render rich text as HTML (trusted from editor)
                      <div
                        className="text-sm text-gray-600 mt-1 prose"
                        dangerouslySetInnerHTML={{ __html: topic.content }}
                      />
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {topic.duration && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {topic.duration}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editTopic(topic)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteTopic(topic.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!module.topics || module.topics.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              No topics added yet. Create your first topic to get started.
            </div>
          )}
        </div>
      </TabsContent>


      {/* Quizzes Tab - Now handles both Practice and Assessment */}
      <TabsContent value="quizzes" className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Questions & Quizzes</h3>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setIsAddingContent("practice-quiz")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Practice Questions
            </Button>
            <Button size="sm" onClick={() => setIsAddingContent("assessment-quiz")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Assessment Quiz
            </Button>
          </div>
        </div>

        {isAddingContent === "practice-quiz" && (
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="text-base">Create Practice Question Set</CardTitle>
              <p className="text-sm text-gray-600">
                Practice questions are individual questions for students to practice. No time limit or passing score.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <AddQuizForm
                moduleId={module.id}
                quizType="PRACTICE"
                onSuccess={() => {
                  setIsAddingContent(null);
                  if (typeof window !== "undefined") window.location.reload();
                }}
              />
            </CardContent>
          </Card>
        )}

        {isAddingContent === "assessment-quiz" && (
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="text-base">Create Assessment Quiz</CardTitle>
              <p className="text-sm text-gray-600">
                Assessment quizzes are formal tests with time limits and passing scores.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <AddQuizForm
                moduleId={module.id}
                quizType="ASSESSMENT"
                onSuccess={() => {
                  setIsAddingContent(null);
                  if (typeof window !== "undefined") window.location.reload();
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Separate Practice Questions and Assessment Quizzes */}
        <div className="space-y-6">
          {/* Practice Questions Section */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-blue-600" />
              Practice Questions
            </h4>
            <div className="space-y-3">
              {module.quizzes.filter(quiz => quiz.type === 'PRACTICE').map((quiz) => (
                <Card
                  key={quiz.id}
                  className="shadow-md border-0 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500"
                >
                  <CardContent
                    className="p-4"
                    onClick={() => setSelectedQuiz(quiz)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            Practice
                          </Badge>
                          <h4 className="font-semibold text-gray-900">
                            {quiz.title}
                          </h4>
                        </div>
                        {quiz.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {quiz.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {quiz.questions.length} questions
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteQuiz(quiz.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {module.quizzes.filter(quiz => quiz.type === 'PRACTICE').length === 0 && (
                <div className="text-center py-6 text-gray-500 bg-blue-50 rounded-lg border-2 border-dashed border-blue-200">
                  No practice questions yet. Create practice questions for students to study.
                </div>
              )}
            </div>
          </div>

          {/* Assessment Quizzes Section */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-green-600" />
              Assessment Quizzes
            </h4>
            <div className="space-y-3">
              {module.quizzes.filter(quiz => quiz.type === 'ASSESSMENT').map((quiz) => (
                <Card
                  key={quiz.id}
                  className="shadow-md border-0 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-green-500"
                >
                  <CardContent
                    className="p-4"
                    onClick={() => setSelectedQuiz(quiz)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            Assessment
                          </Badge>
                          <h4 className="font-semibold text-gray-900">
                            {quiz.title}
                          </h4>
                        </div>
                        {quiz.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {quiz.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {quiz.timeLimit}min
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            {quiz.passingScore}%
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {quiz.questions.length} questions
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteQuiz(quiz.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {module.quizzes.filter(quiz => quiz.type === 'ASSESSMENT').length === 0 && (
                <div className="text-center py-6 text-gray-500 bg-green-50 rounded-lg border-2 border-dashed border-green-200">
                  No assessment quizzes yet. Create formal quizzes with time limits and passing scores.
                </div>
              )}
            </div>
          </div>
        </div>
      </TabsContent>

      {/* Previous Year Questions Tab */}
      <TabsContent value="previous" className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Previous Year Questions</h3>
          <Button size="sm" onClick={() => setIsAddingContent("prev-question")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>

        {isAddingContent === "prev-question" && (
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="text-base">
                Add Previous Year Question
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="prev-year">Year</Label>
                  <Input
                    id="prev-year"
                    type="number"
                    value={newPrevQuestion.year}
                    onChange={(e) =>
                      setNewPrevQuestion((prev) => ({
                        ...prev,
                        year: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="prev-type">Question Type</Label>
                  <select
                    id="prev-type"
                    value={newPrevQuestion.type}
                    onChange={(e) =>
                      setNewPrevQuestion((prev) => ({
                        ...prev,
                        type: e.target.value as "mcq" | "boolean" | "descriptive",
                        options: e.target.value === "descriptive" ? [] : prev.options,
                        correct: e.target.value === "descriptive" ? 0 : 0,
                      }))
                    }
                    className="mt-2 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="descriptive">Descriptive</option>
                    <option value="mcq">Multiple Choice</option>
                    <option value="boolean">True/False</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="prev-difficulty">Difficulty</Label>
                  <select
                    id="prev-difficulty"
                    value={newPrevQuestion.difficulty}
                    onChange={(e) =>
                      setNewPrevQuestion((prev) => ({
                        ...prev,
                        difficulty: e.target
                          .value as PreviousYearQuestion["difficulty"],
                      }))
                    }
                    className="mt-2 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="prev-marks">Marks</Label>
                  <Input
                    id="prev-marks"
                    type="number"
                    value={newPrevQuestion.marks}
                    onChange={(e) =>
                      setNewPrevQuestion((prev) => ({
                        ...prev,
                        marks: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="mt-2"
                  />
                </div>
              </div>
              <div>
                <Label>Question</Label>
                <RichTextEditor
                  value={newPrevQuestion.question}
                  onChange={(question) =>
                    setNewPrevQuestion((prev) => ({ ...prev, question }))
                  }
                  placeholder="Enter the question with rich content..."
                />
              </div>
              
              {/* MCQ Options */}
              {newPrevQuestion.type === "mcq" && (
                <div>
                  <Label>Options</Label>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {newPrevQuestion.options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correct"
                          checked={newPrevQuestion.correct === idx}
                          onChange={() =>
                            setNewPrevQuestion((prev) => ({
                              ...prev,
                              correct: idx,
                            }))
                          }
                          className="mr-2"
                        />
                        <Input
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...newPrevQuestion.options];
                            newOpts[idx] = e.target.value;
                            setNewPrevQuestion((prev) => ({
                              ...prev,
                              options: newOpts,
                            }));
                          }}
                          placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                          required={newPrevQuestion.type === "mcq"}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Boolean Options */}
              {newPrevQuestion.type === "boolean" && (
                <div>
                  <Label>Correct Answer</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct"
                        checked={newPrevQuestion.correct === 0}
                        onChange={() =>
                          setNewPrevQuestion((prev) => ({
                            ...prev,
                            correct: 0,
                          }))
                        }
                      />
                      True
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct"
                        checked={newPrevQuestion.correct === 1}
                        onChange={() =>
                          setNewPrevQuestion((prev) => ({
                            ...prev,
                            correct: 1,
                          }))
                        }
                      />
                      False
                    </label>
                  </div>
                </div>
              )}

              <div>
                <Label>Solution</Label>
                <RichTextEditor
                  value={newPrevQuestion.solution}
                  onChange={(solution) =>
                    setNewPrevQuestion((prev) => ({ ...prev, solution }))
                  }
                  placeholder="Enter the solution with rich content..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addPreviousYearQuestion}>Add Question</Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddingContent(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {module.previousYearQuestions?.map((question) => (
            <Card key={question.id} className="shadow-md border-0">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {question.year}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {question.type === "mcq" && "Multiple Choice"}
                        {question.type === "boolean" && "True/False"}
                        {(question.type === "descriptive" || !question.type) && "Descriptive"}
                      </Badge>
                      <Badge
                        variant={getDifficultyBadgeVariant(question.difficulty)}
                        className="text-xs"
                      >
                        {question.difficulty}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {question.marks} marks
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: question.question.replace(/^<p>|<\/p>$/g, '')
                        }}
                      />
                    </h4>
                    
                    {/* Show options for MCQ */}
                    {question.type === "mcq" && question.options && (
                      <div className="space-y-1 mb-2">
                        {question.options.map((option: string, optIndex: number) => (
                          <div
                            key={optIndex}
                            className={`text-sm p-2 rounded ${
                              question.correct === optIndex
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-gray-100"
                            }`}
                          >
                            {String.fromCharCode(65 + optIndex)}. {option}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Show answer for Boolean */}
                    {question.type === "boolean" && (
                      <div className="mb-2">
                        <span className="text-sm font-medium">Correct Answer: </span>
                        <span className={`text-sm px-2 py-1 rounded ${
                          question.correct === 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {question.correct === 0 ? "True" : "False"}
                        </span>
                      </div>
                    )}
                    
                    {question.solution && (
                      <div className="mt-2">
                        <span className="text-sm font-medium text-gray-700">Solution:</span>
                        <div
                          className="text-sm text-gray-600 mt-1 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: question.solution }}
                        />
                      </div>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deletePrevQuestion(question.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {module.previousYearQuestions?.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No previous year questions added yet. Add questions from past
              exams.
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
    <LoadingOverlay isVisible={isLoading} message={loadingMessage} />
    </>
  );
}

// QuizQuestionForm: Add questions directly to a quiz
function QuizQuestionForm({
  quizId,
  onSuccess,
}: {
  quizId: string;
  onSuccess: () => void;
}) {
  const [type, setType] = useState<"mcq" | "true-false">("mcq");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/quiz/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId,
          type,
          question,
          options: type === "mcq" ? options : [],
          correct: type === "mcq" ? correct : correct, // 0/1 for true/false
        }),
      });
      if (res.ok) {
        setQuestion("");
        setOptions(["", "", "", ""]);
        setCorrect(0);
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add question");
      }
    } catch {
      setError("Failed to add question");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Type</Label>
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value as "mcq" | "true-false");
            setCorrect(0);
          }}
          className="mt-2 block w-full border rounded px-3 py-2"
        >
          <option value="mcq">Multiple Choice</option>
          <option value="true-false">True / False</option>
        </select>
      </div>
      <div>
        <Label>Question</Label>
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter question text"
          className="mt-2"
          required
        />
      </div>
      {type === "mcq" ? (
        <div>
          <Label>Options</Label>
          <div className="grid grid-cols-1 gap-2 mt-2">
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correct"
                  checked={correct === idx}
                  onChange={() => setCorrect(idx)}
                  className="mr-2"
                />
                <Input
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...options];
                    newOpts[idx] = e.target.value;
                    setOptions(newOpts);
                  }}
                  placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                  required
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <Label>Correct Answer</Label>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="correct"
                checked={correct === 1}
                onChange={() => setCorrect(1)}
              />
              True
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="correct"
                checked={correct === 0}
                onChange={() => setCorrect(0)}
              />
              False
            </label>
          </div>
        </div>
      )}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <Button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Question"}
      </Button>
    </form>
  );
}

// AddQuizForm: Add a quiz group to a module
function AddQuizForm({
  moduleId,
  quizType = "ASSESSMENT",
  onSuccess,
}: {
  moduleId: string;
  quizType?: "PRACTICE" | "ASSESSMENT";
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [passingMark, setPassingMark] = useState(40);
  const [timeLimit, setTimeLimit] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId,
          title,
          description,
          type: quizType,
          passingMark: quizType === 'PRACTICE' ? 0 : passingMark,
          timeLimit: quizType === 'PRACTICE' ? 0 : timeLimit,
        }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add quiz");
      }
    } catch {
      setError("Failed to add quiz");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Quiz Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter quiz title"
          className="mt-2"
          required
        />
      </div>
      <div>
        <Label>Description</Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter quiz description (optional)"
          className="mt-2"
        />
      </div>
      {quizType === 'ASSESSMENT' && (
        <>
          <div>
            <Label>Passing Mark (%)</Label>
            <Input
              type="number"
              value={passingMark}
              onChange={(e) => setPassingMark(Number(e.target.value))}
              min={0}
              max={100}
              className="mt-2"
              required
            />
          </div>
          <div>
            <Label>Time Limit (minutes)</Label>
            <Input
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              min={1}
              className="mt-2"
              required
            />
          </div>
        </>
      )}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <Button type="submit" disabled={loading}>
        {loading ? "Adding..." : `Add ${quizType === 'PRACTICE' ? 'Practice Questions' : 'Assessment Quiz'}`}
      </Button>
    </form>
  );
}

// QuizQuestionSelector: Select module questions to add to a quiz
function QuizQuestionSelector({
  moduleQuestions,
  quiz,
  onSuccess,
}: {
  moduleQuestions: Array<{
    id: string;
    question: string;
    type?: string;
    options?: string[];
    correct?: number;
  }>;
  quiz: Quiz;
  onSuccess: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleToggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  };

  const handleAdd = async () => {
    setLoading(true);
    setError("");
    try {
      for (const qId of selected) {
        const q = moduleQuestions.find((q) => q.id === qId);
        if (!q) continue;
        await fetch("/api/admin/quiz/question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quizId: quiz.id,
            type: q.type,
            question: q.question,
            options: q.options,
            correct: q.correct,
          }),
        });
      }
      onSuccess();
    } catch {
      setError("Failed to add questions");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold">Select questions to add to this quiz:</h4>
      <div className="space-y-2">
        {moduleQuestions.map((q) => (
          <label key={q.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.includes(q.id)}
              onChange={() => handleToggle(q.id)}
            />
            <span>{q.question}</span>
          </label>
        ))}
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <Button onClick={handleAdd} disabled={loading || selected.length === 0}>
        {loading ? "Adding..." : "Add Selected Questions"}
      </Button>
    </div>
  );
}
