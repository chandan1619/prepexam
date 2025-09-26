import Link from "next/link";
import { SpinnerLoader } from "@/components/ui/loader";

type Course = {
  id: string;
  title: string;
  description: string;
  slug?: string;
  imageUrl?: string;
  category?: string;
  level?: string;
  priceInINR: number;
  modules: Array<{ id: string }>;
};

async function getCourses(): Promise<Course[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/courses`, {
      next: { revalidate: 300 } // Revalidate every 5 minutes
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch courses');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

export default async function CoursesSection() {
  const courses = await getCourses();

  if (courses.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-bold text-gray-900 mb-4">
          Available Courses
        </h3>
        <p className="text-lg text-gray-600">
          Start your preparation with our expertly crafted courses
        </p>
      </div>
      <div
        className={`grid gap-8 ${
          courses.slice(0, 3).length === 1
            ? "justify-center"
            : courses.slice(0, 3).length === 2
            ? "md:grid-cols-2 justify-center max-w-4xl mx-auto"
            : "md:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {courses.slice(0, 3).map((course) => (
          <div
            key={course.id}
            className={`group bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-blue-200 transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] ${
              courses.slice(0, 3).length === 1
                ? "max-w-md w-full"
                : ""
            }`}
          >
            {course.imageUrl ? (
              <div className="relative h-56 overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                    <svg
                      className="w-5 h-5 text-blue-600"
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
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative h-56 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700">
                <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold relative z-10">
                  {course.title}
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20"></div>
              </div>
            )}

            <div className="p-8">
              <div className="flex items-center gap-3 mb-5">
                <span className="inline-flex items-center gap-1 py-2 px-4 text-xs font-bold bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 rounded-full border border-blue-200">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {course.category || "Government"}
                </span>
                <span className="inline-flex items-center gap-1 py-2 px-4 text-xs font-bold bg-gradient-to-r from-green-100 to-green-50 text-green-700 rounded-full border border-green-200">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {course.modules.length} Modules
                </span>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
                {course.title}
              </h3>

              <p className="text-gray-600 mb-6 line-clamp-2 leading-relaxed">
                {course.description}
              </p>

              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                  {course.priceInINR === 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        Free
                      </span>
                      <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                        LIMITED TIME
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500 line-through font-medium">
                          ₹999
                        </span>
                        <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          ₹499
                        </span>
                      </div>
                      <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-2 rounded-xl text-sm font-bold shadow-lg">
                        50% OFF
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-gray-500">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium">
                    Self-paced
                  </span>
                </div>
              </div>

              <Link href={`/exams/${course.slug || course.id}`}>
                <button className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/30 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer relative overflow-hidden group">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    View Course Details
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
      {courses.length > 3 && (
        <div className="text-center mt-8">
          <Link href="/exams">
            <button className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 cursor-pointer">
              View All Courses
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}