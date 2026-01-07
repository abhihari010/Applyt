import React from "react";
import Nav from "../components/Nav";

export default function TermsOfService() {
  return (
    <div>
      <Nav />
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Terms of Service
          </h1>
          <p className="text-gray-600 mb-8">Last updated: January 7, 2026</p>

          <div className="space-y-8 text-gray-700">
            {/* Agreement */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1. Agreement to Terms
              </h2>
              <p className="mb-3">
                By accessing and using AppTracker ("Service"), you accept and
                agree to be bound by the terms and provision of this agreement.
                If you do not agree to abide by the above, please do not use
                this service.
              </p>
            </section>

            {/* Use License */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. Use License
              </h2>
              <p className="mb-3">
                Permission is granted to temporarily download one copy of the
                materials (information or software) on AppTracker for personal,
                non-commercial transitory viewing only. This is the grant of a
                license, not a transfer of title, and under this license you may
                not:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Modifying or copying the materials</li>
                <li>
                  Using the materials for any commercial purpose or for any
                  public display
                </li>
                <li>
                  Attempting to reverse engineer any software contained on
                  AppTracker
                </li>
                <li>
                  Transferring the materials to another person or "mirroring"
                  the materials on any other server
                </li>
                <li>
                  Removing any copyright or other proprietary notations from the
                  materials
                </li>
                <li>
                  Transferring the materials to another person or "mirroring"
                  the materials on any other server
                </li>
                <li>
                  Accessing any software or data for any purpose other than the
                  intended use
                </li>
              </ul>
            </section>

            {/* Disclaimer */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. Disclaimer
              </h2>
              <p className="mb-3">
                The materials on AppTracker are provided on an 'as is' basis.
                AppTracker makes no warranties, expressed or implied, and hereby
                disclaims and negates all other warranties including, without
                limitation, implied warranties or conditions of merchantability,
                fitness for a particular purpose, or non-infringement of
                intellectual property or other violation of rights.
              </p>
              <p>
                Further, AppTracker does not warrant or make any representations
                concerning the accuracy, likely results, or reliability of the
                use of the materials on its website or otherwise relating to
                such materials or on any sites linked to this site.
              </p>
            </section>

            {/* Limitations */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Limitations
              </h2>
              <p>
                In no event shall AppTracker or its suppliers be liable for any
                damages (including, without limitation, damages for loss of data
                or profit, or due to business interruption) arising out of the
                use or inability to use the materials on AppTracker, even if
                AppTracker or an authorized representative has been notified
                orally or in writing of the possibility of such damage.
              </p>
            </section>

            {/* Accuracy of Materials */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Accuracy of Materials
              </h2>
              <p>
                The materials appearing on AppTracker could include technical,
                typographical, or photographic errors. AppTracker does not
                warrant that any of the materials on its website are accurate,
                complete, or current. AppTracker may make changes to the
                materials contained on its website at any time without notice.
              </p>
            </section>

            {/* Materials and Content */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. Materials and Content
              </h2>
              <p className="mb-3">
                AppTracker does not review all materials posted to the website,
                and does not warrant the legality, accuracy, or decency of such
                materials.
              </p>
              <p className="mb-3">
                Your use of AppTracker and upload of materials to AppTracker is
                entirely at your own risk, for which AppTracker will have no
                liability. AppTracker reserves the right to disapprove of any
                materials posted to the website and to remove such materials
                without notice.
              </p>
              <p>
                You agree that all materials you upload or input to AppTracker
                will be your own original content and not violate any
                third-party rights.
              </p>
            </section>

            {/* User Accounts */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                7. User Accounts
              </h2>
              <p className="mb-3">
                When you create an account on AppTracker, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Maintain the confidentiality of your password</li>
                <li>
                  Accept responsibility for all activities under your account
                </li>
                <li>Not share your account credentials with others</li>
                <li>Notify us immediately of any unauthorized account use</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            {/* User Conduct */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                8. User Conduct
              </h2>
              <p className="mb-3">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Harass, threaten, or abuse other users</li>
                <li>Post defamatory, obscene, or abusive material</li>
                <li>Attempt to gain unauthorized access to the Service</li>
                <li>Use the Service for any illegal purpose</li>
                <li>Spam or send unsolicited messages</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                9. Termination
              </h2>
              <p className="mb-3">
                AppTracker reserves the right to terminate or suspend your
                account and access to the Service at any time, without notice,
                for conduct that we believe violates these Terms of Service or
                is harmful to other users, us, or third parties.
              </p>
              <p>
                You may terminate your account at any time through your account
                settings.
              </p>
            </section>

            {/* Data Loss */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                10. Data Loss and Backup
              </h2>
              <p className="mb-3">
                While we strive to maintain the integrity of your data,
                AppTracker is not responsible for data loss due to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Hardware or software failures</li>
                <li>Acts of God or natural disasters</li>
                <li>Your failure to maintain backups of your data</li>
                <li>Service interruptions or maintenance</li>
              </ul>
              <p className="mt-4">
                We recommend you regularly download or export your data for
                backup purposes.
              </p>
            </section>

            {/* Third-Party Links */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                11. Third-Party Links
              </h2>
              <p className="mb-3">
                AppTracker may contain links to third-party websites. We are not
                responsible for the content, accuracy, or practices of these
                external sites. Your use of third-party websites is at your own
                risk and subject to their terms of service.
              </p>
            </section>

            {/* OAuth2 and Third-Party Services */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                12. OAuth2 and Third-Party Authentication
              </h2>
              <p className="mb-3">
                AppTracker allows you to authenticate using Google and GitHub
                OAuth2. By using these authentication methods, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Grant AppTracker permission to access your name and email
                  address
                </li>
                <li>Comply with Google's and GitHub's terms of service</li>
                <li>
                  Understand that AppTracker is not responsible for their
                  services
                </li>
                <li>
                  Accept that you can revoke AppTracker's access at any time
                  through your Google or GitHub account settings
                </li>
              </ul>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                13. Changes to Terms of Service
              </h2>
              <p className="mb-3">
                AppTracker may revise these Terms of Service at any time without
                notice. We will update the "Last updated" date above. By
                continuing to use the Service after any such revision, you agree
                to be bound by the revised terms.
              </p>
              <p>
                If you disagree with the new terms, you may terminate your
                account.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                14. Governing Law
              </h2>
              <p>
                These Terms of Service and any separate agreements we provide
                are governed by and construed in accordance with the laws of the
                jurisdiction in which AppTracker operates, without regard to its
                conflict of law provisions.
              </p>
            </section>

            {/* Contact Us */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                15. Contact Us
              </h2>
              <p className="mb-3">
                If you have questions about these Terms of Service, please
                contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-2">
                  <strong>Email:</strong> support@apptracker.com
                </p>
                <p>
                  <strong>Response Time:</strong> We will respond to your
                  inquiry within 7 business days.
                </p>
              </div>
            </section>

            {/* Entire Agreement */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                16. Entire Agreement
              </h2>
              <p>
                These Terms of Service, together with our Privacy Policy,
                constitute the entire agreement between you and AppTracker
                regarding the use of the Service and supersede all prior and
                contemporaneous agreements, representations, and understandings.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
