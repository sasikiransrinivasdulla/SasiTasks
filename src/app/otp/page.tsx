"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { normalizePhone } from "@/lib/phone";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/Card";
import { Smartphone, ShieldCheck, CheckCircle2, ArrowLeft } from "lucide-react";

export default function OTPPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSendOTP = async () => {
    const digitsOnly = phone.replace(/\D/g, '');
    if (!digitsOnly) {
      setError("Please enter a phone number");
      return;
    }
    
    setError("");
    setIsLoading(true);
    
    const formattedPhone = normalizePhone(phone);
    console.log("Searching for phone:", formattedPhone);

    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        phone: formattedPhone
      });

      if (authError) throw authError;
      
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!otp || otp.length < 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setError("");
    setIsLoading(true);
    
    const formattedPhone = normalizePhone(phone);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms'
      });

      if (verifyError) throw verifyError;
      
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid OTP code");
    } finally {
      setIsLoading(false);
    }
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
            <CardDescription className="text-base text-muted-foreground/90">
              {step === 1 
                ? "Enter your 10-digit phone number (without +91)" 
                : "Enter the 6-digit code sent to your device"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive text-center animate-in fade-in zoom-in-95">
                {error}
              </div>
            )}
            
            {step === 1 ? (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <Input
                  label="Phone Number"
                  placeholder="9876543210"
                  type="tel"
                  icon={<Smartphone className="h-4 w-4" />}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
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
                  placeholder="000000"
                  type="text"
                  maxLength={6}
                  className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
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
                    onClick={() => { setStep(1); setError(""); setOtp(""); }} 
                    className="text-sm text-primary hover:underline underline-offset-4 cursor-pointer transition-colors duration-200"
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
