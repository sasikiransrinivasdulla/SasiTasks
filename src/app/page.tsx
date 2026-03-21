import Link from "next/link";
import { Button } from "@/components/Button";
import { CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center px-6 lg:px-14 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <Link className="flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105" href="/">
          <CheckCircle2 className="h-6 w-6 text-primary" />
          <span className="ml-2 text-lg font-bold">Sasi Tasks</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-all duration-200 cursor-pointer hover:scale-105" href="/login">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-all duration-200 cursor-pointer hover:scale-105" href="/login">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-all duration-200 cursor-pointer hover:scale-105" href="/login">
            About
          </Link>
        </nav>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-secondary/20">
        <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary">
            🎉 The new standard for task management
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Manage your work <br className="hidden sm:inline" />
            <span className="text-primary">effortlessly</span>
          </h1>
          <p className="mx-auto max-w-[42rem] leading-normal text-muted-foreground sm:text-lg sm:leading-8">
            Experience next-level productivity with Sasi Tasks. The modern, seamless way to organize your projects, hit your deadlines, and achieve more every day.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto font-semibold px-8">
                Get Started for Free
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold px-8 border-primary/20 hover:border-primary/50 text-foreground">
                Login
              </Button>
            </Link>
          </div>
          <div className="pt-12 items-center justify-center">
            <p className="text-sm text-muted-foreground mb-4">Trusted by modern teams worldwide</p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-50 grayscale">
              <div className="text-xl font-bold font-serif">Acme Corp</div>
              <div className="text-xl font-bold font-mono">Globex</div>
              <div className="text-xl font-bold italic">Soylent</div>
              <div className="text-xl font-bold tracking-widest">INITRO</div>
            </div>
          </div>
        </div>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-border">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Sasi Tasks Inc. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer hover:opacity-80" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer hover:opacity-80" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
