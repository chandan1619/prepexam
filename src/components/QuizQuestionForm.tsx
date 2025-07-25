import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Check } from "lucide-react";

interface Question {
  id: string;
  question: string;
  type: "multiple-choice" | "true-false" | "essay" | "fill-blank";
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuizQuestionFormProps {
  onAddQuestion: (question: Question) => void;
  onCancel: () => void;
}

export function QuizQuestionForm({
  onAddQuestion,
  onCancel,
}: QuizQuestionFormProps) {
  const [questionData, setQuestionData] = useState({
    question: "",
    type: "multiple-choice" as Question["type"],
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
  });

  const addOption = () => {
    if (questionData.options.length < 6) {
      setQuestionData((prev) => ({
        ...prev,
        options: [...prev.options, ""],
      }));
    }
  };

  const removeOption = (index: number) => {
    if (questionData.options.length > 2) {
      setQuestionData((prev) => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    setQuestionData((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }));
  };

  const setCorrectAnswer = (answer: string) => {
    setQuestionData((prev) => ({ ...prev, correctAnswer: answer }));
  };

  const handleSubmit = () => {
    if (!questionData.question.trim()) {
      alert("Please enter a question");
      return;
    }

    if (!questionData.correctAnswer.trim()) {
      alert("Please set a correct answer");
      return;
    }

    if (questionData.type === "multiple-choice") {
      const validOptions = questionData.options.filter((opt) => opt.trim());
      if (validOptions.length < 2) {
        alert("Please provide at least 2 options");
        return;
      }
      if (!validOptions.includes(questionData.correctAnswer)) {
        alert("Correct answer must be one of the options");
        return;
      }
    }

    const question: Question = {
      id: Date.now().toString(),
      question: questionData.question,
      type: questionData.type,
      options:
        questionData.type === "multiple-choice"
          ? questionData.options.filter((opt) => opt.trim())
          : undefined,
      correctAnswer: questionData.correctAnswer,
      explanation: questionData.explanation,
    };

    onAddQuestion(question);
  };

  return (
    <Card className="shadow-md border-0">
      <CardHeader>
        <CardTitle className="text-base">Add Quiz Question</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="question-text">Question</Label>
          <Textarea
            id="question-text"
            value={questionData.question}
            onChange={(e) =>
              setQuestionData((prev) => ({ ...prev, question: e.target.value }))
            }
            placeholder="Enter your question..."
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="question-type">Question Type</Label>
          <select
            id="question-type"
            value={questionData.type}
            onChange={(e) =>
              setQuestionData((prev) => ({
                ...prev,
                type: e.target.value as Question["type"],
                correctAnswer: "",
                options:
                  e.target.value === "multiple-choice" ? ["", "", "", ""] : [],
              }))
            }
            className="mt-2 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="multiple-choice">Multiple Choice</option>
            <option value="true-false">True/False</option>
            <option value="essay">Essay</option>
            <option value="fill-blank">Fill in the Blank</option>
          </select>
        </div>

        {questionData.type === "multiple-choice" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Options</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addOption}
                disabled={questionData.options.length >= 6}
              >
                <Plus className="h-4 w-4" />
                Add Option
              </Button>
            </div>
            {questionData.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  variant={
                    questionData.correctAnswer === option && option.trim()
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => setCorrectAnswer(option)}
                  disabled={!option.trim()}
                  className="min-w-10"
                >
                  <Check className="h-4 w-4" />
                </Button>
                {questionData.options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="min-w-10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {questionData.correctAnswer && (
              <Badge variant="default" className="mt-2">
                Correct Answer: {questionData.correctAnswer}
              </Badge>
            )}
          </div>
        )}

        {questionData.type === "true-false" && (
          <div>
            <Label>Correct Answer</Label>
            <div className="flex gap-2 mt-2">
              <Button
                variant={
                  questionData.correctAnswer === "True" ? "default" : "outline"
                }
                onClick={() => setCorrectAnswer("True")}
              >
                True
              </Button>
              <Button
                variant={
                  questionData.correctAnswer === "False" ? "default" : "outline"
                }
                onClick={() => setCorrectAnswer("False")}
              >
                False
              </Button>
            </div>
          </div>
        )}

        {(questionData.type === "essay" ||
          questionData.type === "fill-blank") && (
          <div>
            <Label htmlFor="correct-answer">Expected Answer</Label>
            <Textarea
              id="correct-answer"
              value={questionData.correctAnswer}
              onChange={(e) =>
                setQuestionData((prev) => ({
                  ...prev,
                  correctAnswer: e.target.value,
                }))
              }
              placeholder="Enter the expected answer or key points..."
              className="mt-2"
            />
          </div>
        )}

        <div>
          <Label htmlFor="explanation">Explanation</Label>
          <Textarea
            id="explanation"
            value={questionData.explanation}
            onChange={(e) =>
              setQuestionData((prev) => ({
                ...prev,
                explanation: e.target.value,
              }))
            }
            placeholder="Explain why this is the correct answer..."
            className="mt-2"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSubmit}>Add Question</Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
