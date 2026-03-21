"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/Card";
import { Smartphone, ShieldCheck, CheckCircle2, ArrowLeft } from "lucide-react";

export default function OTPPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = () => {
    setIsLoading(true);
    // Simulate network request
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 1000);
  };

  const handleVerify = () => {
    setIsLoading(true);
    // Simulate verification
    setTimeout(() => {
      setIsLoading(false);
      window.location.href = "/dashboard";
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-background to-secondary/20 p-4">
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer hover:scale-105">
          <CheckCircle2 className="h-6 w-6 text-primary" />
          <span className="font-bold hidden sm:inline-block text-foreground">Sasi Tasks</span>
        </Link>
      </div>
      
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <Card className="border-border/50 shadow-2xl shadow-primary/5">
          <div className="px-6 pt-6">
            <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer hover:opacity-80">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to login
            </Link>
          </div>
          
          <CardHeader className="space-y-2 text-center pb-6">
            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
              {step === 1 ? (
                <Smartphone className="h-6 w-6 text-primary" />
              ) : (
                <ShieldCheck className="h-6 w-6 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold">
              {step === 1 ? "Login with Request OTP" : "Verify Your Number"}
            </CardTitle>
            <CardDescription className="text-base">
              {step === 1 
                ? "Enter your phone number to receive a secure code" 
                : "Enter the 6-digit code sent to your device"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {step === 1 ? (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <Input
                  label="Phone Number"
                  placeholder="+1 (555) 000-0000"
                  type="tel"
                  icon={<Smartphone className="h-4 w-4" />}
                />
                <Button 
                  className="w-full font-semibold" 
                  size="lg" 
                  onClick={handleSendOTP}
                  isLoading={isLoading}
                >
                  Send OTP
                </Button>
              </div>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <Input
                  label="Secure Code"
                  placeholder="000 000"
                  type="text"
                  maxLength={6}
                  className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                />
                <Button 
                  className="w-full font-semibold" 
                  size="lg" 
                  onClick={handleVerify}
                  isLoading={isLoading}
                >
                  Verify
                </Button>
                <div className="text-center">
                  <button 
                    onClick={() => setStep(1)} 
                    className="text-sm text-primary hover:underline underline-offset-4"
                  >
                    Didn't receive a code? Resend
                  </button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="pb-8" />
        </Card>
      </div>
    </div>
  );
}
