import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome Back!
          </h1>
          <p className="text-gray-600">
            Sign in to continue your Computer Science teaching exam preparation
          </p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-2xl border-0 bg-white/90 backdrop-blur-sm",
            }
          }}
          signUpUrl="/sign-up"
        />
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>New to PrepExam? <a href="/sign-up" className="text-blue-600 hover:text-blue-700 font-semibold">Create your free account</a></p>
        </div>
      </div>
    </div>
  )
}