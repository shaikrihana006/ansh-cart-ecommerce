import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, register, quickDemoLogin } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      await login(email, password);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      await register({
        name,
        email,
        password,
        phone,
        address,
        city,
        postal_code: postalCode,
      });
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Email might already exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await quickDemoLogin();
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg('Demo login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        id="auth-modal-container"
        className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/70">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-neutral-900 font-['Space_Grotesk']">
              {tab === 'login' ? 'Customer Sign In' : 'Create an Account'}
            </span>
          </div>
          <button
            id="close-auth-modal-btn"
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-neutral-100/70 border-b border-neutral-200 text-xs font-semibold">
          <button
            id="auth-tab-signin"
            onClick={() => {
              setTab('login');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              tab === 'login' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Sign In
          </button>
          <button
            id="auth-tab-register"
            onClick={() => {
              setTab('register');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              tab === 'register' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Quick Demo Login Pill */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Portfolio Demo Account
              </span>
              <p className="text-[11px] text-amber-800">
                Instantly test with pre-seeded order history.
              </p>
            </div>
            <button
              id="quick-demo-login-btn"
              type="button"
              onClick={handleQuickDemo}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
            >
              1-Click Demo
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Email Address</label>
                <div className="relative">
                  <input
                    id="login-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ansh@anshcart.com"
                    className="w-full bg-neutral-50 focus:bg-white text-neutral-900 pl-9 pr-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-500"
                  />
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    id="login-password-input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-neutral-50 focus:bg-white text-neutral-900 pl-9 pr-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-500"
                  />
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2 active:scale-98"
              >
                {loading ? 'Authenticating...' : 'Sign In to ANSH CART'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Full Name *</label>
                <div className="relative">
                  <input
                    id="register-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Anshul Verma"
                    className="w-full bg-neutral-50 focus:bg-white text-neutral-900 pl-9 pr-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-500"
                  />
                  <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Email Address *</label>
                <div className="relative">
                  <input
                    id="register-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full bg-neutral-50 focus:bg-white text-neutral-900 pl-9 pr-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-500"
                  />
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Password *</label>
                <div className="relative">
                  <input
                    id="register-password-input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full bg-neutral-50 focus:bg-white text-neutral-900 pl-9 pr-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-500"
                  />
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Phone (Optional)</label>
                <div className="relative">
                  <input
                    id="register-phone-input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-neutral-50 focus:bg-white text-neutral-900 pl-9 pr-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-500"
                  />
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Default Shipping Address</label>
                <div className="relative">
                  <input
                    id="register-address-input"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Market Street"
                    className="w-full bg-neutral-50 focus:bg-white text-neutral-900 pl-9 pr-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-500"
                  />
                  <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">City</label>
                  <input
                    id="register-city-input"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="San Francisco"
                    className="w-full bg-neutral-50 focus:bg-white text-neutral-900 px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Zip Code</label>
                  <input
                    id="register-postal-input"
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="94103"
                    className="w-full bg-neutral-50 focus:bg-white text-neutral-900 px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-500"
                  />
                </div>
              </div>

              <button
                id="register-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-3 active:scale-98"
              >
                {loading ? 'Creating Account in SQLite...' : 'Create Account'}
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-[11px] text-neutral-400">
            Protected by bcrypt password encryption and SQLite database storage.
          </div>
        </div>
      </div>
    </div>
  );
};
