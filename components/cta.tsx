"use client";

import { SignUpButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Music } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CallToAction() {
  const router = useRouter();
  const { isSignedIn } = useUser();

  return (
    <section className="py-20 bg-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to start your music journey?
            </h2>
            <p className="text-xl text-muted-foreground mb-6">
              Join thousands of artists and listeners on 2kCulture today.
            </p>

            {isSignedIn ? (
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 hover:from-indigo-600 hover:to-purple-700"
                  onClick={() => router.push("/library")}
                >
                  Browse music
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push("/creator")}
                >
                  Upload your music
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                <SignUpButton mode="modal">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 hover:from-indigo-600 hover:to-purple-700"
                  >
                    Create free account
                  </Button>
                </SignUpButton>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push("/#features")}
                >
                  Learn more
                </Button>
              </div>
            )}
          </div>

          <div className="relative w-full max-w-md aspect-square">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full opacity-20 blur-2xl"></div>
            <div className="relative bg-card border border-border rounded-3xl shadow-xl p-8 h-full flex items-center justify-center">
              <div className="flex flex-col items-center text-center">
                <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Music className="h-10 w-10 text-indigo-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Start for Free</h3>
                <p className="text-muted-foreground mb-6">
                  No credit card required. Upgrade anytime for premium features.
                </p>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="flex flex-col items-center p-3 bg-primary/5 rounded-lg">
                    <span className="text-2xl font-bold text-indigo-500">
                      100+
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Songs per month
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-primary/5 rounded-lg">
                    <span className="text-2xl font-bold text-indigo-500">
                      Free
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Account Creation
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
