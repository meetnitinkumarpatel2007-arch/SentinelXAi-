
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/lib/api";

type AuthMode = "login" | "signup";

export function AuthForm() {
  const { login, signup, error, clearError } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("analyst");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // 🎬 HACKATHON DEMO STATE
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setLocalError(null);
    clearError();

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup(email, password, role);
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  }

  const displayError = localError ?? error;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden p-6 select-none">
      
      {/* 🎬 DYNAMIC VIDEO BACKGROUND */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-80"
      >
        <source src="/cyber-bg.mp4" type="video/mp4" />
      </video>

      {/* 🌑 DARK OVERLAY (Ensures text remains readable over the bright video) */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-950/70 to-slate-950/95 z-0" />

      {/* Top Border Network Pulse Accent Decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-40 z-10" />
      
      {/* 🚀 SentinelX AI Header Branding */}
      <div className="text-center mb-8 z-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-500 drop-shadow-[0_0_20px_rgba(52,211,153,0.15)]">
          SentinelX AI
        </h1>
        <p className="text-slate-400 mt-2 font-mono text-xs uppercase tracking-[0.3em] font-medium shadow-black drop-shadow-md">
          Autonomous Threat Mitigation System
        </p>
      </div>

      {/* 🔮 High-Quality Glassmorphism Interface Card */}
      <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 shadow-[0_0_50px_rgba(16,185,129,0.05)] z-10 transition-all duration-300 hover:border-slate-700/60">
        
        {/* Navigation Action Toggles */}
        <div className="mb-6 flex rounded-lg border border-slate-800 bg-slate-950/60 p-1">
          <button
            type="button"
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
              mode === "login"
                ? "bg-gradient-to-r from-green-950/50 to-emerald-900/50 text-green-400 border border-green-800/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
            onClick={() => setMode("login")}
          >
            Log in
          </button>
          <button
            type="button"
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
              mode === "signup"
                ? "bg-gradient-to-r from-green-950/50 to-emerald-900/50 text-green-400 border border-green-800/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
            onClick={() => setMode("signup")}
          >
            Sign up
          </button>
        </div>

        {/* Access Gateway Credentials Input Form */}
        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-5">
          <label className="block space-y-1.5">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-300 drop-shadow-md">Account Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-200 outline-none transition-all focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.12)]"
              placeholder="operator@sentinelx.local"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-300 drop-shadow-md">Access Token / Password</span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-200 outline-none transition-all focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.12)]"
              placeholder="••••••••"
            />
          </label>

          {mode === "signup" ? (
            <label className="block space-y-1.5">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-300 drop-shadow-md">Clearance Permissions</span>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as UserRole)}
                className="w-full rounded-md border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-300 outline-none transition-all focus:border-green-500"
              >
                <option value="analyst">SOC Operational Analyst</option>
                <option value="ciso">CISO Security Executive</option>
                <option value="ceo">Chief Executive Officer (CEO)</option>
              </select>
            </label>
          ) : null}

          {displayError ? (
            <div className="p-3 rounded bg-red-950/40 border border-red-900/60 text-xs font-mono text-red-400">
              [ALERT ERROR]: {displayError}
            </div>
          ) : null}

          <Button 
            type="submit" 
            className="w-full py-5 font-mono text-xs uppercase tracking-widest bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-[0_4px_20px_rgba(16,185,129,0.2)] transition-all active:scale-[0.99] border-none" 
            disabled={submitting}
          >
            {submitting ? "VERIFYING INTERCEPT PATH..." : mode === "login" ? "INITIALIZE SECURITY SESSION" : "PROVISION ACCOUNT ACCESS"}
          </Button>
        </form>

        {/* ========================================= */}
        {/* 🎬 HACKATHON DEMO SHORTCUT SECTION        */}
        {/* ========================================= */}
        <div className="mt-8 border-t border-slate-800/80 pt-6 text-center">
          <p className="text-slate-500 text-[10px] mb-3 font-mono uppercase tracking-widest">
            Hackathon Evaluation Mode
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault(); 
              setIsDemoOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-mono uppercase tracking-widest text-green-400 bg-green-950/40 border border-green-500/30 rounded-md hover:bg-green-900/60 hover:text-green-300 hover:border-green-500/60 transition-all shadow-[0_0_15px_rgba(34,197,94,0.1)] active:scale-95"
          >
            ▶ Watch Live System Demo
          </button>
        </div>
      </div>

      {/* 🔒 Bottom System Environment Identity String */}
      <div className="absolute bottom-6 font-mono text-[10px] tracking-[0.2em] text-slate-400 z-10 uppercase shadow-black drop-shadow-md">
        SYS_STATUS: VERIFIED | DEPLOYMENT MODE: CLOUD EDGE NODE
      </div>

      {/* ========================================= */}
      {/* ⬛ GOOGLE DRIVE EMBED MODAL                 */}
      {/* ========================================= */}
      {isDemoOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          
          <div className="relative w-full max-w-5xl bg-slate-900 rounded-xl border border-slate-700 shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden">
            
            {/* Modal Navigation Control Bar */}
            <div className="flex justify-between items-center p-3 bg-slate-950 border-b border-slate-800">
              <span className="text-xs font-mono text-slate-400 tracking-widest uppercase flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                SYS_PLAYBACK: Autonomous Mitigation Loop
              </span>
              <button
                type="button"
                onClick={() => setIsDemoOpen(false)}
                className="text-slate-400 hover:text-red-400 bg-slate-800/50 hover:bg-red-950/50 rounded px-3 py-1 text-xs font-mono transition-colors border border-transparent hover:border-red-900/50"
              >
                [ CLOSE ]
              </button>
            </div>

            {/* Google Drive Iframe Embed Container */}
            <div className="w-full aspect-video bg-black flex items-center justify-center relative">
              <iframe 
                src="https://drive.google.com/file/d/1ZTMOI6-makPZYwF0b4It39RFIesERbBf/preview" 
                className="w-full h-full border-0 absolute inset-0"
                allow="autoplay; fullscreen"
                title="SentinelX AI Demo Video"
              ></iframe>
            </div>
          </div>
        </div>
      )}

    </div>
  );
    }
