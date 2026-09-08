import React, { useState } from 'react';
import {
  Pill,
  Search,
  ShoppingCart,
  ShieldCheck,
  Building2,
  FileText,
  UserCheck,
  Layers,
  Menu,
  X,
  Stethoscope,
  ChevronDown,
  Activity,
  Check,
  User,
  LogIn,
  UserPlus,
  LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ThemeToggle } from './ThemeToggle';
import type { Theme } from '../hooks/useTheme';
import { UserRole } from '../types';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme, onOpenCart }) => {
  const {
    currentUser,
    logout,
    currentRole,
    setCurrentRole,
    activePharmacyId,
    setActivePharmacyId,
    pharmacies,
    cart,
    cartTotals,
    activeTab,
    setActiveTab,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [pharmacyDropdownOpen, setPharmacyDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Define navigation items based on active role
  const getNavLinks = () => {
    switch (currentRole) {
      case 'pharmacy':
        return [
          { id: 'pharmacy_orders', label: 'Fulfillment Queue', icon: Building2 },
          { id: 'pharmacy_rx', label: 'Prescription Review', icon: FileText },
          { id: 'pharmacy_inventory', label: 'Inventory & Prices', icon: Layers },
          { id: 'architecture', label: 'Architecture & PRD', icon: Activity },
        ];
      case 'admin':
        return [
          { id: 'admin_dashboard', label: 'Operations Dashboard', icon: ShieldCheck },
          { id: 'admin_audit', label: 'Immutable Audit Log', icon: FileText },
          { id: 'admin_catalog', label: 'Catalog Normalization', icon: Layers },
          { id: 'architecture', label: 'Architecture & PRD', icon: Activity },
        ];
      case 'doctor':
        return [
          { id: 'doctor_prescribe', label: 'Prescriber Portal', icon: Stethoscope },
          { id: 'compare', label: 'Drug Equivalence Guide', icon: Pill },
          { id: 'architecture', label: 'Architecture & PRD', icon: Activity },
        ];
      case 'patient':
      default:
        return [
          { id: 'compare', label: 'Compare Medicines', icon: Pill },
          { id: 'prescriptions', label: 'Prescription Vault', icon: FileText },
          { id: 'orders', label: 'Track Orders', icon: ShieldCheck },
          { id: 'architecture', label: 'Architecture & PRD', icon: Activity },
        ];
    }
  };

  const navLinks = getNavLinks();
  const currentPharmacy = pharmacies.find((p) => p.id === activePharmacyId);

  const rolesList: { role: UserRole; title: string; subtitle: string; icon: any }[] = [
    {
      role: 'patient',
      title: 'Patient / Consumer',
      subtitle: 'Compare prices, upload Rx, order medicine',
      icon: UserCheck,
    },
    {
      role: 'pharmacy',
      title: 'Pharmacy Partner',
      subtitle: 'Manage orders, review Rx, update stock',
      icon: Building2,
    },
    {
      role: 'admin',
      title: 'Admin & Operations',
      subtitle: 'Audit logs, catalog rules, exceptions',
      icon: ShieldCheck,
    },
    {
      role: 'doctor',
      title: 'Doctor / Prescriber',
      subtitle: 'Prescription integrity, formula guide',
      icon: Stethoscope,
    },
  ];

  return (
    <header
      id="main-header"
      className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md transition-colors duration-200"
    >
      {/* Top Banner: Multi-Tenant Architecture Indicator */}
      <div className="bg-zinc-900 dark:bg-zinc-900/80 text-zinc-300 text-[11px] py-1 px-4 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SaaS Multi-Tenant Schema Isolation Active
            </span>
            <span className="text-zinc-600">|</span>
            <span className="hidden sm:inline text-zinc-400">
              PRD v0.1 • 100% Traceable to Core PRD Matrix (FR-CORE, FR-PRES, FR-AUD)
            </span>
          </div>

          {/* Quick Role Switcher Pill */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-zinc-400 hidden sm:inline">Active Persona:</span>
            <div className="relative">
              <button
                id="role-switch-trigger"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="inline-flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium px-2.5 py-0.5 rounded text-[11px] transition-colors border border-zinc-700"
              >
                <span className="capitalize font-semibold text-emerald-300">{currentRole}</span>
                <ChevronDown className="h-3 w-3 text-zinc-400" />
              </button>

              {roleDropdownOpen && (
                <div
                  className="absolute right-0 mt-1 w-64 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl py-1.5 z-50 text-zinc-900 dark:text-zinc-100"
                  onClick={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                    Switch User Role / Context
                  </div>
                  {rolesList.map((item) => (
                    <button
                      key={item.role}
                      onClick={() => {
                        setCurrentRole(item.role);
                        // Auto route to primary view of that role
                        if (item.role === 'pharmacy') setActiveTab('pharmacy_orders');
                        else if (item.role === 'admin') setActiveTab('admin_dashboard');
                        else if (item.role === 'doctor') setActiveTab('doctor_prescribe');
                        else setActiveTab('compare');
                      }}
                      className={`w-full flex items-start gap-2.5 px-3 py-2 text-left text-xs transition hover:bg-zinc-50 dark:hover:bg-zinc-800/60 ${
                        currentRole === item.role ? 'bg-zinc-100 dark:bg-zinc-800/80 font-semibold' : ''
                      }`}
                    >
                      <item.icon className="h-4 w-4 mt-0.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span>{item.title}</span>
                          {currentRole === item.role && (
                            <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">{item.subtitle}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* If pharmacy role, show partner store selector */}
            {currentRole === 'pharmacy' && (
              <div className="relative">
                <button
                  id="pharmacy-store-selector"
                  onClick={() => setPharmacyDropdownOpen(!pharmacyDropdownOpen)}
                  className="inline-flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-800/60 text-emerald-200 px-2 py-0.5 rounded text-[11px] transition-colors"
                >
                  <Building2 className="h-3 w-3" />
                  <span className="font-semibold truncate max-w-[120px]">{currentPharmacy?.name}</span>
                  <ChevronDown className="h-3 w-3 text-emerald-400" />
                </button>

                {pharmacyDropdownOpen && (
                  <div
                    className="absolute right-0 mt-1 w-64 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl py-1 z-50 text-zinc-900 dark:text-zinc-100"
                    onClick={() => setPharmacyDropdownOpen(false)}
                  >
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                      Select Pharmacy Tenant Store
                    </div>
                    {pharmacies.map((pharm) => (
                      <button
                        key={pharm.id}
                        onClick={() => setActivePharmacyId(pharm.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition hover:bg-zinc-50 dark:hover:bg-zinc-800 ${
                          activePharmacyId === pharm.id ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-semibold' : ''
                        }`}
                      >
                        <div>
                          <div className="font-medium">{pharm.name}</div>
                          <div className="text-[10px] text-zinc-500">{pharm.city} • SLA: {pharm.slaMinutes}m</div>
                        </div>
                        {activePharmacyId === pharm.id && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Auth Status in Top Banner */}
            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-zinc-700">
              {currentUser ? (
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <span className="text-zinc-500 text-[10px]">Active User:</span>
                  <button
                    onClick={() => setActiveTab('login')}
                    className="font-semibold text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>{currentUser.name}</span>
                  </button>
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="text-zinc-500 hover:text-rose-400 p-0.5 transition-colors"
                  >
                    <LogOut className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px]">
                  <button
                    onClick={() => setActiveTab('login')}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    Sign In
                  </button>
                  <span className="text-zinc-600">•</span>
                  <button
                    onClick={() => setActiveTab('register')}
                    className="text-zinc-300 hover:text-white"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab(currentRole === 'patient' ? 'compare' : navLinks[0].id)}
              className="flex items-center gap-2.5 text-left transition-opacity hover:opacity-95"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-sm shadow-emerald-500/20">
                <Pill className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
                    generic<span className="text-emerald-600 dark:text-emerald-400">Med</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                    SaaS
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 -mt-0.5 hidden sm:block">
                  Prescription-Aware Price Comparison Platform
                </p>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 ml-4 pl-4 border-l border-zinc-200 dark:border-zinc-800">
              {navLinks.map((link) => {
                const isActive = activeTab === link.id;
                const Icon = link.icon;
                return (
                  <button
                    key={link.id}
                    onClick={() => setActiveTab(link.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Icons & Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Medicine Search trigger */}
            <button
              onClick={() => setActiveTab('compare')}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <Search className="h-3.5 w-3.5 text-zinc-400" />
              <span>Search Lipitor, Metformin, Amoxil...</span>
              <kbd className="text-[10px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded text-zinc-400">
                /
              </kbd>
            </button>

            {/* Cart Drawer Trigger Button (shows badge) */}
            <button
              id="header-cart-button"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-xs"
              aria-label="View Cart"
            >
              <ShoppingCart className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
              <span className="hidden sm:inline font-semibold">Cart</span>
              {cart.length > 0 && (
                <span className="flex items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white h-5 min-w-[20px] px-1">
                  {cart.reduce((acc, i) => acc + i.quantity, 0)}
                </span>
              )}
              {cartTotals.total > 0 && (
                <span className="hidden md:inline font-bold text-emerald-600 dark:text-emerald-400 border-l border-zinc-200 dark:border-zinc-700 pl-1.5">
                  ${cartTotals.total.toFixed(2)}
                </span>
              )}
            </button>

            {/* Auth Profile Menu / Sign In Buttons */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="header-user-menu-button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-xs"
                  aria-label="User profile menu"
                >
                  <div className="h-6 w-6 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden xl:block text-left">
                    <div className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 leading-tight truncate max-w-[105px]">
                      {currentUser.name}
                    </div>
                    <div className="text-[9px] text-zinc-400 capitalize -mt-0.5">
                      {currentUser.role}
                    </div>
                  </div>
                  <ChevronDown className="h-3 w-3 text-zinc-400" />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-1 w-64 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl py-2 z-50 text-zinc-900 dark:text-zinc-100"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <div className="px-3.5 py-2 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                        {currentUser.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                        {currentUser.email}
                      </div>
                      <div className="inline-flex items-center gap-1 mt-1.5 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase">
                        <UserCheck className="h-3 w-3" />
                        <span>{currentUser.role} Account</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => setActiveTab('login')}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                      >
                        <User className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Switch Account / Demo Profiles</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('register')}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                      >
                        <UserPlus className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Register New Role Profile</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition font-semibold"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveTab('login')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-xs"
                >
                  <LogIn className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs shadow-emerald-600/20"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Register</span>
                </button>
              </div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle
              theme={theme}
              onToggle={onToggleTheme}
              idPrefix="header"
              className="flex"
            />

            {/* Mobile Hamburger Menu */}
            <button
              id="mobile-menu-toggle"
              type="button"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 md:hidden transition-colors"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            id="mobile-nav-panel"
            className="border-t border-zinc-200 dark:border-zinc-800 py-3 md:hidden transition-all duration-200"
          >
            {/* Mobile Auth Status */}
            <div className="px-2 pb-3 mb-2 border-b border-zinc-100 dark:border-zinc-800">
              {currentUser ? (
                <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {currentUser.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                        {currentUser.email} • {currentUser.role}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setActiveTab('login');
                        setMobileMenuOpen(false);
                      }}
                      className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline px-2 py-1"
                    >
                      Switch
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="text-zinc-400 hover:text-rose-500 p-1"
                      title="Sign Out"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setActiveTab('login');
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200"
                  >
                    <LogIn className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Sign In</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('register');
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Register</span>
                  </button>
                </div>
              )}
            </div>

            {/* Persona Switcher row for mobile */}
            <div className="px-2 pb-3 mb-2 border-b border-zinc-100 dark:border-zinc-800">
              <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                Active User Persona
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {rolesList.map((item) => (
                  <button
                    key={item.role}
                    onClick={() => {
                      setCurrentRole(item.role);
                      if (item.role === 'pharmacy') setActiveTab('pharmacy_orders');
                      else if (item.role === 'admin') setActiveTab('admin_dashboard');
                      else if (item.role === 'doctor') setActiveTab('doctor_prescribe');
                      else setActiveTab('compare');
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-1.5 p-2 rounded text-xs text-left border ${
                      currentRole === item.role
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-semibold'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <item.icon className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex flex-col space-y-1 px-1">
              {navLinks.map((link) => {
                const isActive = activeTab === link.id;
                const Icon = link.icon;
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      setActiveTab(link.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{link.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
