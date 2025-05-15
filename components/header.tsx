"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, Library, Search, Upload, LogIn } from "lucide-react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"

export default function Header() {
  const pathname = usePathname()

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Search", href: "/search", icon: Search },
    { name: "Library", href: "/library", icon: Library },
    { name: "Upload", href: "/upload", icon: Upload },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-6 mt-6">
                <Link href="/" className="flex items-center gap-2">
                  <Image src="/logo.png" alt="2kCulture Logo" width={40} height={40} className="h-8 w-auto" />
                  <span className="font-bold text-xl">2kCulture</span>
                </Link>
                <div className="grid gap-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 text-lg rounded-md hover:bg-accent",
                        pathname === item.href ? "bg-accent font-medium" : "text-muted-foreground",
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="2kCulture Logo" width={40} height={40} className="h-8 w-auto" />
            <span className="font-bold text-xl hidden md:inline-block">2kCulture</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href ? "text-primary" : "text-muted-foreground",
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button asChild variant="ghost" size="icon" className="md:hidden">
            <Link href="/login">
              <LogIn className="h-5 w-5" />
              <span className="sr-only">Login</span>
            </Link>
          </Button>
          <Button asChild variant="ghost" className="hidden md:flex">
            <Link href="/login">
              <LogIn className="h-5 w-5 mr-2" />
              Login
            </Link>
          </Button>
          <Button asChild className="hidden md:inline-flex bg-purple-600 hover:bg-purple-700">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
