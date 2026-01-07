import React from "react";
import {
  BarChart3,
  FileText,
  SquareKanban,
  Bell,
  Upload,
  Shield,
} from "lucide-react";
import Nav from "../components/Nav";

export default function Features() {
  const features = [
    {
      icon: FileText,
      title: "Track Applications",
      description:
        "Keep all your job applications in one place with detailed notes, status updates, and timelines.",
    },
    {
      icon: SquareKanban,
      title: "Kanban Board",
      description:
        "Visualize your job search progress with an intuitive kanban board. Drag and drop to update statuses.",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description:
        "Get insights into your job search with detailed analytics and statistics about your applications.",
    },
    {
      icon: Bell,
      title: "Reminders",
      description:
        "Never miss a follow-up. Set reminders for application deadlines and interview dates.",
    },
    {
      icon: Upload,
      title: "Bulk Import",
      description:
        "Easily import job applications from CSV files. Save time on manual data entry.",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description:
        "Your data is encrypted and secure. We never share your information with third parties.",
    },
  ];

  return (
    <div>
      <Nav />
      <div className="bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Job Seekers
            </h1>
            <p className="text-xl text-gray-600">
              Everything you need to organize and manage your job search
              effectively
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-16">
            <p className="text-gray-600 mb-6">
              Ready to organize your job search?
            </p>
            <a
              href="/signup"
              className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started For Free
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
