import type React from 'react';
import { useState } from 'react';
import { Lock, Mail, ShieldCheck, GraduationCap, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { INITIAL_DATA } from '../constants';
import type { AuthUser } from '../types';

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
}

export const Login: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      // 1. Check Admin Credentials
      if (email.toLowerCase() === 'admin@university.edu' && password === 'admin') {
        onLogin({
          id: 'admin',
          name: 'System Administrator',
          email: 'admin@university.edu',
          role: 'admin',
          avatarUrl: 'https://ui-avatars.com/api/?name=System+Admin&background=0f172a&color=fff'
        });
        return;
      } 
      
      // 2. Check Teacher Credentials
      // Matches email against INITIAL_DATA
      const teacher = INITIAL_DATA.teachers.find(t => t.email.toLowerCase() === email.toLowerCase());
      
      // Allow any password for demo purposes if email exists (and not admin)
      if (teacher) {
         // In a real app, verify password hash here
         onLogin({
           id: teacher.id,
           name: teacher.name,
           email: teacher.email,
           role: 'teacher',
           avatarUrl: teacher.avatarUrl,
           department: teacher.department
         });
         return;
      }

      // 3. Failed
      setError('Invalid credentials. Please check your email and password.');
      setIsLoading(false);
      
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side - Hero / Branding */}
        <div className="w-full md:w-1/2 bg-slate-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
               <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
            </svg>
          </div>
          
          <div className="z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">U</div>
              <span className="font-bold text-2xl tracking-tight">UniTime</span>
            </div>
            
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Manage Your <br/>
              <span className="text-blue-400">Academic Schedule</span> <br/>
              With Ease.
            </h1>
            <p className="text-slate-400 text-lg">
              The centralized platform for students, faculty, and administration.
            </p>
          </div>

          <div className="z-10 mt-12 space-y-4">
             <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl backdrop-blur-sm border border-slate-700">
               <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                 <GraduationCap className="w-6 h-6" />
               </div>
               <div>
                 <p className="font-bold">Faculty Portal</p>
                 <p className="text-xs text-slate-400">Manage availability & view schedules</p>
               </div>
             </div>
             
             <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl backdrop-blur-sm border border-slate-700">
               <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                 <ShieldCheck className="w-6 h-6" />
               </div>
               <div>
                 <p className="font-bold">Admin Dashboard</p>
                 <p className="text-xs text-slate-400">Full control over master timetable</p>
               </div>
             </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
            <p className="text-slate-500 mt-1">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., admin@university.edu or s.connor@tus.edu"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
                 <span className="mt-0.5 block w-1.5 h-1.5 bg-red-500 rounded-full shrink-0"></span>
                 {error}
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-slate-600">Remember me</span>
              </label>
              <button type="button" className="text-blue-600 hover:underline font-medium">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 focus:ring-4 focus:ring-slate-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center text-xs text-slate-400">
             Tip: Use 'admin@university.edu' (pass: admin) or 's.connor@tus.edu'
          </div>
        </div>
      </div>
    </div>
  );
};
