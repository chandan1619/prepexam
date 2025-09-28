import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Join Edmissions!
          </h1>
          <p className="text-gray-600">
            Start your journey to become a Computer Science teacher
          </p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-2xl border-0 bg-white/90 backdrop-blur-sm",
            },
          }}
          signInUrl="/sign-in"
        />
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Already have an account?{" "}
            <a
              href="/sign-in"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}