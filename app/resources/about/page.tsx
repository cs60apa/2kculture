"use client";

import React from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function AboutUsPage() {
  return (
    <>
      <Navbar />
      <div className="container max-w-4xl mx-auto pt-24 pb-16 px-4 sm:px-6">
        <h1 className="text-4xl font-bold mb-6">About 2KCulture</h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
            <p className="text-lg text-muted-foreground mb-4">
              Founded in 2025, 2KCulture was created with a simple mission: to
              give independent artists a platform to share their music with the
              world without the barriers of traditional music industry
              gatekeepers.
            </p>
            <p className="text-lg text-muted-foreground">
              We believe that great music deserves to be heard, regardless of
              marketing budgets or industry connections. Our platform empowers
              artists to take control of their creative journey while connecting
              with listeners who appreciate authentic music.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground">
              2KCulture exists to democratize music distribution and discovery.
              We&apos;re building a community where independent artists can
              thrive, listeners can discover unique sounds, and the relationship
              between creators and fans can grow without corporate
              intermediaries.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
            <p className="text-lg text-muted-foreground mb-6">
              We&apos;re a diverse team of musicians, engineers, and music
              enthusiasts who understand both the creative process and the
              technical challenges of music distribution. United by our love for
              independent music, we&apos;re committed to creating the best
              possible platform for artists and listeners alike.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Team members can be added here */}
              <div className="bg-secondary/40 p-4 rounded-lg">
                <h3 className="font-medium text-xl">Mark Sikaundi</h3>
                <p className="text-muted-foreground">Founder & CEO</p>
              </div>
              <div className="bg-secondary/40 p-4 rounded-lg">
                <h3 className="font-medium text-xl">Team Member</h3>
                <p className="text-muted-foreground">
                  Chief Technology Officer
                </p>
              </div>
              <div className="bg-secondary/40 p-4 rounded-lg">
                <h3 className="font-medium text-xl">Team Member</h3>
                <p className="text-muted-foreground">
                  Head of Artist Relations
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Join Our Journey</h2>
            <p className="text-lg text-muted-foreground">
              Whether you&apos;re an artist looking to share your music or a
              listener eager to discover new sounds, we invite you to join us in
              building a more equitable music ecosystem. Together, we&apos;re
              creating a culture that values artistic expression and authentic
              connection above all else.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
