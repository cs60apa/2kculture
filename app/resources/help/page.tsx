"use client";

import React from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

export default function HelpCenterPage() {
  return (
    <>
      <Navbar />
      <div className="container max-w-4xl mx-auto pt-24 pb-16 px-4 sm:px-6">
        <h1 className="text-4xl font-bold mb-6">Help Center</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <div className="sticky top-24">
              <h3 className="text-lg font-medium mb-3">Topics</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#account"
                    className="text-primary hover:underline"
                  >
                    Account Management
                  </Link>
                </li>
                <li>
                  <Link href="#upload" className="text-primary hover:underline">
                    Uploading Music
                  </Link>
                </li>
                <li>
                  <Link
                    href="#playback"
                    className="text-primary hover:underline"
                  >
                    Playback Issues
                  </Link>
                </li>
                <li>
                  <Link
                    href="#payments"
                    className="text-primary hover:underline"
                  >
                    Payments & Royalties
                  </Link>
                </li>
                <li>
                  <Link
                    href="#contact"
                    className="text-primary hover:underline"
                  >
                    Contact Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="md:col-span-3 space-y-8">
            <section id="account">
              <h2 className="text-2xl font-semibold mb-4">
                Account Management
              </h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    How do I create an account?
                  </AccordionTrigger>
                  <AccordionContent>
                    Creating an account on 2KCulture is simple! Click on the
                    &quot;Sign up&quot; button in the top-right corner of the
                    website. You&quot;ll need to provide your email address,
                    create a password, and agree to our terms of service. Once
                    you verify your email, you&quot;ll have full access to all
                    features.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    How do I reset my password?
                  </AccordionTrigger>
                  <AccordionContent>
                    If you&quot;ve forgotten your password, click on &quot;Log
                    in&quot; and then select &quot;Forgot password?&quot;. Enter
                    the email address associated with your account, and
                    we&quot;ll send you instructions to reset your password.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Can I change my username?</AccordionTrigger>
                  <AccordionContent>
                    Yes, you can change your display name and username from your
                    account settings. However, once you&quot;ve built a
                    following, we recommend keeping your name consistent so your
                    fans can find you easily.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            <section id="upload">
              <h2 className="text-2xl font-semibold mb-4">Uploading Music</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    What file formats do you accept?
                  </AccordionTrigger>
                  <AccordionContent>
                    We accept MP3, WAV, and FLAC audio files. For the best
                    quality, we recommend uploading WAV files at 44.1kHz/16-bit
                    or higher. Maximum file size is 50MB per track.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>How do I upload my music?</AccordionTrigger>
                  <AccordionContent>
                    Navigate to the Creator Studio by clicking on &quot;Creator
                    Studio&quot; in the navigation bar (visible when you&quot;re
                    logged in). From there, you can drag and drop your audio
                    files, add cover art, and input metadata like title, genre,
                    and tags.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>What is Draft Mode?</AccordionTrigger>
                  <AccordionContent>
                    Draft Mode allows you to upload songs and keep them private
                    while you perfect them. Your songs will be stored in your
                    Creator Studio but won&quot;t be visible to other users
                    until you choose to publish them.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            <section id="playback">
              <h2 className="text-2xl font-semibold mb-4">Playback Issues</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    Songs won&apos;t play or keep buffering
                  </AccordionTrigger>
                  <AccordionContent>
                    If you&apos;re experiencing playback issues, try: refreshing
                    the page, checking your internet connection, clearing your
                    browser cache, or using a different browser. If problems
                    persist, please contact our support team.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    Can I download songs for offline listening?
                  </AccordionTrigger>
                  <AccordionContent>
                    Currently, 2KCulture is a streaming-only platform.
                    We&apos;re working on offline playback features for our
                    premium subscribers in the future.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            <section id="payments">
              <h2 className="text-2xl font-semibold mb-4">
                Payments & Royalties
              </h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How do artists get paid?</AccordionTrigger>
                  <AccordionContent>
                    Artists earn royalties based on the number of streams their
                    songs receive. We distribute 70% of our revenue back to
                    creators proportionally based on their share of total
                    platform streams.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>When do payments occur?</AccordionTrigger>
                  <AccordionContent>
                    Payments are processed monthly for all earnings above $20.
                    If your earnings don&apos;t reach the $20 threshold,
                    they&apos;ll roll over to the next month until the minimum
                    is reached.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            <section id="contact" className="bg-secondary/30 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">Still Need Help?</h2>
              <p className="mb-4">
                If you couldn&apos;t find the answer to your question, our
                support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="mailto:support@2kculture.com"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-center"
                >
                  Email Support
                </Link>
                <Link
                  href="#"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-4 py-2 rounded-md text-center"
                >
                  Live Chat (9am-5pm EST)
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
