import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  FileText,
  Activity,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  Lock,
  Layers,
  HelpCircle,
  TrendingUp,
  Clock,
  UserCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AdminDashboardView: React.FC = () => {
  const {
    auditLogs,
    orders,
    prescriptions,
    offers,
    medicines,
    tickets,
    addAuditLog,
    showToast,
  } = useApp();

  const [adminTab, setAdminTab] = useState<'overview' | 'audit' | 'catalog' | 'tickets'>('overview');
  const [auditFilter, setAuditFilter] = useState<string>('all');
  const [auditSearch, setAuditSearch] = useState<string>('');

  // Mock catalog normalization review action
  const handleApproveMapping = (medName: string) => {
    addAuditLog({
      actor: 'Admin Operations Lead',
      role: 'Admin / Operations',
      action: 'CATALOG_PACK_EQUIVALENCE_APPROVED',
      target: `Medicine ${medName}`,
      source: 'Admin Console',
      reason: 'Bioequivalence certification confirmed against national pharmacopeia guidelines.',
    });
    showToast('success', 'Catalog Mapping Approved', `${medName} equivalence verified and audited.`);
  };

  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesFilter =
      auditFilter === 'all' ||
      (auditFilter === 'prescriptions' && log.action.includes('PRESCRIPTION')) ||
      (auditFilter === 'offers' && log.action.includes('OFFER')) ||
      (auditFilter === 'orders' && log.action.includes('ORDER')) ||
      (auditFilter === 'catalog' && log.action.includes('CATALOG'));

    const matchesSearch =
      !auditSearch ||
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.actor.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.target.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.correlationId.toLowerCase().includes(auditSearch.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const pendingRxCount = prescriptions.filter((p) => p.status === 'Pending Review').length;
  const staleOffersCount = offers.filter((o) => o.freshnessStatus === 'stale').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
              <ShieldCheck className="h-4 w-4" />
              <span>Platform Integrity & Operations Console (PRD Section 9.9 & 18)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
              Operations & Audit Control
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Role-based access control (RBAC), immutable system audit logs, and catalog equivalence validation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              OWASP Tier-1 Audit Active
            </span>
          </div>
        </div>

        {/* PRD North Star & KPI Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-xs">
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
            <div className="text-zinc-500 font-medium">North Star: CQMP</div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
              1,248
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
              Completed Qualified Purchases
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
            <div className="text-zinc-500 font-medium">Price Confidence Rate</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              99.6%
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">
              Target: &ge; 99% (PRD Section 5.2)
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
            <div className="text-zinc-500 font-medium">Comparison Coverage</div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
              94.2%
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">
              Queries returning &ge; 2 offers
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
            <div className="text-zinc-500 font-medium">Offer Freshness SLA</div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
              98.4%
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">
              Updated within SLA window
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-4 text-xs font-semibold">
        <button
          onClick={() => setAdminTab('overview')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            adminTab === 'overview'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Operational Queues</span>
        </button>

        <button
          onClick={() => setAdminTab('audit')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            adminTab === 'audit'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Immutable Audit Logs ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('catalog')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            adminTab === 'catalog'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Catalog & Pack Normalization</span>
        </button>

        <button
          onClick={() => setAdminTab('tickets')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            adminTab === 'tickets'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          <span>Support & Dispute Desk ({tickets.length})</span>
        </button>
      </div>

      {/* Tab 1: Operational Queues */}
      {adminTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Queue 1: Pending Prescriptions */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span>Pending Rx Review Queue</span>
              </h3>
              <span className="rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold px-2 py-0.5">
                {pendingRxCount}
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              Uploaded prescriptions awaiting pharmacist licensed evaluation.
            </p>
            <div className="space-y-2">
              {prescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                      {rx.id.toUpperCase()}
                    </div>
                    <div className="text-[11px] text-zinc-500">{rx.doctorName}</div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rx.status === 'Accepted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rx.status === 'Rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {rx.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Queue 2: Stale / Freshness Alerts */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                <span>Stale Offer Freshness Alerts</span>
              </h3>
              <span className="rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-xs font-bold px-2 py-0.5">
                {staleOffersCount}
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              Per PRD Section 9.4 (FR-CORE-06), offers unverified &gt;24h are excluded from lowest-price claims.
            </p>
            <div className="space-y-2">
              {offers
                .filter((o) => o.freshnessStatus === 'stale')
                .map((off) => (
                  <div
                    key={off.id}
                    className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 text-xs space-y-1"
                  >
                    <div className="flex justify-between font-semibold text-rose-900 dark:text-rose-300">
                      <span>{off.pharmacyName}</span>
                      <span className="font-bold">${off.price.toFixed(2)}</span>
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      Untouched for {off.lastUpdated}. Deprioritized in ranking.
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Queue 3: Platform Guardrail Metrics */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Guardrail Metrics (PRD 5.4)</span>
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Medicine Mismatch Reports:</span>
                <strong className="text-emerald-600">0 (Zero Incidents)</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Prescription Error Rejections:</span>
                <strong className="text-zinc-900 dark:text-zinc-100">&lt; 0.2%</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Payment Failure Rate:</span>
                <strong className="text-zinc-900 dark:text-zinc-100">&lt; 0.5%</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Security & Privacy Incidents:</span>
                <strong className="text-emerald-600">0 Material Incidents</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Immutable Audit Log Viewer */}
      {adminTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search audit logs by actor, action, correlation ID..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">Filter:</span>
              {['all', 'prescriptions', 'offers', 'orders', 'catalog'].map((f) => (
                <button
                  key={f}
                  onClick={() => setAuditFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-xs capitalize ${
                    auditFilter === f
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold'
                      : 'border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredAuditLogs.map((log) => (
                <div key={log.id} className="p-4 space-y-2 text-xs hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                      <span className="text-zinc-400">•</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {log.target}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-zinc-400 font-mono text-[11px]">
                      <span>{log.timestamp}</span>
                      <span>•</span>
                      <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                        {log.correlationId}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-zinc-500 text-[11px]">
                    <span>Actor: <strong className="text-zinc-700 dark:text-zinc-300">{log.actor}</strong> ({log.role})</span>
                    <span>•</span>
                    <span>Source: {log.source}</span>
                  </div>

                  {log.reason && (
                    <div className="text-zinc-600 dark:text-zinc-400 text-xs bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                      <strong>Reason / Justification:</strong> {log.reason}
                    </div>
                  )}

                  {log.diff && (
                    <div className="text-[11px] font-mono p-2 rounded bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 flex items-center gap-3">
                      <span>Field modified: <strong className="text-emerald-600">{log.diff.field}</strong></span>
                      <span>Before: <span className="line-through opacity-70">{String(log.diff.before)}</span></span>
                      <span>After: <strong className="text-emerald-500">{String(log.diff.after)}</strong></span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Catalog & Pack Normalization */}
      {adminTab === 'catalog' && (
        <div className="space-y-4">
          <div className="text-xs text-zinc-500">
            Canonical drug identity, active pharmaceutical ingredients (API), dosage forms, and pack equivalence mapping rules (PRD Section 9.4 & FR-CORE-02).
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medicines.map((med) => (
              <div
                key={med.id}
                className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {med.name}
                    </h4>
                    <div className="text-xs text-zinc-500">
                      Brand: <strong className="text-zinc-800 dark:text-zinc-200">{med.brandName}</strong> • API: {med.activeIngredient}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {med.therapeuticClass.split('/')[0]}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <div className="font-semibold text-zinc-500 uppercase tracking-wider text-[10px]">
                    Validated Pack Normalization Rules:
                  </div>
                  {med.packs.map((pack) => (
                    <div
                      key={pack.packId}
                      className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between text-[11px]"
                    >
                      <span className="font-medium">{pack.packLabel}</span>
                      <span className="font-mono text-zinc-400">Barcode: {pack.canonicalBarcode}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleApproveMapping(med.name)}
                    className="px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Re-verify Equivalence</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Support & Dispute Desk */}
      {adminTab === 'tickets' && (
        <div className="space-y-4">
          <div className="text-xs text-zinc-500">
            Customer and pharmacy escalations linked to relevant order or prescription context (PRD FR-SUP-01).
          </div>

          <div className="space-y-3">
            {tickets.map((tkt) => (
              <div
                key={tkt.id}
                className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {tkt.ticketNumber}
                    </span>
                    <span className="text-xs text-zinc-400">•</span>
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      {tkt.category}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                    {tkt.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {tkt.subject}
                </h4>

                <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  {tkt.messages.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 text-xs space-y-1"
                    >
                      <div className="flex justify-between text-zinc-500 text-[11px]">
                        <strong>{m.sender} ({m.senderRole})</strong>
                        <span>{m.timestamp}</span>
                      </div>
                      <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed">{m.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
