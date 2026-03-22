"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/Card";
import { CheckCircle2, Mail, Lock, Smartphone, ArrowRight, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { normalizePhone } from "@/lib/phone";

export default function LoginPage() {
  const router = useRouter();
  
  type AuthMode = 'initial' | 'password' | 'otp_only' | 'mfa_password' | 'mfa_otp';
  const [authMode, setAuthMode] = useState<AuthMode>('initial');
  
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  // Pre-fetch logic
  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      setError("Please enter your email or phone number.");
      return;
    }

    setIsLoading(true);
    setError("");

    const isEmail = identifier.includes('@');
    const queryCol = isEmail ? 'email' : 'phone';
    const queryVal = isEmail ? identifier.trim() : normalizePhone(identifier);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('otp_enabled, mfa_enabled, phone')
        .eq(queryCol, queryVal)
        .maybeSingle();

      if (profile?.otp_enabled) {
        // Option A: Passwordless OTP Fast-pass
        const otpPayload = isEmail ? { email: queryVal } : { phone: queryVal };
        const { error: otpError } = await supabase.auth.signInWithOtp(otpPayload);
        if (otpError) throw otpError;
        setAuthMode('otp_only');
      } else if (profile?.mfa_enabled) {
        // Option B: MFA Custom Dual-Gateway
        setAuthMode('mfa_password');
      } else {
        // Option C: Standard Legacy Auth
        setAuthMode('password');
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong checking your profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { setError("Password mapped as required."); return; }
    
    setIsLoading(true);
    setError("");

    const isEmail = identifier.includes('@');
    const queryVal = isEmail ? identifier.trim() : normalizePhone(identifier);

    const pwPayload = isEmail ? { email: queryVal, password } : { phone: queryVal, password };
    const { error: signInError } = await supabase.auth.signInWithPassword(pwPayload);

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
      return;
    }

    if (authMode === 'mfa_password') {
       // Stop the redirect and demand OTP step
       const otpPayload = isEmail ? { email: queryVal } : { phone: queryVal };
       const { error: otpError } = await supabase.auth.signInWithOtp(otpPayload);
       if (otpError) {
          setError(otpError.message);
          setIsLoading(false);
          return;
       }
       setAuthMode('mfa_otp');
       setIsLoading(false);
    } else {
       // Standard flow
       router.push("/dashboard");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) { setError("Valid 6-digit code required."); return; }
    
    setIsLoading(true);
    setError("");

    const isEmail = identifier.includes('@');
    const queryVal = isEmail ? identifier.trim() : normalizePhone(identifier);

    const verifyPayload = isEmail 
      ? { email: queryVal, token: otp, type: 'email' as const }
      : { phone: queryVal, token: otp, type: 'sms' as const };

    const { error: verifyError } = await supabase.auth.verifyOtp(verifyPayload);

    if (verifyError) {
      setError(verifyError.message);
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoadingGoogle(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: process.env.NEXT_PUBLIC_SITE_URL 
            ? `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard` 
            : `${window.location.origin}/dashboard`,
        },
      });
      if (error) {
        console.error("Error logging in:", error.message);
        setIsLoadingGoogle(false);
      }
      // Success will automatically redirect
    } catch (error) {
      console.error(error);
      setIsLoadingGoogle(false);
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
          <CardHeader className="space-y-2 text-center pb-6">
            <CardTitle className="text-3xl font-bold">Welcome back</CardTitle>
            <CardDescription className="text-base">
              Enter your credentials to access your tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive text-center animate-in fade-in zoom-in-95">
                {error}
              </div>
            )}
            
            {authMode === 'initial' && (
              <form onSubmit={handleContinue} className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <Input
                  label="Email or Phone"
                  placeholder="name@example.com or 9876543210"
                  type="text"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  icon={<Mail className="h-4 w-4" />}
                />
                <Button type="submit" className="w-full font-semibold" size="lg" isLoading={isLoading}>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            )}

            {(authMode === 'password' || authMode === 'mfa_password') && (
              <form onSubmit={handleVerifyPassword} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="p-3 bg-secondary/30 border border-border/50 rounded-lg flex items-center justify-between mb-2">
                   <div className="truncate pr-4 text-sm text-foreground/80 font-medium">{identifier}</div>
                   <button type="button" onClick={() => setAuthMode('initial')} className="text-xs text-primary hover:underline whitespace-nowrap">Edit</button>
                </div>
                <Input
                  label="Password"
                  placeholder="••••••••"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="h-4 w-4" />}
                />
                
                <div className="flex items-center justify-between text-sm pb-2">
                  <label className="flex items-center gap-2 cursor-pointer group hover:opacity-80 transition-all duration-200">
                    <input type="checkbox" className="rounded border-border bg-background text-primary focus:ring-primary/20 transition-colors accent-primary h-4 w-4 cursor-pointer" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">Remember me</span>
                  </label>
                  <Link href="#" className="text-primary hover:underline underline-offset-4 transition-all duration-200 cursor-pointer hover:opacity-80">
                    Forgot password?
                  </Link>
                </div>
                
                <Button type="submit" className="w-full font-semibold" size="lg" isLoading={isLoading}>
                  {authMode === 'mfa_password' ? 'Verify Password' : 'Login'}
                </Button>
              </form>
            )}

            {(authMode === 'otp_only' || authMode === 'mfa_otp') && (
              <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center gap-2 text-primary mb-2 text-sm text-center">
                   <ShieldCheck className="h-5 w-5 shrink-0" />
                   <span>Enter the robust 6-digit verification code sent to {identifier.includes('@') ? 'your email' : 'your device'}.</span>
                </div>
                <Input
                  label="Security Code"
                  placeholder="000000"
                  type="text"
                  maxLength={6}
                  className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
                <Button type="submit" className="w-full font-semibold" size="lg" isLoading={isLoading}>
                  {authMode === 'mfa_otp' ? 'Complete MFA & Login' : 'Login Securely'}
                </Button>
                <div className="text-center pt-2">
                   <button type="button" onClick={() => setAuthMode('initial')} className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors">Start over</button>
                </div>
              </form>
            )}
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="w-full bg-white text-[#3c4043] border border-gray-300 hover:bg-[#f8f9fa] shadow-sm font-medium transition-all"
                onClick={handleGoogleLogin}
                isLoading={isLoadingGoogle}
                type="button"
              >
                {!isLoadingGoogle && (
                  <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                )}
                Google
              </Button>
              <Link href="/otp" className="w-full block">
                <Button variant="outline" className="w-full text-foreground hover:bg-secondary border-border/50">
                  <Smartphone className="mr-2 h-4 w-4 text-muted-foreground" />
                  OTP Login
                </Button>
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col pt-4 pb-8 space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline font-medium underline-offset-4 transition-all duration-200 cursor-pointer hover:opacity-80">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
