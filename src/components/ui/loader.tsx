interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function Loader({ size = "md", className = "" }: LoaderProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div
      className={`animate-spin rounded-full border-blue-600 border-t-transparent ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="loading"
    />
  );
}

// Enhanced spinner with gradient and pulse effect
export function SpinnerLoader({ size = "md", className = "" }: LoaderProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-spin">
        <div className="absolute inset-1 rounded-full bg-white"></div>
      </div>
      <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse"></div>
    </div>
  );
}

// Full screen loading overlay
export function LoadingOverlay({ isVisible, message = "Loading...", size = "lg" }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm mx-4">
        <SpinnerLoader size={size} />
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">{message}</p>
          <p className="text-sm text-gray-500 mt-1">Please wait...</p>
        </div>
      </div>
    </div>
  );
}

// Inline loading state for buttons
export function ButtonLoader({ size = "sm" }: { size?: "sm" | "md" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-white border-t-transparent ${sizeClasses[size]}`} />
  );
}
