import React, { useState } from 'react';
import { useHunter } from '../../context/HunterContext';
import { loginWithGoogle } from '../../config/firebase';
import {
  Shield,
  KeyRound,
  User,
  LogIn,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Zap,
  Sparkles,
  Lock,
  CheckSquare,
  Square,
  Globe,
  Activity,
  ArrowRight,
} from 'lucide-react';

export const HunterAccessGate: React.FC = () => {
  const {
    loginAccount,
    registerAccount,
    rememberMe,
    setRememberMePreference,
    authLoading,
  } = useHunter();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [localRememberMe, setLocalRememberMe] = useState<boolean>(true);

  // Register form state
  const [regUsername, setRegUsername] = useState<string>('');
  const [regDisplayName, setRegDisplayName] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');

  // UI state
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both your hunter username and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await loginAccount(username.trim(), password.trim(), localRememberMe);
      if (result.success) {
        setSuccessMessage(`ACCESS GRANTED // Welcome back, Hunter ${result.account?.displayName || username}!`);
      } else {
        setErrorMessage(result.message || 'Access Denied. Check your credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regUsername.trim() || !regPassword.trim()) {
      setErrorMessage('Hunter username and password are required.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Re-enter password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerAccount(
        regUsername.trim(),
        regPassword.trim(),
        regDisplayName.trim() || regUsername.trim(),
        localRememberMe
      );
      if (result.success) {
        setSuccessMessage(`HUNTER REGISTERED // Welcome, ${result.account?.displayName || regUsername}! Clearance Granted.`);
      } else {
        setErrorMessage(result.message || 'Failed to initialize hunter profile.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    setErrorMessage('');
    try {
      await loginWithGoogle();
      setSuccessMessage('GOOGLE CLOUD SYNC AUTHORIZED // Synchronizing database...');
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setErrorMessage('Google authorization was cancelled or encountered an error.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06080e] flex items-center justify-center p-3 sm:p-6 relative overflow-hidden select-none">
      {/* Background Cyber Aesthetics & Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Access Portal Gateway Container */}
      <div className="relative w-full max-w-lg z-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="rounded-2xl glass-panel-glow border-2 border-cyan-500/40 p-5 sm:p-8 shadow-[0_0_60px_rgba(6,182,212,0.25)] bg-slate-950/90 backdrop-blur-xl">
          {/* Header & System Gate Logo */}
          <div className="text-center pb-5 mb-5 border-b border-cyan-500/20">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 shadow-[0_0_30px_rgba(6,182,212,0.6)] border border-cyan-300 mb-3">
              <Zap className="w-8 h-8 text-black fill-black" />
            </div>

            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-[11px] font-mono uppercase bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2.5 py-0.5 rounded-full font-bold tracking-wider">
                SYSTEM GATEWAY // CLEARANCE REQUIRED
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-wider text-glow-cyan">
              FITNESS BUDDY
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              SOLO LEVELING HUNTER OS // UNIVERSAL DATABASE ACCESS
            </p>
          </div>

          {/* Tab Selector: Login vs Register */}
          <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>HUNTER LOGIN</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>REGISTER NEW HUNTER</span>
            </button>
          </div>

          {/* Feedback Toasts */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/70 border border-red-500/50 flex items-start gap-2.5 text-xs text-red-200 font-mono animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 flex items-center gap-2.5 text-xs text-emerald-200 font-mono animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Tab 1: Hunter Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Hunter Username:</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter hunter username (e.g. jon)"
                  autoComplete="username"
                  required
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Security Password:</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all"
                />
              </div>

              {/* Remember Me / Always Login Toggle */}
              <div
                onClick={() => setLocalRememberMe(!localRememberMe)}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-colors flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  {localRememberMe ? (
                    <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500 group-hover:text-slate-400 shrink-0" />
                  )}
                  <div>
                    <span className="text-xs font-bold text-slate-200 font-mono block">
                      REMEMBER ME / ALWAYS LOGIN
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      Stay logged in on this device across browser sessions
                    </span>
                  </div>
                </div>
                <div className={`text-[10px] font-mono px-2 py-0.5 rounded ${localRememberMe ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'}`}>
                  {localRememberMe ? 'ACTIVE' : 'OFF'}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold text-xs font-heading shadow-[0_0_25px_rgba(6,182,212,0.5)] cursor-pointer transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <LogIn className="w-4 h-4 fill-black" />
                <span>{isSubmitting ? 'VERIFYING CLEARANCE...' : 'ENTER HUNTER SYSTEM'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Tab 2: Register New Hunter Form */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Choose Hunter Username:</span>
                </label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="Username (e.g. jinwoo, shadow)"
                  autoComplete="username"
                  required
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Display Name / Hunter Title:</span>
                </label>
                <input
                  type="text"
                  value={regDisplayName}
                  onChange={(e) => setRegDisplayName(e.target.value)}
                  placeholder="Display Name (e.g. Sung Jin-Woo)"
                  required
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Create Password:</span>
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Password"
                    autoComplete="new-password"
                    required
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Confirm Password:</span>
                  </label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    required
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Remember Me / Always Login Toggle */}
              <div
                onClick={() => setLocalRememberMe(!localRememberMe)}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-colors flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  {localRememberMe ? (
                    <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500 group-hover:text-slate-400 shrink-0" />
                  )}
                  <div>
                    <span className="text-xs font-bold text-slate-200 font-mono block">
                      REMEMBER ME / ALWAYS LOGIN
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      Keep me logged in across future visits
                    </span>
                  </div>
                </div>
                <div className={`text-[10px] font-mono px-2 py-0.5 rounded ${localRememberMe ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'}`}>
                  {localRememberMe ? 'ACTIVE' : 'OFF'}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold text-xs font-heading shadow-[0_0_25px_rgba(6,182,212,0.5)] cursor-pointer transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? 'INITIALIZING PROFILE...' : 'INITIALIZE NEW HUNTER PROFILE'}</span>
              </button>
            </form>
          )}

          {/* Cross-Device Cloud Sync Option: Google Cloud Database Sync */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center gap-2 mb-3 justify-center">
              <span className="h-px flex-1 bg-slate-800" />
              <span className="text-[10px] font-mono uppercase text-slate-400 px-2 tracking-wider">
                OR CLOUD DATABASE SYNC
              </span>
              <span className="h-px flex-1 bg-slate-800" />
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={googleLoading || authLoading}
              title="Sign in with Google to cross-sync PC & Mobile splits and progression"
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-cyan-500/30 hover:border-cyan-400 text-white font-mono text-xs flex items-center justify-center gap-2.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] cursor-pointer hover:scale-[1.01]"
            >
              <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="font-bold">
                {googleLoading ? 'CONNECTING TO GOOGLE CLOUD...' : 'SIGN IN WITH GOOGLE CLOUD SYNC'}
              </span>
            </button>
            <p className="text-[10px] text-slate-400 font-mono text-center mt-2">
              Cross-syncs your workout splits, macros, and level progress between PC and Mobile Chrome.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
