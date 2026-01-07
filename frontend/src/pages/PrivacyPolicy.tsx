import React from "react";
import Nav from "../components/Nav";

export default function PrivacyPolicy() {
  return (
    <div>
      <Nav />
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Privacy Policy
          </h1>
          <p className="text-gray-600 mb-8">Last updated: January 7, 2026</p>

          <div className="space-y-8 text-gray-700">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1. Introduction
              </h2>
              <p className="mb-3">
                AppTracker ("we," "our," or "us") is committed to protecting
                your privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our
                website and application (the "Service").
              </p>
              <p>
                Please read this Privacy Policy carefully. If you do not agree
                with our policies and practices, please do not use our Service.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. Information We Collect
              </h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">
                2.1 Information You Provide Directly
              </h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>
                  <strong>Registration Information:</strong> When you create an
                  account, we collect your name, email address, and password.
                </li>
                <li>
                  <strong>Job Application Data:</strong> Information you enter
                  about your job applications, including company names,
                  positions, dates, status, notes, and attachments.
                </li>
                <li>
                  <strong>Contact Information:</strong> Phone numbers,
                  addresses, and contact details for companies or recruiters you
                  add to the app.
                </li>
                <li>
                  <strong>Support Communications:</strong> Any messages,
                  feedback, or inquiries you send to our support team.
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">
                2.2 Information from OAuth Providers
              </h3>
              <p className="mb-3">
                If you choose to sign up or log in using Google or GitHub OAuth,
                we collect:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Your name</li>
                <li>Your email address</li>
                <li>Your profile picture (if you choose to share it)</li>
                <li>Your unique user ID from the OAuth provider</li>
              </ul>
              <p className="text-sm text-gray-600">
                We only request the minimum scopes necessary to create and
                maintain your account. We do not request access to your private
                repositories, personal files, or other sensitive information.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">
                2.3 Automatically Collected Information
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Device Information:</strong> IP address, browser type,
                  operating system, and device identifiers.
                </li>
                <li>
                  <strong>Usage Data:</strong> Pages visited, features used,
                  time spent in the app, and other interaction data.
                </li>
                <li>
                  <strong>Cookies and Similar Technologies:</strong> We use
                  cookies to maintain your session and remember your
                  preferences.
                </li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. How We Use Your Information
              </h2>
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Create and maintain your account</li>
                <li>
                  Provide the core functionality of AppTracker (tracking job
                  applications, managing kanban boards, etc.)
                </li>
                <li>Send you service-related updates and notifications</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Analyze app usage to improve our Service</li>
                <li>Comply with legal obligations</li>
                <li>Prevent fraud and maintain security</li>
              </ul>
            </section>

            {/* Data Storage and Security */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Data Storage and Security
              </h2>
              <p className="mb-3">
                <strong>Data Storage:</strong> Your data is stored securely on
                our servers. We use industry-standard encryption to protect your
                information in transit and at rest.
              </p>
              <p className="mb-3">
                <strong>Retention Period:</strong> We retain your personal
                information for as long as your account is active or as needed
                to provide our Service. If you delete your account, we will
                remove your personal information within 30 days, except where we
                are required to retain it for legal or legitimate business
                purposes.
              </p>
              <p className="mb-3">
                <strong>Security Measures:</strong> We implement administrative,
                technical, and physical safeguards to protect your information.
                However, no method of transmission over the internet is 100%
                secure, and we cannot guarantee absolute security.
              </p>
            </section>

            {/* Information Sharing */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Information Sharing and Disclosure
              </h2>
              <p className="mb-4">
                <strong>We do not sell your personal information.</strong> We
                may share your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Service Providers:</strong> With third-party vendors
                  who assist us in operating our website and app (hosting
                  providers, analytics services, payment processors).
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law or
                  when we believe in good faith that disclosure is necessary to
                  protect our rights or the rights of others.
                </li>
                <li>
                  <strong>Business Transfers:</strong> In connection with a
                  merger, acquisition, or sale of assets.
                </li>
              </ul>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. Your Privacy Rights
              </h2>
              <p className="mb-4">You have the following rights:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Access:</strong> You can access your personal
                  information in your account settings at any time.
                </li>
                <li>
                  <strong>Correction:</strong> You can update or correct your
                  personal information through your account settings.
                </li>
                <li>
                  <strong>Deletion:</strong> You can request deletion of your
                  account and associated personal information by contacting us
                  or using the delete account feature in your settings.
                </li>
                <li>
                  <strong>Export:</strong> You can request an export of your
                  data in a portable format.
                </li>
                <li>
                  <strong>Opt-out:</strong> You can opt out of certain data
                  collection practices through your account settings.
                </li>
              </ul>
            </section>

            {/* Google-Specific Disclosures */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                7. Google-Specific Disclosures
              </h2>
              <p className="mb-3">
                If you use Google OAuth to sign in to AppTracker, please note:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>
                  We use your Google data only to authenticate your account and
                  populate your profile information.
                </li>
                <li>
                  We do not access your Google Drive, Gmail, Calendar, or any
                  other Google services.
                </li>
                <li>
                  Your Google data is never shared with third parties for
                  advertising or marketing purposes.
                </li>
                <li>
                  We comply with Google's Limited Use requirements and use
                  Google user data only as described in this Privacy Policy.
                </li>
                <li>
                  You can revoke AppTracker's access to your Google account at
                  any time through your Google Account settings.
                </li>
              </ul>
            </section>

            {/* GitHub-Specific Disclosures */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                8. GitHub-Specific Disclosures
              </h2>
              <p className="mb-3">
                If you use GitHub OAuth to sign in to AppTracker, please note:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>
                  We use your GitHub data only to authenticate your account and
                  populate your profile information.
                </li>
                <li>
                  We do not access your repositories, code, or any other GitHub
                  content.
                </li>
                <li>
                  Your GitHub data is never shared with third parties for
                  advertising or marketing purposes.
                </li>
                <li>
                  You can revoke AppTracker's access to your GitHub account at
                  any time through your GitHub Account settings.
                </li>
              </ul>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                9. Children's Privacy
              </h2>
              <p>
                Our Service is not intended for children under the age of 13. We
                do not knowingly collect personal information from children
                under 13. If we become aware that a child under 13 has provided
                us with personal information, we will immediately delete such
                information and terminate the child's account.
              </p>
            </section>

            {/* Policy Changes */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                10. Changes to This Privacy Policy
              </h2>
              <p className="mb-3">
                We may update this Privacy Policy from time to time to reflect
                changes in our practices, technology, legal requirements, or
                other factors. We will notify you of material changes by
                updating the "Last updated" date above and, if the changes are
                significant, by sending you an email notification.
              </p>
              <p>
                Your continued use of the Service after changes are posted
                constitutes your acceptance of the revised Privacy Policy.
              </p>
            </section>

            {/* Contact Us */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                11. Contact Us
              </h2>
              <p className="mb-3">
                If you have questions or concerns about this Privacy Policy or
                our privacy practices, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-2">
                  <strong>Email:</strong> abhihari010@gmail.com
                </p>
                <p>
                  <strong>Response Time:</strong> We will respond to your
                  inquiry within 7 business days.
                </p>
              </div>
            </section>

            {/* Data Subject Rights */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                12. Data Subject Rights (GDPR, CCPA)
              </h2>
              <p className="mb-3">
                If you are located in the EU, UK, or California, you may have
                additional rights:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Right to be informed:</strong> Clear privacy policies
                  (this document)
                </li>
                <li>
                  <strong>Right of access:</strong> Access your personal data
                </li>
                <li>
                  <strong>Right to rectification:</strong> Correct inaccurate
                  data
                </li>
                <li>
                  <strong>Right to erasure:</strong> Request deletion of your
                  data
                </li>
                <li>
                  <strong>Right to restrict processing:</strong> Limit how we
                  use your data
                </li>
                <li>
                  <strong>Right to data portability:</strong> Receive your data
                  in a portable format
                </li>
                <li>
                  <strong>Right to object:</strong> Object to certain types of
                  processing
                </li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us using the
                information in Section 11.
              </p>
            </section>

            {/* Legal Attribution */}
            <section className="border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                13. Legal Attribution
              </h2>
              <p className="text-sm text-gray-600 mb-2">
                Google is a trademark of Google LLC.
              </p>
              <p className="text-sm text-gray-600">
                GitHub is a trademark of GitHub, Inc.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
