"use client";

import React from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <div className="container max-w-4xl mx-auto pt-24 pb-16 px-4 sm:px-6">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: May 16, 2025</p>

        <div className="space-y-8 text-lg">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="mb-4">
              Welcome to 2KCulture. We respect your privacy and are committed to
              protecting your personal data. This privacy policy will inform you
              about how we look after your personal data when you visit our
              website and tell you about your privacy rights and how the law
              protects you.
            </p>
            <p>
              This privacy policy applies to all users of our platform,
              including artists who upload content and listeners who stream
              music. Please read this privacy policy carefully to understand our
              practices regarding your personal data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              2. Information We Collect
            </h2>
            <p className="mb-4">
              We may collect, use, store, and transfer different kinds of
              personal data about you which we have grouped together as follows:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Identity Data</strong> includes first name, last name,
                username or similar identifier, artist name, and profile
                picture.
              </li>
              <li>
                <strong>Contact Data</strong> includes email address and, if
                provided, phone number.
              </li>
              <li>
                <strong>Technical Data</strong> includes internet protocol (IP)
                address, your login data, browser type and version, time zone
                setting and location, browser plug-in types and versions,
                operating system and platform, and other technology on the
                devices you use to access this website.
              </li>
              <li>
                <strong>Usage Data</strong> includes information about how you
                use our website, including songs streamed, playlists created,
                artists followed, and other interactions with the platform.
              </li>
              <li>
                <strong>Content Data</strong> includes music files, artwork, and
                metadata uploaded by artists.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              3. How We Use Your Information
            </h2>
            <p className="mb-4">
              We use your personal data for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To register you as a new user</li>
              <li>
                To provide and maintain our service, including processing
                uploaded content
              </li>
              <li>
                To manage your account and provide you with customer support
              </li>
              <li>To provide you with personalized music recommendations</li>
              <li>To analyze usage patterns and improve our platform</li>
              <li>
                To detect, prevent and address technical issues or fraudulent
                activities
              </li>
              <li>To calculate and distribute royalties to artists</li>
              <li>
                To communicate with you about updates, features, and promotional
                offers (with your consent)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              4. Cookies and Tracking Technologies
            </h2>
            <p className="mb-4">
              We use cookies and similar tracking technologies to track activity
              on our platform and store certain information. Cookies are files
              with a small amount of data which may include an anonymous unique
              identifier.
            </p>
            <p>
              You can instruct your browser to refuse all cookies or to indicate
              when a cookie is being sent. However, if you do not accept
              cookies, you may not be able to use some portions of our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p>
              We have implemented appropriate security measures to prevent your
              personal data from being accidentally lost, used, or accessed in
              an unauthorized way, altered, or disclosed. In addition, we limit
              access to your personal data to those employees, agents,
              contractors, and other third parties who have a business need to
              know.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
            <p>
              We will only retain your personal data for as long as necessary to
              fulfill the purposes we collected it for, including for the
              purposes of satisfying any legal, accounting, or reporting
              requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              7. Your Legal Rights
            </h2>
            <p className="mb-4">
              Under certain circumstances, you have rights under data protection
              laws in relation to your personal data, including the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Request access to your personal data</li>
              <li>Request correction of your personal data</li>
              <li>Request erasure of your personal data</li>
              <li>Object to processing of your personal data</li>
              <li>Request restriction of processing your personal data</li>
              <li>Request transfer of your personal data</li>
              <li>Right to withdraw consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              8. Changes to This Privacy Policy
            </h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page
              and updating the &quot;last updated&quot; date at the top of this
              page. You are advised to review this Privacy Policy periodically
              for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at{" "}
              <a
                href="mailto:privacy@2kculture.com"
                className="text-primary hover:underline"
              >
                privacy@2kculture.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
