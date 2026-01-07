import React from "react";
import Nav from "../components/Nav";

export default function About() {
  return (
    <div>
      <Nav />
      <div className="bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              About AppTracker
            </h1>
            <p className="text-xl text-gray-600">
              Making job search management simple and effective
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Our Mission
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              Job searching can be overwhelming. With dozens of applications to
              track, multiple stages of interviews, and countless deadlines,
              it's easy to lose organization. AppTracker was built to solve this
              problem.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              We believe every job seeker deserves a simple, powerful tool to
              manage their search journey. Whether you're applying to 5 jobs or
              50, AppTracker helps you stay organized, focused, and on top of
              every opportunity.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Why AppTracker?
            </h2>
            <ul className="space-y-3 text-gray-700 text-lg">
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-3">✓</span>
                <span>
                  <strong>All-in-One Solution:</strong> Track applications,
                  manage interviews, set reminders, and view analytics in one
                  place
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-3">✓</span>
                <span>
                  <strong>Easy to Use:</strong> Intuitive interface that
                  requires no learning curve
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-3">✓</span>
                <span>
                  <strong>Completely Free:</strong> No hidden fees, no premium
                  tiers. Everything is available to everyone
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-3">✓</span>
                <span>
                  <strong>Secure & Private:</strong> Your data is encrypted and
                  never shared
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-3">✓</span>
                <span>
                  <strong>Built by Job Seekers:</strong> Created with insights
                  from people who've been in your shoes
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-lg p-8 text-center">
            <p className="text-gray-700 text-lg mb-6">
              Join hundreds of job seekers already using AppTracker to land
              their dream jobs
            </p>
            <a
              href="/signup"
              className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Your Free Account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
