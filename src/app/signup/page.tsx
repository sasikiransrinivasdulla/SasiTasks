"use client";

import Link from "next/link";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/Card";
import { CheckCircle2, Mail, Lock, User, Phone } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { normalizePhone } from "@/lib/phone";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email || !password || !firstName || !lastName || !displayName) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: displayName.trim(),
          phone: phone ? normalizePhone(phone) : null,
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
      return;
    }

    setSuccessMsg("Registration successful! You can now log in.");
    setIsLoading(false);
  };

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
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive text-center animate-in fade-in zoom-in-95">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary text-center animate-in fade-in zoom-in-95">
                {successMsg}
              </div>
            )}
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  placeholder="John"
                  icon={<User className="h-4 w-4" />}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <Input
                  label="Last Name"
                  placeholder="Doe"
                  icon={<User className="h-4 w-4" />}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <Input
                label="Display Name"
                placeholder="johndoe123"
                icon={<User className="h-4 w-4" />}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
              <Input
                label="Phone Number (Optional)"
                placeholder="9876543210"
                type="tel"
                icon={<Phone className="h-4 w-4" />}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Input
                label="Email"
                placeholder="john@example.com"
                type="email"
                icon={<Mail className="h-4 w-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                placeholder="••••••••"
                type="password"
                icon={<Lock className="h-4 w-4" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              
              <div className="flex flex-col gap-3 pt-2 text-sm">
                <div className="h-24 w-full rounded-md border border-border/50 bg-secondary/20 p-3 overflow-y-auto text-xs text-muted-foreground leading-relaxed shadow-inner">
                  <strong>Terms of Service & Privacy Policy Agreement</strong><br/><br/>
                  By accessing Sasi Tasks, you explicitly consent to the collection, cryptographic hashing, and sovereign storage of your identity metadata as outlined by GDPR Article 17. Our unified authentication protocol merges your selected identifiers (Phone/OAuth) into an isolated tenant schema... 
                  <br/><br/>
                  We employ rigorous Postgres Row-Level Security. We do not sell, distribute, or unmask your raw data to any unauthorized tier...
                </div>
                <div className="flex items-start gap-2">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    className="mt-1 flex-shrink-0 rounded border-border bg-background text-primary focus:ring-primary/20 accent-primary h-4 w-4 cursor-pointer" 
                    required
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                  />
                  <label htmlFor="terms" className="text-muted-foreground leading-snug cursor-pointer group-hover:text-foreground transition-colors hover:opacity-80">
                    I agree to the{" "}
                    <button type="button" onClick={() => setShowTermsModal(true)} className="font-semibold text-primary hover:underline underline-offset-4 transition-all duration-200 focus-visible:outline-none">Terms of Service</button>
                    {" "}and confirm I have read the{" "}
                    <button type="button" onClick={() => setShowPrivacyModal(true)} className="font-semibold text-primary hover:underline underline-offset-4 transition-all duration-200 focus-visible:outline-none">Privacy Policy</button>.
                  </label>
                </div>
              </div>
              
              <div className="pt-4">
                <Button type="submit" className="w-full font-semibold" size="lg" isLoading={isLoading} disabled={!agreedToTerms}>
                  Create Account
                </Button>
              </div>
            </form>
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

      {/* Terms of Service Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="max-w-xl w-full max-h-[85vh] flex flex-col border-border/50 shadow-2xl animate-in zoom-in-95 fade-in duration-300">
            <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-border/50 shrink-0">
              <h2 className="text-xl font-bold text-foreground">Terms of Service</h2>
              <button onClick={() => setShowTermsModal(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1">✕</button>
            </div>
            <CardContent className="px-6 py-6 overflow-y-auto space-y-4 text-sm text-foreground/80 leading-relaxed overflow-x-hidden">
               <h3 className="font-semibold text-foreground text-base">Entity Identification & Agreement</h3>
               <p>This document governs your explicit relationship with Sasi Tasks authentication services. By clicking 'Create Account', you agree to engage in localized cryptographic operations required to maintain identity protocols.</p>
               <h3 className="font-semibold text-foreground text-base">Service Accessibility</h3>
               <p>We do not guarantee perfect API uptime dependent on downstream OAuth providers (Google Auth, Twilio SMS). You inherently accept the potential for logical rate-limits enforced by the host platform to avoid systemic resource abuse.</p>
               <h3 className="font-semibold text-foreground text-base">Session Integrity</h3>
               <p>Users are strictly forbidden from executing unauthorized reverse-engineering against the Supabase GoTrue API hooks or attempting to extract native JSON Web Tokens generated by the primary Identity Engine.</p>
            </CardContent>
            <div className="p-4 border-t border-border/50 shrink-0">
              <Button onClick={() => setShowTermsModal(false)} className="w-full">Acknowledge</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="max-w-xl w-full max-h-[85vh] flex flex-col border-border/50 shadow-2xl animate-in zoom-in-95 fade-in duration-300">
            <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-border/50 shrink-0">
              <h2 className="text-xl font-bold text-foreground">Privacy Policy</h2>
              <button onClick={() => setShowPrivacyModal(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1">✕</button>
            </div>
            <CardContent className="px-6 py-6 overflow-y-auto space-y-4 text-sm text-foreground/80 leading-relaxed overflow-x-hidden">
               <h3 className="font-semibold text-foreground text-base">Data Cryptography</h3>
               <p>Passwords are never logged in plaintext. They are inherently hashed utilizing bcrypt mechanisms on edge servers before permanently settling into the Auth databases.</p>
               <h3 className="font-semibold text-foreground text-base">GDPR Sovereignty</h3>
               <p>As requested by our central compliance unit, any request bound to your unique `uid` signature dictating a full account deletion will invoke a strict, cascading sequence purging all mapped rows located in the `profiles` and `tasks` instances seamlessly.</p>
               <h3 className="font-semibold text-foreground text-base">No Third-Party Brokers</h3>
               <p>We deliberately isolate your identity payload. Excluding the required interaction with Google API or Twilio logic servers, your data will literally never be unmasked to unauthorized 3rd parties or advertising nodes.</p>
            </CardContent>
            <div className="p-4 border-t border-border/50 shrink-0">
              <Button onClick={() => setShowPrivacyModal(false)} className="w-full">Acknowledge</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
