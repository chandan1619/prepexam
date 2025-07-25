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
} from "lucide-react";
import RichTextEditor from "./RichTextEditor";
import { QuizQuestionForm } from "./QuizQuestionForm";

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
  correctAnswer: string;
  explanation: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
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
}

interface Module {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
  questions: Question[];
  quizzes: Quiz[];
  previousYearQuestions: PreviousYearQuestion[];
  moduleQuestions: any[]; // Added for standalone questions
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

  // Topic Management
  const [newTopic, setNewTopic] = useState({
    title: "",
    content: "",
    duration: "",
  });

  const addTopic = () => {
    if (!newTopic.title.trim()) {
      alert("Please enter a topic title");
      return;
    }

    const topic: Topic = {
      id: Date.now().toString(),
      ...newTopic,
    };

    onModuleUpdate({
      ...module,
      topics: [...module.topics, topic],
    });

    setNewTopic({ title: "", content: "", duration: "" });
    setIsAddingContent(null);
  };

  const deleteTopic = (topicId: string) => {
    onModuleUpdate({
      ...module,
      topics: module.topics?.filter((t) => t.id !== topicId),
    });
  };

  // Question Management
  const addQuestion = (question: Question) => {
    onModuleUpdate({
      ...module,
      questions: [...module.questions, question],
    });
    setIsAddingContent(null);
  };

  const deleteQuestion = (questionId: string) => {
    onModuleUpdate({
      ...module,
      questions: module.questions?.filter((q) => q.id !== questionId),
    });
  };

  // Quiz Management
  const [newQuiz, setNewQuiz] = useState({
    title: "",
    description: "",
    timeLimit: 30,
    passingScore: 70,
  });
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  const addQuiz = () => {
    if (!newQuiz.title.trim()) {
      alert("Please enter a quiz title");
      return;
    }

    const quiz: Quiz = {
      id: Date.now().toString(),
      ...newQuiz,
      questions: [],
    };

    onModuleUpdate({
      ...module,
      quizzes: [...module.quizzes, quiz],
    });

    setNewQuiz({ title: "", description: "", timeLimit: 30, passingScore: 70 });
    setIsAddingContent(null);
  };

  const deleteQuiz = (quizId: string) => {
    onModuleUpdate({
      ...module,
      quizzes: module.quizzes.filter((q) => q.id !== quizId),
    });
  };

  const addQuestionToQuiz = (quizId: string, question: Question) => {
    onModuleUpdate({
      ...module,
      quizzes: module.quizzes.map((quiz) =>
        quiz.id === quizId
          ? { ...quiz, questions: [...quiz.questions, question] }
          : quiz
      ),
    });
  };

  const removeQuestionFromQuiz = (quizId: string, questionId: string) => {
    onModuleUpdate({
      ...module,
      quizzes: module.quizzes.map((quiz) =>
        quiz.id === quizId
          ? {
              ...quiz,
              questions: quiz.questions.filter((q) => q.id !== questionId),
            }
          : quiz
      ),
    });
  };

  // Previous Year Questions Management
  const [newPrevQuestion, setNewPrevQuestion] = useState({
    year: new Date().getFullYear(),
    question: "",
    solution: "",
    difficulty: "medium" as PreviousYearQuestion["difficulty"],
    marks: 1,
  });

  const addPreviousYearQuestion = () => {
    if (!newPrevQuestion.question.trim()) {
      alert("Please enter a question");
      return;
    }

    const prevQuestion: PreviousYearQuestion = {
      id: Date.now().toString(),
      ...newPrevQuestion,
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
        {/* Quiz Question Selector for adding questions to the quiz */}
        <QuizQuestionSelector
          moduleQuestions={module.moduleQuestions}
          quiz={selectedQuiz}
          onSuccess={() => window.location.reload()}
        />
        {/* Existing quiz questions display (optional) */}
        <div className="space-y-3">
          <h4 className="font-medium mt-6">Questions in this Quiz</h4>
          {selectedQuiz.questions && selectedQuiz.questions.length > 0 ? (
            selectedQuiz.questions.map((question: any, index: number) => (
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
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="topics" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Topics ({module.topics?.length})
        </TabsTrigger>
        <TabsTrigger value="questions" className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          Questions ({module.questions?.length})
        </TabsTrigger>
        <TabsTrigger value="quizzes" className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          Quizzes ({module.quizzes.length})
        </TabsTrigger>
        <TabsTrigger value="previous" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
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

        {isAddingContent === "topic" && (
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="text-base">Add New Topic</CardTitle>
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
                <Button onClick={addTopic}>Add Topic</Button>
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
          {module.topics?.map((topic) => (
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
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteTopic(topic.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {module.topics?.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No topics added yet. Create your first topic to get started.
            </div>
          )}
        </div>
      </TabsContent>

      {/* Questions Tab */}
      <TabsContent value="questions" className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Questions</h3>
          <Button size="sm" onClick={() => setIsAddingContent("question")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>

        {isAddingContent === "question" && (
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="text-base">Add New Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StandaloneQuestionForm
                moduleId={module.id}
                onSuccess={() => {
                  setIsAddingContent(null);
                  if (typeof window !== "undefined") window.location.reload();
                }}
              />
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {module.moduleQuestions?.map((question: any) => (
            <Card key={question.id} className="shadow-md border-0">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {question.question}
                    </h4>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {question.type.replace("-", " ")}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {Array.isArray(question.options) &&
                        question.options.length > 0
                          ? question.options[question.correct]
                          : question.correct === 1
                          ? "True"
                          : "False"}
                      </Badge>
                    </div>
                  </div>
                  {/* Optionally add delete button here */}
                </div>
              </CardContent>
            </Card>
          ))}
          {(!module.moduleQuestions || module.moduleQuestions.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              No questions added yet. Create your first question to get started.
            </div>
          )}
        </div>
      </TabsContent>

      {/* Quizzes Tab */}
      <TabsContent value="quizzes" className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Quizzes</h3>
          <Button size="sm" onClick={() => setIsAddingContent("quiz")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Quiz
          </Button>
        </div>

        {isAddingContent === "quiz" && (
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="text-base">Create New Quiz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AddQuizForm
                moduleId={module.id}
                onSuccess={() => {
                  setIsAddingContent(null);
                  if (typeof window !== "undefined") window.location.reload();
                }}
              />
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {module.quizzes.map((quiz) => (
            <Card
              key={quiz.id}
              className="shadow-md border-0 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <CardContent
                className="p-4"
                onClick={() => setSelectedQuiz(quiz)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {quiz.title}
                    </h4>
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
          {module.quizzes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No quizzes created yet. Create your first quiz to get started.
            </div>
          )}
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
              <div className="grid grid-cols-3 gap-4">
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
                    <h4 className="font-semibold text-gray-900">
                      {question.question}
                    </h4>
                    {question.solution && (
                      <p className="text-sm text-gray-600 mt-2">
                        {question.solution}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {question.year}
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
  );
}

// StandaloneQuestionForm: Add a standalone question to a module
function StandaloneQuestionForm({
  moduleId,
  onSuccess,
}: {
  moduleId: string;
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
      const res = await fetch("/api/admin/module/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId,
          type,
          question,
          options: type === "mcq" ? options : [],
          correct: type === "mcq" ? correct : correct, // 0/1 for true/false
        }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add question");
      }
    } catch (err) {
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
  onSuccess,
}: {
  moduleId: string;
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
          passingMark,
          timeLimit,
        }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add quiz");
      }
    } catch (err) {
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
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <Button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Quiz"}
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
  moduleQuestions: any[];
  quiz: any;
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
    } catch (err) {
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
