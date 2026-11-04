import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Lock, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Sun, 
  Moon, 
  Sparkles,
  ShieldCheck,
  Server
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { LiveBackground } from '../components/layout/LiveBackground';

export const LoginPage: React.FC = () => {
  const { login, theme, toggleTheme, stylePreset, isConnectorConnected } = useDashboard();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isDark = theme === 'dark';
  const isEmber = stylePreset === 'ember';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!username.trim()) {
      setErrorMessage('Please enter your username.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const success = login(username, password);
      if (!success) {
        setErrorMessage('Invalid credentials. Use username "admin" and password "admin123".');
        setIsLoading(false);
      }
    }, 400);
  };

  const handleQuickFill = () => {
    setUsername('admin');
    setPassword('admin123');
    setErrorMessage('');
  };

  return (
    <div className={`min-h-screen relative flex items-center justify-center p-4 transition-colors duration-500 font-sans select-none ${
      isDark ? 'dark bg-black text-white' : 'bg-[#F0F3F8] text-neutral-900'
    }`}>
      {/* Dynamic Animated Live Background */}
      <LiveBackground />

      {/* Top Controls: Dark/Light Mode Switcher */}
      <div className="absolute top-6 right-6 z-30">
        <button
          onClick={toggleTheme}
          aria-label="Toggle Dark/Light Mode"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-200/80 dark:border-white/10 bg-white/70 dark:bg-neutral-900/80 backdrop-blur-md shadow-sm hover:shadow-md transition-all text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer"
        >
          {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-600" />}
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      {/* Central Glassmorphic Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-20 w-full max-w-md"
      >
        <div className={`rounded-[32px] sm:rounded-[36px] backdrop-blur-2xl transition-all duration-300 p-7 sm:p-9 ${
          isDark
            ? 'bg-[#0A0A0A]/90 border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.85)] text-white'
            : 'bg-white/95 border border-neutral-200/80 shadow-[0_20px_70px_-15px_rgba(15,23,42,0.12)] text-neutral-900'
        }`}>

          {/* Header Brand Capsule matching reference */}
          <div className="flex flex-col items-center text-center mb-7">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-white/15 shadow-sm mb-4">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white ${
                isEmber 
                  ? 'bg-gradient-to-tr from-orange-600 to-amber-500' 
                  : 'bg-gradient-to-tr from-violet-600 to-indigo-500'
              }`}>
                %
              </div>
              <span className="text-base font-extrabold tracking-tight text-neutral-950 dark:text-white font-heading">
                Retail
                <span className="font-light text-neutral-400 dark:text-white/40 ml-1">
                  Pulse
                </span>
              </span>
              <span 
                className={`w-2.5 h-2.5 rounded-full ${isConnectorConnected ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`} 
                title={isConnectorConnected ? 'Connector Online' : 'Connector Offline'} 
              />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-heading">
              Sign In to Pulse
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs">
              Enterprise Multi-Source Business Intelligence & Predictive Analytics Platform
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300"
            >
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username Field */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 dark:text-neutral-500">
                  <User size={15} />
                </div>
                <input
                  id="login-username-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoFocus
                  autoComplete="username"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs bg-neutral-100/80 dark:bg-white/5 border border-neutral-200/80 dark:border-white/10 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 ${
                    isEmber ? 'focus:ring-orange-500' : 'focus:ring-violet-500'
                  } transition-all`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Password
                </label>
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                  Hint: admin123
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 dark:text-neutral-500">
                  <Lock size={15} />
                </div>
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-2xl text-xs bg-neutral-100/80 dark:bg-white/5 border border-neutral-200/80 dark:border-white/10 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 ${
                    isEmber ? 'focus:ring-orange-500' : 'focus:ring-violet-500'
                  } transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Sign In Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className={`w-full mt-2 py-3 px-4 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer ${
                isEmber
                  ? 'bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400'
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500'
              } ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-[0.99]'}`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Retail Pulse</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Autofill Helper */}
          <div className="mt-6 pt-5 border-t border-neutral-200/60 dark:border-white/10">
            <button
              id="login-autofill-btn"
              type="button"
              onClick={handleQuickFill}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-neutral-100/70 dark:bg-white/5 border border-dashed border-neutral-300 dark:border-white/15 hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={14} className={isEmber ? 'text-amber-500' : 'text-violet-400'} />
                <div className="text-left">
                  <p className="font-bold text-[11px] text-neutral-900 dark:text-white">
                    Demo Credentials
                  </p>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
                    admin / admin123
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-white dark:bg-white/10 text-neutral-800 dark:text-neutral-200 shadow-xs group-hover:scale-105 transition-transform">
                Auto-fill
              </span>
            </button>
          </div>

          {/* Subsystem Health Status Indicators */}
          <div className="mt-5 pt-4 flex items-center justify-center gap-3 text-[10px] text-neutral-400 dark:text-neutral-500">
            <div className="flex items-center gap-1.5">
              <Server size={11} className="text-emerald-500" />
              <span>Multi-Source Connector</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={11} className="text-indigo-400" />
              <span>Admin Role Auth</span>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
