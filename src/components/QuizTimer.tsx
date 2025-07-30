"use client";
import { useEffect, useState, useCallback } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface QuizTimerProps {
  timeLimit: number; // in minutes
  onTimeUp: () => void;
  isActive: boolean;
  onTimeUpdate?: (remainingTime: number) => void;
}

export default function QuizTimer({ 
  timeLimit, 
  onTimeUp, 
  isActive, 
  onTimeUpdate 
}: QuizTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60); // Convert to seconds
  const [isWarning, setIsWarning] = useState(false);

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;
        
        // Call onTimeUpdate if provided
        if (onTimeUpdate) {
          onTimeUpdate(newTime);
        }
        
        // Set warning when 5 minutes or less remaining
        if (newTime <= 300 && !isWarning) {
          setIsWarning(true);
        }
        
        // Time's up
        if (newTime <= 0) {
          onTimeUp();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onTimeUp, onTimeUpdate, isWarning]);

  // Reset timer when timeLimit changes
  useEffect(() => {
    setTimeRemaining(timeLimit * 60);
    setIsWarning(false);
  }, [timeLimit]);

  const getTimerColor = () => {
    if (timeRemaining <= 60) return "text-red-600"; // Last minute
    if (timeRemaining <= 300) return "text-orange-600"; // Last 5 minutes
    return "text-blue-600";
  };

  const getBackgroundColor = () => {
    if (timeRemaining <= 60) return "bg-red-50 border-red-200"; // Last minute
    if (timeRemaining <= 300) return "bg-orange-50 border-orange-200"; // Last 5 minutes
    return "bg-blue-50 border-blue-200";
  };

  const getProgressColor = () => {
    if (timeRemaining <= 60) return "bg-red-500"; // Last minute
    if (timeRemaining <= 300) return "bg-orange-500"; // Last 5 minutes
    return "bg-blue-500";
  };

  const progressPercentage = ((timeLimit * 60 - timeRemaining) / (timeLimit * 60)) * 100;

  if (!isActive) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl border-2 shadow-lg backdrop-blur-sm ${getBackgroundColor()}`}>
      <div className="flex items-center gap-3">
        {isWarning ? (
          <AlertTriangle className={`h-6 w-6 ${getTimerColor()} animate-pulse`} />
        ) : (
          <Clock className={`h-6 w-6 ${getTimerColor()}`} />
        )}
        <div className="flex flex-col">
          <div className="text-xs text-gray-600 font-medium">Time Remaining</div>
          <div className={`text-xl font-bold ${getTimerColor()}`}>
            {formatTime(timeRemaining)}
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-3 w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ease-linear ${getProgressColor()}`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      {/* Warning message */}
      {isWarning && (
        <div className="mt-2 text-xs text-center font-medium text-orange-700">
          {timeRemaining <= 60 ? "Last minute!" : "Hurry up!"}
        </div>
      )}
    </div>
  );
}