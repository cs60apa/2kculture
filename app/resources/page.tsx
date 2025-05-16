"use client";

import React from "react";
import Link from "next/link";
import {
  Newspaper,
  HelpCircle,
  Lock,
  FileText,
  Info,
  ExternalLink,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ResourcesPage() {
  const resources = [
    {
      title: "About 2KCulture",
      description:
        "Learn more about our mission, team, and vision for the future of music",
      icon: <Info className="h-8 w-8 mb-2 text-primary" />,
      href: "/resources/about",
    },
    {
      title: "Help Center",
      description:
        "Find answers to common questions and get support for your account",
      icon: <HelpCircle className="h-8 w-8 mb-2 text-primary" />,
      href: "/resources/help",
    },
    {
      title: "Privacy Policy",
      description:
        "Understand how we collect, use, and protect your personal information",
      icon: <Lock className="h-8 w-8 mb-2 text-primary" />,
      href: "/resources/privacy",
    },
    {
      title: "Terms of Service",
      description: "Review the legal agreement between you and 2KCulture",
      icon: <FileText className="h-8 w-8 mb-2 text-primary" />,
      href: "/resources/terms",
    },
    {
      title: "Blog",
      description:
        "Stay updated with the latest features, artist spotlights, and music trends",
      icon: <Newspaper className="h-8 w-8 mb-2 text-primary" />,
      href: "/blog",
      comingSoon: true,
    },
    {
      title: "Developer API",
      description:
        "Access our API documentation for building integrations with 2KCulture",
      icon: <ExternalLink className="h-8 w-8 mb-2 text-primary" />,
      href: "/resources/api",
      comingSoon: true,
    },
  ];

  return (
    <>
      <Navbar />
      <div className="container max-w-7xl mx-auto pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Resources</h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about using and getting the most out of
            2KCulture
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource, i) => (
            <Link
              key={i}
              href={resource.comingSoon ? "#" : resource.href}
              className={resource.comingSoon ? "cursor-not-allowed" : ""}
            >
              <Card className="h-full hover:shadow-md transition-shadow relative overflow-hidden">
                {resource.comingSoon && (
                  <div className="absolute top-3 right-3 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded-full">
                    Coming Soon
                  </div>
                )}
                <CardHeader className="pb-2">
                  {resource.icon}
                  <CardTitle>{resource.title}</CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-sm font-medium ${resource.comingSoon ? "text-muted-foreground" : "text-primary"}`}
                  >
                    {resource.comingSoon ? "Available soon" : "Read more →"}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-16 max-w-3xl mx-auto text-center p-8 bg-secondary/30 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">
            Can&apos;t find what you&apos;re looking for?
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Our support team is here to help with any questions you might have
            about 2KCulture.
          </p>
          <Link
            href="mailto:support@2kculture.com"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-md inline-flex items-center"
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Contact Support
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
