import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { requestPasswordResetBackend } from '../services/backendAuthService';

export const AuthResetPage: React.FC = () => {
  const { navigate, showToast } = useApp();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await requestPasswordResetBackend(email);
    setIsSubmitting(false);

    setSent(true);
    showToast('Reset Link Sent', res.message || `Password reset link sent to ${email} via Resend`, 'success');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-3 text-center">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center mx-auto">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 font-sans">Reset Your Password</h2>
        <p className="text-xs text-slate-500">
          Enter your registered email address to receive a secure recovery link
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200 space-y-5">
          {sent ? (
            <div className="text-center space-y-4 py-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-900 text-sm font-sans">Recovery Email Dispatched</h3>
              <p className="text-xs text-slate-600">
                We sent a password reset link to <strong>{email}</strong>. Please check your inbox or spam folder.
              </p>
              <button
                onClick={() => navigate('/auth/login')}
                className="w-full py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@civic.gov.in"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Send Password Reset Link
              </button>

              <button
                type="button"
                onClick={() => navigate('/auth/login')}
                className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
