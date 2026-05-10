import { useState } from 'react';
import { ArrowLeft, User, Mail, Lock, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Patient } from '../types/database';

interface PatientAuthProps {
  onBack: () => void;
  onLogin: (patient: Patient) => void;
}

export default function PatientAuth({ onBack, onLogin }: PatientAuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('email', formData.email)
          .eq('password', formData.password)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          setError('Invalid email or password');
          setLoading(false);
          return;
        }

        onLogin(data);
      } else {
        const { data: existing } = await supabase
          .from('patients')
          .select('id')
          .eq('email', formData.email)
          .maybeSingle();

        if (existing) {
          setError('Email already registered');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('patients')
          .insert({
            patient_name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
          })
          .select()
          .single();

        if (error) throw error;
        onLogin(data);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        <div className="bg-slate-800/80 backdrop-blur-lg border border-cyan-500/30 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {isLogin ? 'Patient Login' : 'Patient Registration'}
            </h2>
            <p className="text-slate-300 text-sm">
              {isLogin ? 'Access your emergency services' : 'Create your patient account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-lg pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-lg pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/50"
            >
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ name: '', email: '', password: '', phone: '' });
              }}
              className="text-cyan-300 hover:text-cyan-200 text-sm transition-colors"
            >
              {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
