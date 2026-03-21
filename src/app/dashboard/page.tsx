"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card, CardContent } from "@/components/Card";
import { TaskItem } from "@/components/TaskItem";
import { CheckCircle2, LogOut, Plus, Search } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Task = {
  id: string;
  text: string;
  completed: boolean;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
  const [newTaskText, setNewTaskText] = useState("");

  useEffect(() => {
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
        // Sync profile to database
        try {
          const fullName = user.user_metadata?.full_name || '';
          const nameParts = fullName.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

          const { error: syncError } = await supabase.from('profiles').upsert({
            id: user.id,
            display_name: fullName || user.email?.split('@')[0] || 'User',
            first_name: firstName,
            last_name: lastName,
            email: user.email,
            phone: user.phone || null,
          });
          
          if (syncError) {
            console.error("Failed to sync profile:", syncError.message);
          }
        } catch (err) {
          console.error("Profile sync exception:", err);
        }

        // Fetch profile data from "profiles" table
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        setProfile(profileData);
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

  const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.email || "User";
  const initial = displayName.charAt(0).toUpperCase();

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText,
      completed: false,
    };
    
    setTasks([newTask, ...tasks]);
    setNewTaskText("");
  };

  const handleToggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const completedCount = tasks.filter((t) => t.completed).length;
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
                  {(profile?.phone || user?.phone) && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{profile?.phone || user?.phone}</p>
                  )}
                </div>
                <div className="p-2">
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
            <Button type="submit" size="default" className="h-12 px-6 rounded-xl shadow-sm text-base font-medium">
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
            
            {tasks.length === 0 ? (
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
                    task={task}
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
    </div>
  );
}
