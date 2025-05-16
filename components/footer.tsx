import Link from "next/link";
import Image from "next/image";
import { Music } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-x-2">
              <Music size={24} className="text-primary" />
              <h3 className="text-xl font-bold">2kCulture</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Stream and share your music with 2kCulture, the modern music
              platform for artists and listeners.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm">Resources</h4>
            <div className="flex flex-col space-y-2 text-sm">
              <Link
                href="/resources/about"
                className="text-muted-foreground hover:text-foreground"
              >
                About us
              </Link>
              <Link
                href="/resources/help"
                className="text-muted-foreground hover:text-foreground"
              >
                Help center
              </Link>
              <Link
                href="/resources/privacy"
                className="text-muted-foreground hover:text-foreground"
              >
                Privacy
              </Link>
              <Link
                href="/resources/terms"
                className="text-muted-foreground hover:text-foreground"
              >
                Terms of service
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm">For Artists</h4>
            <div className="flex flex-col space-y-2 text-sm">
              <Link
                href="/creator"
                className="text-muted-foreground hover:text-foreground"
              >
                Creator studio
              </Link>
              <Link
                href="/resources"
                className="text-muted-foreground hover:text-foreground"
              >
                Resources
              </Link>
              <Link
                href="/analytics"
                className="text-muted-foreground hover:text-foreground"
              >
                Analytics
              </Link>
              <Link
                href="/support"
                className="text-muted-foreground hover:text-foreground"
              >
                Artist support
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm">Community</h4>
            <div className="flex flex-col space-y-2 text-sm">
              <Link
                href="https://twitter.com"
                target="_blank"
                className="text-muted-foreground hover:text-foreground"
              >
                Twitter
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                className="text-muted-foreground hover:text-foreground"
              >
                Instagram
              </Link>
              <Link
                href="https://discord.com"
                target="_blank"
                className="text-muted-foreground hover:text-foreground"
              >
                Discord
              </Link>
              <Link
                href="https://github.com"
                target="_blank"
                className="text-muted-foreground hover:text-foreground"
              >
                GitHub
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} 2kCulture. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0 items-center">
            <Link
              href="/resources/privacy"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/resources/terms"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Terms
            </Link>
            <Link
              href="/resources/cookies"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Cookies
            </Link>
            <a
              href="https://www.dmca.com/compliance/2kculture.com"
              title="DMCA Compliance information for 2kculture.com"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1"
            >
                            pnpm dev<Image
                src="https://www.dmca.com/img/dmca-compliant-grayscale.png"
                alt="DMCA compliant image"
                width={80}
                height={15}
                quality={100}
                priority={false}
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
