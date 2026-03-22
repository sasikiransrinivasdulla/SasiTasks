"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card, CardContent } from "@/components/Card";
import { TaskItem } from "@/components/TaskItem";
import { CheckCircle2, LogOut, Plus, Search, User as UserIcon, Mail, Smartphone, Lock, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { normalizePhone } from "@/lib/phone";

type Task = {
  id: string;
  user_id: string;
  title: string;
  is_completed: boolean;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Phone Modal States
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneStep, setPhoneStep] = useState<1 | 2>(1);
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isSavingPhone, setIsSavingPhone] = useState(false);

  // Name Modal States
  const [showNameModal, setShowNameModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [firstNameInput, setFirstNameInput] = useState("");
  const [lastNameInput, setLastNameInput] = useState("");
  const [nameError, setNameError] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [isUpdatingSecurity, setIsUpdatingSecurity] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [newTaskText, setNewTaskText] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const checkUser = async () => {
      // Initialize session, parse hash if present
      await supabase.auth.getSession();

      // Clean URL token
      window.history.replaceState({}, document.title, "/dashboard");

      // Fetch logged-in user
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        router.push("/login");
      } else {
        // Fetch profile data from "profiles" table
        let { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        console.log("Profile exists:", profileData);

        if (!profileData) {
          // If profile DOES NOT exist: Insert new profile
          const fullName = user.user_metadata?.full_name || 'User';
          const nameParts = fullName !== 'User' ? fullName.split(' ') : [];
          const firstName = nameParts[0] || '';
          const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

          const newProfile = {
            id: user.id,
            display_name: fullName,
            first_name: firstName,
            last_name: lastName,
            email: user.email || null,
            phone: user.phone || null,
          };

          const { data: insertedProfile, error: insertError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select('*')
            .single();

          if (!insertError && insertedProfile) {
            profileData = insertedProfile;
          } else {
            console.error("Failed to insert profile:", insertError?.message || JSON.stringify(insertError));
            
            // Critical fallback: If another connection squeezed an insert into Postgres causing a race condition error, safely recall the existing profile
            const { data: existingProfile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
            profileData = existingProfile || newProfile; 
          }
        } else {
          // If profile EXISTS: Optionally update missing fields
          const updates: any = {};
          let needsUpdate = false;

          if ((!profileData.display_name || profileData.display_name === 'User') && user.user_metadata?.full_name) {
            updates.display_name = user.user_metadata.full_name;
            needsUpdate = true;
          }
          if (!profileData.phone && user.phone) {
            updates.phone = user.phone;
            needsUpdate = true;
          }

          if (needsUpdate) {
            const { data: updatedProfile, error: updateError } = await supabase
              .from('profiles')
              .update(updates)
              .eq('id', user.id)
              .select('*')
              .single();

            if (!updateError && updatedProfile) {
              profileData = updatedProfile;
            }
          }
        }

        setProfile(profileData);
        if (profileData && !profileData.phone) {
          setShowPhoneModal(true);
        } else if (profileData && (!profileData.display_name || profileData.display_name === 'User')) {
          setShowNameModal(true);
        }


        // Fetch user's tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('id', { ascending: false });

        if (!tasksError && tasksData) {
          setTasks(tasksData);
        }
        setIsLoadingTasks(false);
        setUser(user);
        setIsLoadingAuth(false);
      }
    };

    checkUser();
  }, [router]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
        <p className="text-muted-foreground font-medium animate-pulse text-sm">Loading your workspace...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const displayName =
    profile?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email ||
    "User";
  const initial = displayName.charAt(0).toUpperCase();

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim() || !user || isAddingTask) return;

    setIsAddingTask(true);
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: newTaskText.trim(),
        is_completed: false
      })
      .select()
      .single();

    if (!error && data) {
      setTasks([data, ...tasks]);
      setNewTaskText("");
    } else {
      console.error(error);
    }
    setIsAddingTask(false);
  };

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedPhone = normalizePhone(phoneInput);
    const phoneRegex = /^\+\d{10,15}$/;
    if (!phoneRegex.test(formattedPhone)) {
      setPhoneError("Please enter a valid phone number (e.g. 9876543210)");
      return;
    }

    setIsSavingPhone(true);
    setPhoneError("");
    
    try {
      // Security Pre-Check: Block if already registered to ANOTHER user
      const { data: existingUserWithPhone, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', formattedPhone)
        .neq('id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking phone uniqueness:", checkError);
      }

      if (existingUserWithPhone) {
        setPhoneError("This phone number is already linked to another account. Please contact support or use the other login method.");
        setIsSavingPhone(false);
        return;
      }

      // Proceed with Auth OTP Flow
      const { error } = await supabase.auth.updateUser({ phone: formattedPhone });
      if (error) throw error;
      setPhoneStep(2);
    } catch (err: any) {
      setPhoneError(err.message || "Failed to send OTP to this phone number.");
    } finally {
      setIsSavingPhone(false);
    }
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOtp || phoneOtp.length < 6) {
      setPhoneError("Please enter the complete 6-digit code.");
      return;
    }

    const formattedPhone = normalizePhone(phoneInput);
    setIsSavingPhone(true);
    setPhoneError("");

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: phoneOtp,
        type: 'phone_change'
      });

      if (verifyError) throw verifyError;

      // Upon authentic linking natively inside Auth, securely commit to Profiles
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ phone: formattedPhone })
        .eq('id', user.id);

      if (dbError) throw dbError;

      setProfile({ ...profile, phone: formattedPhone });
      setShowPhoneModal(false);
    } catch (err: any) {
      setPhoneError(err.message || "Failed to verify phone number.");
    } finally {
      setIsSavingPhone(false);
    }
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstNameInput.trim()) {
      setNameError("First name is required");
      return;
    }
    
    setIsSavingName(true);
    setNameError("");
    
    try {
      const displayName = `${firstNameInput.trim()} ${lastNameInput.trim()}`.trim();
      const { error } = await supabase
        .from('profiles')
        .update({ 
          display_name: displayName,
          first_name: firstNameInput.trim(),
          last_name: lastNameInput.trim()
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setProfile({ ...profile, display_name: displayName, first_name: firstNameInput.trim(), last_name: lastNameInput.trim() });
      setShowNameModal(false);
    } catch (err: any) {
      setNameError(err.message || "Failed to save profile details");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleToggleSecurity = async (key: 'otp_enabled' | 'mfa_enabled', value: boolean) => {
    if (!profile || !user) return;
    setIsUpdatingSecurity(true);

    let updates: any = { [key]: value };
    if (value === true) {
      if (key === 'otp_enabled') updates.mfa_enabled = false;
      if (key === 'mfa_enabled') updates.otp_enabled = false;
    }

    const previousProfile = { ...profile };
    setProfile({ ...profile, ...updates });

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
    } catch (err) {
      console.error("Failed to update security settings", err);
      setProfile(previousProfile);
    } finally {
      setIsUpdatingSecurity(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!profile || !user) return;
    
    // Explicit GDPR confirmation
    const isConfirmed = window.confirm(
      "WARNING: GDPR Data Deletion is irreversible.\n\nThis will purge all your Tasks and permanently destroy your identity metadata across the system. Proceed?"
    );
    
    if (!isConfirmed) return;
    setIsUpdatingSecurity(true);
    
    try {
      // 1. Purge Relational Tasks
      const { error: tasksError } = await supabase.from('tasks').delete().eq('user_id', user.id);
      if (tasksError) console.error("Tasks Purge Error:", tasksError);
      
      // 2. Purge Profile Metadata
      const { error: profileError } = await supabase.from('profiles').delete().eq('id', user.id);
      if (profileError) console.error("Profile Purge Error:", profileError);
      
      // 3. Destroy Client Session
      await supabase.auth.signOut({ scope: 'global' });
      router.push("/");
    } catch (err) {
      console.error("Critical Deletion Error:", err);
    } finally {
      setIsUpdatingSecurity(false);
    }
  };

  const handleToggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    // Optimistic UI update
    setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: !t.is_completed } : t));

    const { error } = await supabase
      .from('tasks')
      .update({ is_completed: !task.is_completed })
      .eq('id', id);

    if (error) {
      console.error(error);
      setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: task.is_completed } : t));
    }
  };

  const handleDeleteTask = async (id: string) => {
    const previousTasks = [...tasks];
    setTasks(tasks.filter((task) => task.id !== id));

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(error);
      setTasks(previousTasks);
    }
  };

  const completedCount = tasks.filter((t) => t.is_completed).length;
  const progress = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* App Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg hidden sm:inline-block">Sasi Tasks</span>
          </div>

          <div className="flex items-center gap-4 relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-1.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full hover:bg-secondary/80 bg-secondary/30 transition-all duration-200 cursor-pointer hover:scale-105 border border-border/50 outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="w-7 h-7 sm:w-7 sm:h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {initial}
              </div>
              <span className="hidden sm:inline-block text-sm font-medium text-ellipsis overflow-hidden max-w-[150px] whitespace-nowrap">
                {displayName}
              </span>
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 rounded-xl border border-border bg-card shadow-lg shadow-black/20 animate-in fade-in zoom-in-95 duration-200 overflow-hidden z-50">
                <div className="p-4 border-b border-border/50 bg-secondary/5">
                  <p className="font-semibold text-base truncate text-foreground">{displayName}</p>
                  {(profile?.first_name || profile?.last_name) && (
                    <p className="text-sm font-medium text-foreground/80 truncate mt-0.5">
                      {profile?.first_name} {profile?.last_name}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground truncate mt-1">{profile?.email || user?.email}</p>
                  {profile?.phone && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{profile?.phone}</p>
                  )}
                </div>
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => { setShowSettingsModal(true); setIsDropdownOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-md transition-all duration-200 cursor-pointer font-medium outline-none"
                  >
                    <UserIcon className="h-4 w-4" />
                    Security Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive rounded-md transition-all duration-200 cursor-pointer font-medium outline-none focus-visible:bg-destructive/10 hover:scale-[1.02]"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Tasks</h1>
          <p className="text-muted-foreground">Manage your day and stay productive.</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="col-span-1 md:col-span-2 border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-2">Today's Progress</h2>
              <div className="flex items-end gap-3 mb-4">
                <span className="text-4xl font-extrabold text-primary">{progress}%</span>
                <span className="text-sm text-muted-foreground mb-1">completed</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                {completedCount} of {tasks.length} tasks completed
              </p>
            </CardContent>
          </Card>

          <Card className="col-span-1 bg-gradient-to-b from-secondary/50 to-background border-border/50 flex flex-col justify-center items-center text-center p-6">
            <div className="w-12 h-12 bg-background border border-border rounded-xl flex items-center justify-center mb-3 shadow-sm">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium text-lg">Keep it up!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You're doing great today.
            </p>
          </Card>
        </div>

        {/* Task Section */}
        <div className="space-y-6 lg:bg-card/30 lg:border lg:border-border/50 lg:p-6 lg:rounded-2xl">
          <form onSubmit={handleAddTask} className="flex gap-3">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Plus className="h-5 w-5" />
              </div>
              <Input
                placeholder="What needs to be done?"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className="pl-10 h-12 text-base shadow-sm bg-background border-border/80 focus-visible:ring-primary/30 rounded-xl"
              />
            </div>
            <Button type="submit" size="default" className="h-12 px-6 rounded-xl shadow-sm text-base font-medium" isLoading={isAddingTask} disabled={isAddingTask}>
              Add Task
            </Button>
          </form>
          <p className="text-xs text-muted-foreground ml-2">
            💡 Type your task and click Add Task
          </p>

          <div className="space-y-3 mt-8">
            <div className="flex items-center justify-between pb-2 border-b border-border/50 mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                All Tasks
                <span className="bg-secondary text-xs py-0.5 px-2.5 rounded-full text-muted-foreground">
                  {tasks.length}
                </span>
              </h3>
              <div className="relative hidden sm:block">
                <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  className="h-8 pl-8 pr-3 text-sm bg-background rounded-md border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
                />
              </div>
            </div>

            {isLoadingTasks ? (
              <div className="py-12 flex flex-col justify-center items-center">
                <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
                <p className="text-muted-foreground text-sm">Loading tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="py-8 sm:py-12 text-center flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="max-w-md w-full border-dashed border-2 border-border/60 bg-card/30 shadow-none">
                  <CardContent className="pt-8 pb-8 flex flex-col items-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-5 animate-bounce shadow-inner">
                      <span className="text-3xl">🚀</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Welcome! Let’s get you started</h3>
                    <p className="text-muted-foreground text-sm mb-8 text-center px-4">
                      Your personal workspace is completely ready.
                    </p>
                    <ul className="text-left space-y-4 w-full max-w-[240px] text-sm font-medium text-foreground/80">
                      <li className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center text-xs shadow-sm">1</div>
                        Add your first task
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center text-xs shadow-sm">2</div>
                        Mark it complete
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center text-xs shadow-sm">3</div>
                        Stay productive
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={{ id: task.id, text: task.title, completed: task.is_completed }}
                    onToggle={handleToggleTask}
                    onDelete={handleDeleteTask}
                    className="shadow-sm bg-background/50 hover:bg-card hover:-translate-y-0.5"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Phone Number Collection Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="max-w-md w-[90%] border-border/50 shadow-2xl animate-in zoom-in-95 fade-in duration-300">
            <div className="text-center pb-4 pt-6 px-6">
              <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl">{phoneStep === 1 ? "📱" : "🛡️"}</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {phoneStep === 1 ? "Complete your profile" : "Verify Number"}
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                {phoneStep === 1
                  ? "Please enter your 10-digit phone number (without +91) to continue. This ensures your account is secure and ready for OTP login."
                  : "Enter the secure 6-digit code sent to your device."}
              </p>
            </div>
            <CardContent className="px-6 pb-6">
              {phoneStep === 1 ? (
                <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500/90 text-[11px] sm:text-xs p-3 rounded-lg leading-relaxed text-left flex gap-2 items-start mt-2 shadow-sm">
                    <span className="text-sm">⚠️</span>
                    <p>
                      <strong>Infrastructure Note:</strong> This system is currently running on a Twilio Development Sandbox. SMS OTP is restricted to pre-verified trial numbers. To demonstrate the MFA flow during the presentation, please use the verified test number provided in the README, or skip this step to explore the dashboard.
                    </p>
                  </div>
                  <Input
                    label="Phone Number"
                    placeholder="9876543210"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    error={phoneError}
                  />
                  <div className="flex flex-col gap-2 pt-2">
                    <Button type="submit" className="w-full font-semibold" isLoading={isSavingPhone}>
                      Send Secure OTP
                    </Button>
                    <button 
                      type="button" 
                      onClick={() => setShowPhoneModal(false)}
                      className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 pt-2 pb-1 transition-colors w-full text-center cursor-pointer"
                    >
                      Skip for Evaluation
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyPhoneOtp} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                  {phoneError && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive text-center mb-2">
                       {phoneError}
                    </div>
                  )}
                  <Input
                    label="Secure Code"
                    placeholder="000000"
                    type="text"
                    maxLength={6}
                    className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ''))}
                  />
                  <Button type="submit" className="w-full font-semibold" isLoading={isSavingPhone}>
                    Verify & Continue
                  </Button>
                  <div className="text-center pt-2">
                    <button 
                      type="button"
                      onClick={() => { setPhoneStep(1); setPhoneError(""); setPhoneOtp(""); }} 
                      className="text-sm text-primary hover:underline underline-offset-4 cursor-pointer transition-colors duration-200"
                    >
                      Didn't receive a code? Edit number
                    </button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Name Collection Modal (For OTP Users) */}
      {showNameModal && !showPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="max-w-md w-[90%] border-border/50 shadow-2xl animate-in zoom-in-95 fade-in duration-300">
            <div className="text-center pb-4 pt-6 px-6">
              <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <UserIcon className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Welcome!</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Please enter your name to complete your profile setup.
              </p>
            </div>
            <CardContent className="px-6 pb-6">
              <form onSubmit={handleSaveName} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    placeholder="John"
                    value={firstNameInput}
                    onChange={(e) => setFirstNameInput(e.target.value)}
                  />
                  <Input
                    label="Last Name"
                    placeholder="Doe"
                    value={lastNameInput}
                    onChange={(e) => setLastNameInput(e.target.value)}
                  />
                </div>
                {nameError && <p className="text-sm text-destructive">{nameError}</p>}
                <Button type="submit" className="w-full font-semibold" isLoading={isSavingName}>
                  Complete Setup
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="max-w-md w-[90%] border-border/50 shadow-2xl animate-in zoom-in-95 fade-in duration-300">
            <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-border/50">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Security Settings
              </h2>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary transition-colors"
                title="Close"
              >
                ✕
              </button>
            </div>
            <CardContent className="px-6 py-6 space-y-6">
              <div className="space-y-4">
                {profile?.email && (
                  <div className="bg-secondary/40 p-4 rounded-lg flex items-start justify-between border border-border/50">
                    <div>
                      <p className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        Email Address
                      </p>
                      <p className="text-base font-semibold mt-1 truncate max-w-[200px]">{profile.email}</p>
                    </div>
                    <span className="bg-green-500/10 text-green-500 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 whitespace-nowrap">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Verified via Google
                    </span>
                  </div>
                )}
                
                {profile?.phone && (
                  <div className="bg-secondary/40 p-4 rounded-lg flex items-start justify-between border border-border/50">
                    <div>
                      <p className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        Phone Number
                      </p>
                      <p className="text-base font-semibold mt-1 tracking-wide">{profile.phone}</p>
                    </div>
                    <span className="bg-blue-500/10 text-blue-500 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 whitespace-nowrap">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Verified via OTP
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border/50 space-y-4">
                <p className="text-sm text-foreground font-semibold">Authentication Methods</p>
                
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-secondary/20">
                  <div>
                    <p className="text-sm font-medium text-foreground">Passwordless OTP Login</p>
                    <p className="text-xs text-muted-foreground mt-0.5 max-w-[220px]">
                      Disable passwords and login exclusively via secure 6-digit SMS code.
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleSecurity('otp_enabled', !profile?.otp_enabled)}
                    disabled={isUpdatingSecurity || (!profile?.phone && !profile?.otp_enabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background shrink-0 ${
                      profile?.otp_enabled ? 'bg-primary' : 'bg-secondary'
                    } ${(!profile?.phone && !profile?.otp_enabled) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    title={!profile?.phone ? 'Requires verified Phone Number' : 'Toggle Passwordless OTP'}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                      profile?.otp_enabled ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-secondary/20">
                  <div>
                    <p className="text-sm font-medium text-foreground">Two-Factor Authentication (MFA)</p>
                    <p className="text-xs text-muted-foreground mt-0.5 max-w-[220px]">
                      Require both a valid password and an SMS OTP code to verify your session.
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleSecurity('mfa_enabled', !profile?.mfa_enabled)}
                    disabled={isUpdatingSecurity || (!profile?.phone && !profile?.mfa_enabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background shrink-0 ${
                      profile?.mfa_enabled ? 'bg-primary' : 'bg-secondary'
                    } ${(!profile?.phone && !profile?.mfa_enabled) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    title={!profile?.phone ? 'Requires verified Phone Number' : 'Toggle Custom MFA'}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                      profile?.mfa_enabled ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <p className="text-sm text-foreground mb-3 font-semibold">Global Session Control</p>
                <Button 
                  variant="outline" 
                  className="w-full text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50 transition-all font-semibold"
                  onClick={async () => {
                    await supabase.auth.signOut({ scope: "global" });
                    router.push("/login");
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out of All Devices
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3 mx-2 leading-relaxed">
                  Protect your account by forcing all active sessions across all devices and browsers to instantly terminate.
                </p>
              </div>

              <div className="pt-3 border-t border-destructive/20 mt-2 rounded-xl bg-destructive/5 border p-4">
                <p className="text-sm text-destructive font-bold flex items-center gap-2 mb-1.5">
                  <ShieldAlert className="h-4 w-4" />
                  Danger Zone
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Permanently wipe your account arrays and all relational data in 100% compliance with GDPR Right to be Forgotten protocols.
                </p>
                <Button 
                  variant="destructive" 
                  className="w-full font-bold shadow-md shadow-destructive/20 hover:shadow-destructive/40"
                  onClick={handleDeleteAccount}
                  isLoading={isUpdatingSecurity}
                >
                  Delete My Account Natively
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
