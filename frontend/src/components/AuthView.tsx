import React, { useState } from 'react';
import {
  Pill,
  ShieldCheck,
  Building2,
  Stethoscope,
  UserCheck,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  FileBadge,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  KeyRound,
  LogOut,
  Hospital,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface AuthViewProps {
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'login',
  onSuccess,
}) => {
  const {
    currentUser,
    users,
    login,
    register,
    logout,
    switchAccount,
    setActiveTab,
    setCurrentRole,
    pharmacies,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [clinicHospital, setClinicHospital] = useState('');
  const [selectedPharmacyId, setSelectedPharmacyId] = useState(pharmacies[0]?.id || 'pharma-1');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

  // Quick Demo Accounts
  const demoAccounts = [
    {
      role: 'patient' as UserRole,
      title: 'Patient / Consumer',
      name: 'Yash Kaurani',
      email: 'yashkaurani@gmail.com',
      badge: 'Price comparison & Rx Vault',
      icon: UserCheck,
    },
    {
      role: 'pharmacy' as UserRole,
      title: 'Pharmacy Partner',
      name: 'CarePoint Dispensing Manager',
      email: 'carepoint.ops@healthway.com',
      badge: 'Order fulfillment & inventory',
      icon: Building2,
    },
    {
      role: 'doctor' as UserRole,
      title: 'Doctor / Prescriber',
      name: 'Dr. Priya Sharma, MD',
      email: 'dr.priya.sharma@medcenter.org',
      badge: 'Prescription issuer & formulary',
      icon: Stethoscope,
    },
    {
      role: 'admin' as UserRole,
      title: 'Admin & Operations',
      name: 'Marcus Vance',
      email: 'marcus.vance@genericmed.io',
      badge: 'Audit logs & catalog rules',
      icon: ShieldCheck,
    },
  ];

  // Route user to appropriate landing tab after authentication
  const redirectAfterAuth = (role: UserRole) => {
    if (onSuccess) {
      onSuccess();
      return;
    }
    switch (role) {
      case 'pharmacy':
        setActiveTab('pharmacy_orders');
        break;
      case 'admin':
        setActiveTab('admin_dashboard');
        break;
      case 'doctor':
        setActiveTab('doctor_prescribe');
        break;
      case 'patient':
      default:
        setActiveTab('compare');
        break;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email, password, selectedRole);
      if (res.success) {
        redirectAfterAuth(selectedRole);
      } else {
        setErrorMessage(res.error || 'Unable to sign in. Please verify your credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('You must acknowledge the Healthcare Data & Privacy terms to register.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register({
        name: fullName,
        email,
        password,
        role: selectedRole,
        phone,
        address,
        licenseNumber,
        clinicHospital,
        pharmacyId: selectedRole === 'pharmacy' ? selectedPharmacyId : undefined,
      });

      if (res.success) {
        redirectAfterAuth(selectedRole);
      } else {
        setErrorMessage(res.error || 'Failed to create account.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (account: (typeof demoAccounts)[0]) => {
    setErrorMessage(null);
    setEmail(account.email);
    setSelectedRole(account.role);
    setIsSubmitting(true);
    try {
      const res = await login(account.email, 'demo-secret-token', account.role);
      if (res.success) {
        redirectAfterAuth(account.role);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score, label: 'Moderate', color: 'bg-amber-500' };
    return { score, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-6">
      {/* Active Session Status Banner if logged in */}
      {currentUser && (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/80 dark:bg-emerald-950/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                  {currentUser.name}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                  <CheckCircle2 className="h-3 w-3" />
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {currentUser.email} • Session Authenticated
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => redirectAfterAuth(currentUser.role)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs"
            >
              <span>Go to Workspace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold transition"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Authentication Card */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xl">
        {/* Top Header */}
        <div className="p-6 sm:p-8 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-emerald-50/50 via-teal-50/20 to-zinc-50/50 dark:from-emerald-950/20 dark:via-zinc-900 dark:to-zinc-900 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>HIPAA-Compliant Secure Authentication</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              {mode === 'login' ? 'Sign In to genericMed' : 'Create Your genericMed Account'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {mode === 'login'
                ? 'Access price comparison corridors, prescription vaults, orders, and pharmacy workflows.'
                : 'Join the transparent medicine network as a patient, accredited pharmacy partner, or prescriber.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0 self-center sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                mode === 'login'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                mode === 'register'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {/* Persona Role Selection */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
              Select Your Role / Access Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { role: 'patient' as UserRole, label: 'Patient / Consumer', icon: UserCheck, desc: 'Shop & track orders' },
                { role: 'pharmacy' as UserRole, label: 'Pharmacy Partner', icon: Building2, desc: 'Fulfill & manage stock' },
                { role: 'doctor' as UserRole, label: 'Doctor / Prescriber', icon: Stethoscope, desc: 'Digital Rx formulary' },
                { role: 'admin' as UserRole, label: 'Operations Admin', icon: ShieldCheck, desc: 'Audits & governance' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = selectedRole === item.role;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => setSelectedRole(item.role)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/20'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`} />
                      <span className="text-xs font-bold truncate">{item.label}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 truncate">
                      {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Content: LOGIN vs REGISTER */}
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      selectedRole === 'patient'
                        ? 'e.g. yashkaurani@gmail.com'
                        : selectedRole === 'pharmacy'
                        ? 'e.g. carepoint.ops@healthway.com'
                        : selectedRole === 'doctor'
                        ? 'e.g. dr.priya.sharma@medcenter.org'
                        : 'e.g. marcus.vance@genericmed.io'
                    }
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Password / Access Key
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordSent(true)}
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Forgot access key?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your confidential credentials"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {forgotPasswordSent && (
                <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-300">
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400 mb-0.5">
                    Recovery Link Dispatched:
                  </div>
                  If {email || 'your account'} is on file, a 6-digit recovery OTP and magic reset link have been issued. You can also use the 1-click test accounts below.
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Authenticating Session...</span>
                ) : (
                  <>
                    <span>Sign In as {selectedRole.toUpperCase()}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Dr. Arthur Dent"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Official Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. user@domain.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Confirmation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Create Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-1.5 flex items-center gap-2 text-[10px]">
                      <div className="h-1 flex-1 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                        <div
                          className={`h-full ${strength.color}`}
                          style={{ width: `${(strength.score / 5) * 100}%` }}
                        />
                      </div>
                      <span className="font-semibold text-zinc-500">{strength.label}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type your password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Role-Specific Registration Fields */}
              {selectedRole === 'patient' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Contact Phone (for delivery SMS tracking)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Default Delivery Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Street, City, Postal Code"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedRole === 'pharmacy' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Select Pharmacy Organization / Outlet
                    </label>
                    <select
                      value={selectedPharmacyId}
                      onChange={(e) => setSelectedPharmacyId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      {pharmacies.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.city}) - {p.licenseNumber}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Pharmacy Drug License #
                    </label>
                    <div className="relative">
                      <FileBadge className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <input
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="e.g. DL-KA-2026-88123"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedRole === 'doctor' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Medical Council Registration #
                    </label>
                    <div className="relative">
                      <FileBadge className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <input
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="e.g. MCI-REG-2026-7782"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Clinic or Hospital Affiliation
                    </label>
                    <div className="relative">
                      <Hospital className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <input
                        type="text"
                        value={clinicHospital}
                        onChange={(e) => setClinicHospital(e.target.value)}
                        placeholder="e.g. Metro General Hospital"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedRole === 'admin' && (
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Operations Security Token / Authorization Key
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="e.g. SEC-OPS-PLATFORM-2026"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              )}

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-zinc-600 dark:text-zinc-400 select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>
                    I accept the <strong className="text-zinc-800 dark:text-zinc-200">genericMed HIPAA & SLA Terms</strong> and consent to verifiable pharmaceutical audit logs for order and prescription transactions.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Complete Registration & Launch</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo 1-Click Login Tiles */}
          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                <span>Instant 1-Click Demo Profiles</span>
              </span>
              <span className="text-[11px] text-zinc-400">Pre-seeded with real orders & data</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleQuickLogin(acc)}
                    className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-zinc-50/70 dark:bg-zinc-800/40 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 text-left transition flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 flex items-center justify-center text-zinc-700 dark:text-zinc-200 shrink-0 group-hover:text-emerald-600">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {acc.name}
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate">
                          {acc.title} • {acc.email}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-emerald-500 shrink-0 transition" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
