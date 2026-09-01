'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Sparkles, Mail, Lock, User, Phone, Loader2, Check } from 'lucide-react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuthStore, useUIStore } from '@/lib/store';
import { authApi } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { showToast } = useUIStore();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreed, setAgreed] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (form.phone && !/^\d{10}$/.test(form.phone)) e.phone = 'Enter valid 10-digit number';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    if (!agreed) e.terms = 'Please agree to the terms';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await authApi.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      const { user } = data.data;
      showToast(`Welcome to HairsUp, ${user.firstName}! Please sign in to continue.`);
      router.push('/login');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showToast(error?.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return;
    setLoading(true);
    try {
      const { data } = await authApi.google(credentialResponse.credential);
      const { user, accessToken, refreshToken } = data.data;
      setAuth(user, accessToken, refreshToken);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      showToast(`Welcome to HairsUp, ${user.firstName}! 🎉`);
      router.push('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showToast(error?.response?.data?.message || 'Google sign-in failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (() => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[!@#$%^&*]/.test(p)) score++;
    return score;
  })();

  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400'];

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-950 via-brand-800 to-purple-700 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white" style={{ width: `${60 + i * 50}px`, height: `${60 + i * 50}px`, top: `${i * 20}%`, right: `${i % 2 === 0 ? -20 : 30}%` }} />
          ))}
        </div>
        <Link href="/" className="flex items-center gap-2 relative z-10">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-display font-bold text-white">HairsUp</span>
        </Link>
        <div className="relative z-10">
          <h2 className="text-4xl font-display font-bold text-white mb-4">Join the HairsUp Family</h2>
          <p className="text-white/70 text-lg mb-8">Create your account and unlock the full HairsUp experience.</p>
          <div className="space-y-4">
            {['₹500 welcome discount on your first order', 'Early access to new arrivals & sales', 'Personalised style recommendations', 'Expert wig care tips & tutorials', 'Free virtual try-on for all members'].map((perk) => (
              <div key={perk} className="flex items-center gap-3 text-white/80">
                <div className="w-5 h-5 rounded-full bg-green-400/30 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-green-300" />
                </div>
                <span className="text-sm">{perk}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/40 text-xs relative z-10">© 2025 HairsUp Technologies Pvt. Ltd.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 bg-white overflow-y-auto">
        <div className="max-w-md w-full mx-auto">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Sparkles className="w-6 h-6 text-brand-600" />
            <span className="text-xl font-display font-bold text-gradient">HairsUp</span>
          </div>

          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-500 mb-8">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    placeholder="Priya"
                    className={`input-field pl-10 ${errors.firstName ? 'border-red-400' : ''}`}
                  />
                </div>
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                <input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Sharma"
                  className={`input-field ${errors.lastName ? 'border-red-400' : ''}`}
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className={`input-field pl-10 ${errors.email ? 'border-red-400' : ''}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number <span className="text-gray-400">(optional)</span></label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="9876543210"
                  className={`input-field pl-10 ${errors.phone ? 'border-red-400' : ''}`}
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-400' : ''}`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= passwordStrength ? strengthColors[passwordStrength] : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <p className={`text-xs ${passwordStrength >= 3 ? 'text-green-600' : passwordStrength === 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {strengthLabels[passwordStrength]} password
                  </p>
                </div>
              )}
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  placeholder="Re-enter password"
                  className={`input-field pl-10 ${errors.confirm ? 'border-red-400' : ''}`}
                />
                {form.confirm && form.password === form.confirm && (
                  <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
              </div>
              {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 text-brand-600 rounded" />
              <span className="text-sm text-gray-600">
                I agree to HairsUp&apos;s{' '}
                <Link href="/terms" className="text-brand-600 hover:underline">Terms of Service</Link> and{' '}
                <Link href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link>
              </span>
            </label>
            {errors.terms && <p className="text-red-500 text-xs">{errors.terms}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating Account…</> : 'Create Account — Free'}
            </button>
          </form>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">OR CONTINUE WITH</div>
          </div>

          <div className="mt-4 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => showToast('Google sign-in failed', 'error')}
              width="384"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
