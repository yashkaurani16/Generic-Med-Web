import React from 'react';
import { Pill, ShieldCheck, HeartPulse, CheckCircle2, Lock, FileText, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const currentYear = 2026;
  const { setActiveTab } = useApp();

  const footerGroups = [
    {
      title: 'Platform',
      links: [
        { label: 'Medicine Price Comparison', tab: 'compare' },
        { label: 'Prescription Vault & OCR', tab: 'prescriptions' },
        { label: 'Order State Tracking', tab: 'orders' },
        { label: 'Architecture & PRD Blueprint', tab: 'architecture', badge: 'PRD v0.1' },
      ],
    },
    {
      title: 'Pharmacy Partners',
      links: [
        { label: 'Partner Fulfillment Portal', tab: 'pharmacy_orders' },
        { label: 'Clinical Rx Review Queue', tab: 'pharmacy_rx' },
        { label: 'Freshness SLA Benchmark', tab: 'pharmacy_inventory' },
        { label: 'Pack Barcode Normalization', tab: 'admin_catalog' },
      ],
    },
    {
      title: 'Governance & Trust',
      links: [
        { label: 'Immutable Audit Trail', tab: 'admin_audit' },
        { label: 'Operations & Discrepancies', tab: 'admin_dashboard' },
        { label: 'Doctor Protection Policy', tab: 'doctor_prescribe' },
        { label: 'Dispute & Support Desk', tab: 'admin_dashboard' },
      ],
    },
    {
      title: 'Clinical Standards',
      links: [
        { label: 'Bioequivalence Criteria', tab: 'architecture' },
        { label: 'Doctor Non-Substitution', tab: 'doctor_prescribe' },
        { label: 'Scheduled Drug Protocols', tab: 'prescriptions' },
        { label: 'Data Encryption & HIPAA/GDPR', tab: 'architecture' },
      ],
    },
  ];

  return (
    <footer id="main-footer" className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 transition-colors duration-200">
      {/* Medical Safety Disclaimer Banner (PRD Section 17 & FR-CORE-08) */}
      <div className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2 text-zinc-600 dark:text-zinc-400">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Medical Disclaimer & Regulatory Notice:</strong> genericMed is a price comparison, pack equivalence, and licensed fulfillment routing platform. Prescription medications require validation by a licensed pharmacist before delivery. No clinical substitution of active drug ingredients is performed without certified prescriber consent.
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px] text-zinc-500">
            <Lock className="h-3.5 w-3.5 text-emerald-600" />
            <span>256-bit Encrypted Vault</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Main Footer Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand & Mission Column */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 font-semibold text-zinc-900 dark:text-zinc-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                <Pill className="h-4 w-4" />
              </div>
              <span className="text-base font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                generic<span className="text-emerald-600 dark:text-emerald-400">Med</span>
              </span>
            </div>
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm">
              SaaS platform enabling patients, doctors, and multi-tenant licensed pharmacies to compare normalized drug costs with auditable fulfillment.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-medium">
                <CheckCircle2 className="h-3 w-3" />
                4 Licensed Pharmacy Tenants
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-mono">
                SLA: &lt; 45 mins
              </span>
            </div>
          </div>

          {/* Nav Categories */}
          {footerGroups.map((group) => (
            <div key={group.title} className="col-span-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => setActiveTab(link.tab as any)}
                      className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left"
                    >
                      <span>{link.label}</span>
                      {link.badge && (
                        <span className="rounded-sm bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800 dark:text-emerald-300">
                          {link.badge}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Multi-Tenant Node Clusters Healthy (99.98% uptime)</span>
            </div>
            <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
            <p>© {currentYear} genericMed Platform Inc. All rights reserved.</p>
          </div>

          <div className="flex items-center gap-5 text-[11px]">
            <span className="text-zinc-400">FDA & National Drug Code (NDC) Compliant</span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="text-zinc-400">SOC-2 Type II Certified</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
