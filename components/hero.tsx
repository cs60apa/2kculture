"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SignUpButton, useUser } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

export function Hero() {
  const router = useRouter();
  const { isSignedIn } = useUser();

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-br from-black to-indigo-950 dark:from-black dark:to-indigo-950 pt-32 pb-20">
      {/* Background animated elements */}
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden opacity-50">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Discover and Share the Music that Defines Your Culture
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            2kCulture provides a platform for emerging artists to share their sounds
            and for listeners to discover the next wave of cultural music.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isSignedIn ? (
              <Button
                size="lg"
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 hover:from-indigo-600 hover:to-purple-700"
                onClick={() => router.push("/library")}
              >
                Go to Library
              </Button>
            ) : (
              <SignUpButton mode="modal">
                <Button
                  size="lg" 
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 hover:from-indigo-600 hover:to-purple-700"
                >
                  Get started for free
                </Button>
              </SignUpButton>
            )}
            <Button 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white/10"
              onClick={() => router.push("#features")}
            >
              Learn more
            </Button>
          </div>
        </motion.div>
        
        {/* Floating music player mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-16 max-w-3xl w-full mx-auto"
        >
          <div className="bg-black/30 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl p-4 overflow-hidden">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 flex-shrink-0 flex items-center justify-center">
                <span className="text-white font-bold text-lg">2k</span>
              </div>
              <div className="flex-1">
                <div className="h-3 w-32 bg-white/20 rounded-full mb-2"></div>
                <div className="h-2 w-24 bg-white/10 rounded-full"></div>
              </div>
              <div className="flex space-x-2">
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-sm bg-white"></div>
                </div>
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <div className="h-0 w-0 border-l-6 border-l-white border-y-4 border-y-transparent ml-1"></div>
                </div>
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-sm bg-white rotate-90"></div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-white/50">
                <span>2:14</span>
                <span>3:45</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
