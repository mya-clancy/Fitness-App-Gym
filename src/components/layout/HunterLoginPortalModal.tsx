import React, { useState } from 'react';
import { useHunter } from '../../context/HunterContext';
import {
  Shield,
  KeyRound,
  User,
  LogIn,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  X,
  Zap,
  Sparkles,
  Award,
  LogOut,
  Save,
  CheckSquare,
  Square,
} from 'lucide-react';

interface HunterLoginPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HunterLoginPortalModal: React.FC<HunterLoginPortalModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    currentAccount,
    loginAccount,
    registerAccount,
    logoutAccount,
    saveProgressToAccount,
    profile,
    rememberMe,
  } = useHunter();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Form states
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [localRememberMe, setLocalRememberMe] = useState<boolean>(rememberMe);

  // Register states
  const [regUsername, setRegUsername] = useState<string>('');
  const [regDisplayName, setRegDisplayName] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please provide both username and password.');
      return;
    }

    const result = loginAccount(username.trim(), password.trim(), localRememberMe);
    if (result.success) {
      setSuccessMessage(`Welcome back, Hunter ${result.account?.displayName || username}!`);
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 900);
    } else {
      setErrorMessage(result.message || 'Invalid username or password.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regUsername.trim() || !regPassword.trim()) {
      setErrorMessage('Username and password are required.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    const result = registerAccount(
      regUsername.trim(),
      regPassword.trim(),
      regDisplayName.trim() || regUsername.trim(),
      localRememberMe
    );

    if (result.success) {
      setSuccessMessage(`Account created! Logged in as ${result.account?.displayName || regUsername}.`);
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1200);
    } else {
      setErrorMessage(result.message || 'Failed to create account.');
    }
  };

  const handleManualSave = () => {
    saveProgressToAccount();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl glass-panel-glow border-2 border-cyan-500/40 p-5 sm:p-7 shadow-[0_0_45px_rgba(6,182,212,0.35)] my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)] border border-cyan-300">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white font-heading tracking-wider">
                  HUNTER ACCESS PORTAL
                </h3>
                <span className="text-[10px] font-mono uppercase bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded font-bold">
                  AUTH SYSTEM
                </span>
              </div>
              <p className="text-xs text-cyan-400/80 font-mono">
                Log in to sync progress, ranks, workout splits & macros
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Logged in state overview card */}
        {currentAccount && (
          <div className="mb-5 p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-mono text-slate-400">Active Account Session:</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white font-heading">
                    {currentAccount.displayName}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                    @{currentAccount.username}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-300">
                    Lv. {profile.level} ({profile.hunterRank})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleManualSave}
                title="Save current progress right now"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 hover:bg-cyan-900/80 text-cyan-300 text-xs font-mono transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-cyan-400" />
                <span>{saveSuccess ? 'SAVED!' : 'SAVE NOW'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  logoutAccount();
                  onClose();
                }}
                title="Log out from current session"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-950/50 border border-red-500/40 hover:bg-red-900/70 text-red-300 text-xs font-mono transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span>LOGOUT</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>PORTAL LOGIN</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>REGISTER NEW HUNTER</span>
          </button>
        </div>

        {/* Feedback messages */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 flex items-center gap-2 text-xs text-red-200 font-mono animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-center gap-2 text-xs text-emerald-200 font-mono animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tab 1: Login Form */}
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                <span>Password:</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
              />
            </div>

            {/* Remember Me / Always Login Toggle */}
            <div
              onClick={() => setLocalRememberMe(!localRememberMe)}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-colors flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-2">
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
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${localRememberMe ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'}`}>
                {localRememberMe ? 'ON' : 'OFF'}
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs font-heading shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 fill-black" />
              <span>ENTER HUNTER SYSTEM</span>
            </button>
          </form>
        )}

        {/* Tab 2: Register Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Hunter Username:</span>
              </label>
              <input
                type="text"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="Choose username (e.g. jinwoo)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Password:</span>
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Remember Me / Always Login Toggle */}
            <div
              onClick={() => setLocalRememberMe(!localRememberMe)}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-colors flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-2">
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
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${localRememberMe ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'}`}>
                {localRememberMe ? 'ON' : 'OFF'}
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs font-heading shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>INITIALIZE NEW HUNTER PROFILE</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
