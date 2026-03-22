import Link from "next/link";
import { Button } from "@/components/Button";
import { CheckCircle2, Shield, Lock, Server } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center px-6 lg:px-14 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <Link className="flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105" href="/">
          <CheckCircle2 className="h-6 w-6 text-primary" />
          <span className="ml-2 text-lg font-bold">Sasi Tasks</span>
        </Link>
        <div className="ml-auto">
          {/* Dashboard access button could go here eventually, leaving it blank for a clean nav */}
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-background to-secondary/10">
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs sm:text-sm font-semibold tracking-wide text-primary shadow-sm hover:bg-primary/20 transition-colors backdrop-blur-md">
            Exal Consortium Tech Challenge | IAM Implementation
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
            Secure Identity.<br />
            <span className="text-primary tracking-tight">Simplified Access.</span>
          </h1>
          
          <p className="mx-auto max-w-[48rem] text-muted-foreground sm:text-lg sm:leading-8 font-medium">
            Built expressly for the Exal Consortium Project Assignment. Demonstrating stateless session orchestration, multi-modal MFA gateways, and Row Level Security isolation.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto font-bold px-10 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto font-bold px-10 border-border/50 hover:bg-secondary/50 text-foreground transition-all duration-300">
                Login Gateway
              </Button>
            </Link>
          </div>
          
          <div className="pt-20 pb-12 w-full flex flex-col items-center justify-center">
            <p className="text-xs text-muted-foreground/80 font-bold uppercase tracking-[0.2em] mb-8">Key Security Architecture</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-16 w-full max-w-3xl opacity-90">
              <div className="flex flex-col items-center gap-3 group">
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 text-foreground group-hover:border-primary/50 group-hover:text-primary transition-colors shadow-sm">
                  <Lock className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold text-foreground/90">End-to-End Encryption</span>
              </div>
              <div className="flex flex-col items-center gap-3 group">
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 text-foreground group-hover:border-primary/50 group-hover:text-primary transition-colors shadow-sm">
                  <Server className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold text-foreground/90">Open-Source IAS</span>
              </div>
              <div className="flex flex-col items-center gap-3 group">
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 text-foreground group-hover:border-primary/50 group-hover:text-primary transition-colors shadow-sm">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold text-foreground/90">GDPR Compliant</span>
              </div>
            </div>
          </div>
          
        </div>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-8 w-full shrink-0 items-center px-6 md:px-12 border-t border-border/50 bg-background/50 backdrop-blur-sm">
        <p className="text-xs text-muted-foreground font-medium">
          © {new Date().getFullYear()} Sasi Auth System - Technical Showcase 2026.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6 mt-4 sm:mt-0">
          <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground/60 hover:text-foreground transition-all duration-200 cursor-pointer" href="/signup">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground/60 hover:text-foreground transition-all duration-200 cursor-pointer" href="/signup">
            Privacy Policy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
