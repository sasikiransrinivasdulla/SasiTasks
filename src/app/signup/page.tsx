"use client";

import Link from "next/link";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/Card";
import { CheckCircle2, Mail, Lock, User, Phone } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-background to-secondary/20 p-4 py-12">
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer hover:scale-105">
          <CheckCircle2 className="h-6 w-6 text-primary" />
          <span className="font-bold hidden sm:inline-block text-foreground">Sasi Tasks</span>
        </Link>
      </div>
      
      <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="border-border/50 shadow-2xl shadow-primary/5">
          <CardHeader className="space-y-2 text-center pb-6">
            <CardTitle className="text-3xl font-bold">Create an account</CardTitle>
            <CardDescription className="text-base">
              Start managing your tasks effectively today
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="John"
                icon={<User className="h-4 w-4" />}
                required
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                icon={<User className="h-4 w-4" />}
                required
              />
            </div>
            <Input
              label="Display Name"
              placeholder="johndoe123"
              icon={<User className="h-4 w-4" />}
              required
            />
            <Input
              label="Phone Number"
              placeholder="+1 (555) 000-0000"
              type="tel"
              icon={<Phone className="h-4 w-4" />}
              required
            />
            <Input
              label="Email"
              placeholder="john@example.com"
              type="email"
              icon={<Mail className="h-4 w-4" />}
              required
            />
            <Input
              label="Password"
              placeholder="••••••••"
              type="password"
              icon={<Lock className="h-4 w-4" />}
              required
            />
            
            <div className="flex items-start gap-2 pt-2 text-sm">
              <input 
                type="checkbox" 
                id="terms" 
                className="mt-1 flex-shrink-0 rounded border-border bg-background text-primary focus:ring-primary/20 accent-primary h-4 w-4 cursor-pointer" 
                required
              />
              <label htmlFor="terms" className="text-muted-foreground leading-snug cursor-pointer group-hover:text-foreground transition-colors hover:opacity-80">
                I agree to the{" "}
                <Link href="#" className="text-primary hover:underline underline-offset-4 transition-all duration-200 cursor-pointer hover:opacity-80">Terms & Conditions</Link>
                {" "}and{" "}
                <Link href="#" className="text-primary hover:underline underline-offset-4 transition-all duration-200 cursor-pointer hover:opacity-80">Privacy Policy</Link>.
              </label>
            </div>
            
            <Link href="/dashboard" className="block w-full pt-4">
              <Button className="w-full font-semibold" size="lg">
                Create Account
              </Button>
            </Link>
            
          </CardContent>
          <CardFooter className="flex flex-col pt-2 pb-8 space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium underline-offset-4 transition-all duration-200 cursor-pointer hover:opacity-80">
                Login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
