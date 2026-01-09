import { Link, Navigate } from "react-router-dom";
import {
  FileText,
  SquareKanban,
  BarChart3,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";

export default function Homepage() {
  const { user, isLoading } = useAuth();

  // Redirect to dashboard if user is already logged in
  if (!isLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const highlights = [
    {
      icon: FileText,
      title: "Track Everything",
      description: "Keep all your job applications organized in one place",
    },
    {
      icon: SquareKanban,
      title: "Visualize Progress",
      description: "See your applications flow through each stage visually",
    },
    {
      icon: BarChart3,
      title: "Get Insights",
      description: "Analyze your job search with detailed analytics",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Nav />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32">
            <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8 lg:pt-24">
              <div className="text-center">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Organize Your</span>
                  <span className="block text-blue-600">Job Search</span>
                </h1>
                <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                  Stop juggling spreadsheets. Track applications, manage
                  interviews, and land your dream job with AppTracker –
                  completely free.
                </p>
                <div className="mt-10 flex justify-center gap-4">
                  <Link
                    to="/signup"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                  <Link
                    to="/features"
                    className="inline-flex items-center px-6 py-3 border-2 border-blue-600 text-base font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 transition-colors"
                  >
                    Explore Features
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 right-0 -z-10 transform translate-x-1/2 -translate-y-1/4 opacity-10">
          <svg
            className="w-96 h-96"
            fill="currentColor"
            viewBox="0 0 404 404"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="202" cy="202" r="202" fill="blue" />
          </svg>
        </div>
      </div>

      {/* Problem & Solution Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Job Search Getting Overwhelming?
              </h2>
              <p className="text-gray-600 text-lg mb-4">
                Between multiple applications, different stages of interviews,
                email follow-ups, and deadlines – it's easy to lose track.
              </p>
              <p className="text-gray-600 text-lg">
                AppTracker is designed to give you complete visibility and
                control over your entire job search journey.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="font-semibold text-gray-900 mb-4">
                What you get with AppTracker:
              </h3>
              <ul className="space-y-3">
                {[
                  "Track all applications in one place",
                  "Set reminders for important dates",
                  "Visualize progress with kanban board",
                  "Analyze your job search patterns",
                  "Import applications from CSV",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features Highlight */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose AppTracker?
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to succeed in your job search
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {highlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-center mb-4">
                    <div className="bg-blue-100 rounded-full p-4">
                      <Icon className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to take control of your job search?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join hundreds of job seekers already using AppTracker. It's free,
            easy, and secure.
          </p>
          <Link
            to="/signup"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            Get Started Now
          </Link>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 border-t">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-4">
              Have questions? Check out our{" "}
              <Link
                to="/about"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                About
              </Link>{" "}
              and{" "}
              <Link
                to="/features"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Features
              </Link>{" "}
              pages
            </p>
          </div>
          <div className="text-center border-t pt-8">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                <Link
                  to="/privacy-policy"
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Privacy Policy
                </Link>
                {" | "}
                <Link
                  to="/terms-of-service"
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Terms of Service
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
