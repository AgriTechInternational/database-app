import React, { useState } from 'react';
import { supabase, tables } from '../lib/supabase';
import { Database, Lock, User as UserIcon, AlertTriangle } from 'lucide-react';

const LAST_EMAIL_KEY = 'agritech_last_email_db';

export default function LoginScreen({ setUser }: { setUser: (user: any) => void }) {
  const [email, setEmail] = useState(() => localStorage.getItem(LAST_EMAIL_KEY) || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true); 
    setError('');

    // Force sign out first to clear any "ghost" sessions
    try { 
      await supabase.auth.signOut().catch(() => {}); 
    } catch (err) { console.warn('Pre-login purge ignored:', err); }

    try {
      if (isSignUp) {
        console.log('[Auth] Attempting Sign Up...');
        const { data, error: signUpError } = await supabase.auth.signUp({ 
          email: cleanEmail, 
          password 
        });
        if (signUpError) throw signUpError;
        if (!data.user) throw new Error('Sign up failed');

        const defaultRole = cleanEmail.toLowerCase() === 'agritech-production@hotmail.com' ? 'SUPER_ADMIN' : 'PENDING';
        
        const { error: profileError } = await supabase
          .from(tables.PROFILES)
          .upsert({ id: data.user.id, email: cleanEmail, role: defaultRole });

        if (profileError) throw profileError;
        localStorage.setItem(LAST_EMAIL_KEY, cleanEmail);
      } else {
        console.log('[Auth] Attempting Sign In...');
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ 
          email: cleanEmail, 
          password 
        });
        
        if (signInError) throw signInError;
        if (!data.user) throw new Error('Sign in failed');
        
        localStorage.setItem(LAST_EMAIL_KEY, cleanEmail);
        if (setUser) setUser(data.user);
      }
    } catch (err: any) {
      console.error('[Auth] Critical Error:', err);
      setError(err.message || 'Authentication Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-slate-900/80 border border-slate-700 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-2xl">
            <Database className="text-blue-500" size={40} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            {isSignUp ? 'Request Clearance' : 'Global Database Hub'}
          </h1>
          <p className="text-slate-400 font-medium">Restricted Access • Authenticate to continue</p>
        </div>

        <div className="financial-card p-8 shadow-2xl border-slate-700/50">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center text-sm font-medium">
                <AlertTriangle size={18} className="mr-3 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Clearance Ident (Email)</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input 
                  type="email" 
                  required 
                  className="financial-input w-full pl-11"
                  placeholder="engineer@agritech.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Protocol (Password)</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input 
                  type="password" 
                  required 
                  className="financial-input w-full pl-11"
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full flex items-center justify-center py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all active:scale-95 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <Lock size={18} className="mr-2" />
              )}
              {loading ? 'Decrypting...' : isSignUp ? 'Submit Request' : 'Authorize Login'}
            </button>
            
            <button 
              type="button" 
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }} 
              className="w-full mt-4 py-3 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-300 font-bold rounded-xl transition-all"
            >
              {isSignUp ? 'Already Registered? Login' : "Don't have access? Sign Up Here"}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-8 font-medium tracking-wider uppercase">
          AgriTech Master Command Center
        </p>
      </div>
    </div>
  );
}
