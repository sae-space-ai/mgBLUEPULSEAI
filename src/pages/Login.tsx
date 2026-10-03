import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Waves, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email, password);
    if (!success) {
      setError('Invalid credentials. Use demo@bluepulse.ai / demo123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/50 via-slate-950 to-cyan-950/30" />
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <svg viewBox="0 0 1000 1000" className="w-full h-full">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#3b82f6" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 mb-4 shadow-lg shadow-blue-500/20">
            <Waves className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">BLUEPULSE AI</h1>
          <p className="text-sm text-slate-400 mt-1">Intelligent Structural Monitoring & Predictive Maintenance</p>
          <p className="text-xs text-slate-500 mt-1">Floating Offshore Wind - Mooring & Anchoring Systems</p>
        </div>

        {/* Login form */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="demo@bluepulse.ai"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="demo123"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-blue-500/20"
            >
              Sign In
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-800">
            <p className="text-[10px] text-slate-500 text-center">
              Demo credentials: demo@bluepulse.ai / demo123
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-[10px] text-slate-600">
            I3FLOAT Open Challenge 1.2.3 | TRL 6-7 Prototype
          </p>
          <p className="text-[10px] text-slate-600 mt-0.5">
            Budget: €60,000 | Duration: 12 months (Jan-Dec 2027)
          </p>
        </div>
      </div>
    </div>
  );
}
