import React, { useState } from 'react';
import {
  Layers,
  Database,
  ShieldCheck,
  Server,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Lock,
  Globe,
  GitBranch,
  Key,
  Code2,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Activity,
  Terminal,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ArchitectureView: React.FC = () => {
  const { addAuditLog, showToast } = useApp();
  const [activeArchSection, setActiveArchSection] = useState<'architecture' | 'multitenant' | 'traceability' | 'flows'>('architecture');

  const handleSimulateIdempotency = () => {
    addAuditLog({
      actor: 'Payment Gateway Webhook Engine',
      role: 'Automated System',
      action: 'PAYMENT_WEBHOOK_DUPLICATE_IGNORED',
      target: 'Transaction #TXN-9988102391',
      source: 'Automated System',
      reason: 'PRD FR-PAY-02: Duplicate webhook callback detected. Idempotency key matched existing successful payment state. Redundant state mutation rejected safely.',
    });
    showToast('info', 'Idempotency Simulation', 'Duplicate payment event safely handled without double-charging.');
  };

  const handleSimulateFreshnessAudit = () => {
    addAuditLog({
      actor: 'Freshness SLA Evaluator',
      role: 'Automated System',
      action: 'FRESHNESS_SLA_SWEEP_EXECUTED',
      target: 'Catalog Partition #asia-south1',
      source: 'Automated System',
      reason: 'PRD FR-CORE-06: Scanned 24 active partner offers. 1 offer exceeded 24-hour update window and was flagged as stale.',
    });
    showToast('success', 'SLA Sweep Logged', 'Freshness evaluation logged to immutable audit registry.');
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
              <Layers className="h-4 w-4" />
              <span>Production-Grade Multi-Tenant SaaS Architecture (Nov 2024 / Sep 2026 PRD)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
              System Architecture & PRD Blueprint
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Secure • Scalable • Multi-Tenant • Reliable • Observable • Production-Ready
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSimulateIdempotency}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition flex items-center gap-1.5"
            >
              <Terminal className="h-3.5 w-3.5 text-emerald-500" />
              <span>Test Idempotency Hook (FR-PAY-02)</span>
            </button>
            <button
              onClick={handleSimulateFreshnessAudit}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Run Freshness SLA Sweep</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-4 text-xs font-semibold">
        {[
          { id: 'architecture', label: '1. High-Level Architecture Stack' },
          { id: 'multitenant', label: '2. Multi-Tenant Data Isolation' },
          { id: 'traceability', label: '3. PRD Traceability Matrix' },
          { id: 'flows', label: '4. Key Business Flows' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveArchSection(tab.id as any)}
            className={`pb-3 flex items-center gap-2 border-b-2 transition ${
              activeArchSection === tab.id
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: High-Level Architecture Stack */}
      {activeArchSection === 'architecture' && (
        <div className="space-y-6">
          {/* Layer 1: Users & Clients */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-500">
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-500" /> Layer 1: Users & Clients
              </span>
              <span className="text-[10px] font-mono text-zinc-400">Web / Mobile Responsive</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
              {[
                { title: 'Patients', sub: 'Web / Mobile PWA' },
                { title: 'Doctors', sub: 'Web Prescriber' },
                { title: 'Pharmacy Stores', sub: 'Store Ops Portal' },
                { title: 'Hospitals', sub: 'Institutional B2B' },
                { title: 'Tenant Admins', sub: 'Branch Mgmt' },
                { title: 'Super Admin', sub: 'System Wide Ops' },
              ].map((c, i) => (
                <div key={i} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
                  <div className="font-bold text-zinc-900 dark:text-zinc-100">{c.title}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{c.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Layer 2: Edge & Security */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-500">
              <span className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-500" /> Layer 2: Edge & Security (Internet Facing)
              </span>
              <span className="text-[10px] font-mono text-zinc-400">DDoS Mitigation • TLS Termination</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
                <div className="font-bold">Cloud DNS</div>
                <div className="text-[10px] text-zinc-500">Anycast Routing</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
                <div className="font-bold">Global CDN</div>
                <div className="text-[10px] text-zinc-500">Edge Caching</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
                <div className="font-bold">WAF Shield</div>
                <div className="text-[10px] text-zinc-500">DDoS & Threat Protection</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
                <div className="font-bold">Load Balancer</div>
                <div className="text-[10px] text-zinc-500">L7 Reverse Proxy</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
                <div className="font-bold">API Gateway</div>
                <div className="text-[10px] text-zinc-500">Rate Limiting & Auth</div>
              </div>
            </div>
          </div>

          {/* Layer 3: Application Services (Modular Monolith) */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-500">
              <span className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-purple-500" /> Layer 3: Core Application Services (Modular Domain Services)
              </span>
              <span className="text-[10px] font-mono text-zinc-400">Containerized Services</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {[
                { title: 'User & Tenant Mgmt', desc: 'RBAC, Tenant context, Multi-login' },
                { title: 'Medicine Catalog & Price Engine', desc: 'Pack equivalence, Freshness SLA, Lowest price' },
                { title: 'Prescription Vault', desc: 'Clinical review queue, Encrypted storage, Non-substitution' },
                { title: 'Order & State Machine', desc: 'Idempotent creation, Status transitions, Refund recovery' },
                { title: 'Inventory & Store Ops', desc: 'Stock sync, SLA tracking, Reason-coded rejections' },
                { title: 'Payment & Billing', desc: 'Stripe/Razorpay, Idempotent webhook handling' },
                { title: 'Notifications Dispatcher', desc: 'Email, SMS, In-app status alerts' },
                { title: 'Audit & Operational Log', desc: 'Append-only immutable record of high-risk actions' },
              ].map((s, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
                  <div className="font-bold text-zinc-900 dark:text-zinc-100">{s.title}</div>
                  <div className="text-[11px] text-zinc-500 mt-1">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Layer 4: Data & Messaging */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-500">
              <span className="flex items-center gap-2">
                <Database className="h-4 w-4 text-amber-500" /> Layer 4: Data & Messaging Layer
              </span>
              <span className="text-[10px] font-mono text-zinc-400">Multi-Tenant Isolation</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
                <div className="font-bold">Primary DB</div>
                <div className="text-[10px] text-zinc-500">PostgreSQL Schemas</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
                <div className="font-bold">Redis Cache</div>
                <div className="text-[10px] text-zinc-500">Freshness & Sessions</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
                <div className="font-bold">Message Queue</div>
                <div className="text-[10px] text-zinc-500">Async Notifications</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
                <div className="font-bold">Object Storage</div>
                <div className="text-[10px] text-zinc-500">Encrypted Prescriptions</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
                <div className="font-bold">Search Index</div>
                <div className="text-[10px] text-zinc-500">Elasticsearch / Algolia</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
                <div className="font-bold">Analytics DB</div>
                <div className="text-[10px] text-zinc-500">ClickHouse / BigQuery</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Multi-Tenant Isolation Strategy */}
      {activeArchSection === 'multitenant' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Database className="h-5 w-5 text-emerald-600" />
                <span>Shared Database – Separate Schemas Model</span>
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                As detailed in Diagram Panel 3, genericMed utilizes a single managed database cluster partitioned into distinct PostgreSQL schemas per tenant organization.
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 space-y-1">
                  <div className="font-bold text-emerald-700 dark:text-emerald-400">
                    platform_schema
                  </div>
                  <p className="text-zinc-500 text-[11px]">
                    Stores global canonical medicine catalog, therapeutic classifications, system configuration, and immutable platform audit logs.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 space-y-1">
                  <div className="font-bold text-blue-700 dark:text-blue-400">
                    tenant_pharma_1 (CarePoint Pharmacy)
                  </div>
                  <p className="text-zinc-500 text-[11px]">
                    Isolated store inventory, pack price offers, fulfillment orders, and staff permissions. No cross-tenant read access allowed.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 space-y-1">
                  <div className="font-bold text-teal-700 dark:text-teal-400">
                    tenant_pharma_2 (MedPlus Direct)
                  </div>
                  <p className="text-zinc-500 text-[11px]">
                    Dedicated schema preventing data leakage. All SQL queries include tenant context injected from validated JWT session token.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-3 text-xs">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Security & Isolation Guarantees</span>
              </h4>
              <ul className="space-y-2 text-zinc-600 dark:text-zinc-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Tenant ID in Claims:</strong> JWT contains cryptographically signed <code className="text-emerald-600 font-mono">tenant_id</code> and RBAC role.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Connection Pooling with Schema Search Path:</strong> Multi-tenant pooling sets <code className="text-emerald-600 font-mono">SET search_path TO tenant_id, public</code> per request.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>No UI-Only Security:</strong> All privileged endpoints enforce server-side validation (PRD NFR-SEC-01).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Prescription Privacy:</strong> Prescriptions are stored in least-privilege private object storage with signed time-limited URLs (PRD NFR-PRIV-02).
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: PRD Traceability Matrix */}
      {activeArchSection === 'traceability' && (
        <div className="space-y-4">
          <div className="text-xs text-zinc-500">
            Mapping from Business Goals (BG) to Functional Requirements (FR) and Acceptance Criteria (PRD Section 23).
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500">
                    <th className="p-3.5 font-bold">Goal ID</th>
                    <th className="p-3.5 font-bold">Business Goal</th>
                    <th className="p-3.5 font-bold">Primary KPI</th>
                    <th className="p-3.5 font-bold">PRD Functional Req</th>
                    <th className="p-3.5 font-bold">System Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
                  <tr>
                    <td className="p-3.5 font-mono font-bold text-emerald-600">BG-01</td>
                    <td className="p-3.5">Validate demand for multi-pharmacy price comparison</td>
                    <td className="p-3.5">Comparison coverage &gt;90%, Price confidence &gt;99%</td>
                    <td className="p-3.5 font-mono text-[11px]">FR-CORE-01..08</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                        Implemented
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-mono font-bold text-emerald-600">BG-02</td>
                    <td className="p-3.5">Build repeatable pharmacy partner supply base</td>
                    <td className="p-3.5">Offer freshness SLA &gt;95%, Weekly active offers</td>
                    <td className="p-3.5 font-mono text-[11px]">FR-VEND-01..05</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                        Implemented
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-mono font-bold text-emerald-600">BG-03</td>
                    <td className="p-3.5">Convert qualified comparisons into completed orders</td>
                    <td className="p-3.5">Completed Qualified Medicine Purchases (CQMP)</td>
                    <td className="p-3.5 font-mono text-[11px]">FR-ORDER-01..06, FR-PAY-01..02</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                        Implemented
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-mono font-bold text-emerald-600">BG-04</td>
                    <td className="p-3.5">Maintain operational quality and handle exceptions</td>
                    <td className="p-3.5">Cancellation rate &lt;2%, Refund SLA &lt;24h</td>
                    <td className="p-3.5 font-mono text-[11px]">FR-ADM-05..06, FR-SUP-01</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                        Implemented
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-mono font-bold text-emerald-600">BG-05</td>
                    <td className="p-3.5">Create a credible immutable audit trail</td>
                    <td className="p-3.5">100% of defined high-risk actions logged</td>
                    <td className="p-3.5 font-mono text-[11px]">FR-AUD-01..03, NFR-SEC-*</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                        Implemented
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Key Business Flows */}
      {activeArchSection === 'flows' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              flow: 'A. Search & Compare Medicines',
              steps: ['User Search Medicine', 'API Gateway Rate Check', 'Catalog Medicine Normalization', 'Fetch Fresh Partner Offers', 'Lowest Comparable Price Sorting', 'Render Transparency Card'],
            },
            {
              flow: 'B. Upload Prescription & Place Order',
              steps: ['Upload Document', 'Cryptographic Storage', 'Pharmacist Clinical Review', 'Accept / Standardized Reason Reject', 'Revalidate Cart Price & Stock', 'Idempotent Payment & State Machine'],
            },
            {
              flow: 'C. Pharmacy Inventory Management',
              steps: ['Partner Onboarding', 'Manage Drug Pack Mappings', 'Update Live Pack Prices', 'Automated Freshness Timestamping', 'Order Pick & Seal Notification', 'Courier Handover & Delivery OTP'],
            },
            {
              flow: 'D. Audit & Exception Handling',
              steps: ['High-Risk Action Triggered', 'Emit Structured Event', 'Record Actor, Reason, Correlation ID', 'Store Before/After State Diffs', 'Immutable Ledger Retention', 'Support Dispute Resolution'],
            },
          ].map((f, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-3 text-xs"
            >
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                {f.flow}
              </h4>
              <div className="space-y-1.5 font-mono">
                {f.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <span className="h-5 w-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-700 dark:text-zinc-300 shrink-0">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
