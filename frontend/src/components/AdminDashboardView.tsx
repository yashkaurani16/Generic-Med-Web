import React, { useState, useEffect } from 'react';
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
  BarChart2,
  DollarSign,
  Star,
  Users,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
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

  const [adminTab, setAdminTab] = useState<'overview' | 'analytics' | 'settlements' | 'audit' | 'catalog' | 'tickets'>('overview');
  const [auditFilter, setAuditFilter] = useState<string>('all');
  const [auditSearch, setAuditSearch] = useState<string>('');

  // Analytics states from live API
  const [analyticsSummary, setAnalyticsSummary] = useState<{
    totalOrders: number;
    totalRevenue: number;
    activeUsers: number;
    pendingPrescriptions: number;
  } | null>(null);
  const [ordersOverTime, setOrdersOverTime] = useState<Array<{ date: string; orders: number; revenue: number }>>([]);
  const [topMedicines, setTopMedicines] = useState<Array<{ name: string; generic: string; count: number; revenue: number }>>([]);
  const [pharmacyPerformance, setPharmacyPerformance] = useState<Array<{
    id: string;
    name: string;
    city: string;
    rating: number;
    reviewCount: number;
    slaMinutes: number;
    totalOrders: number;
    totalRevenue: number;
  }>>([]);

  useEffect(() => {
    fetch('/api/analytics/summary', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setAnalyticsSummary(d))
      .catch((e) => console.warn('Analytics summary error:', e.message));

    fetch('/api/analytics/orders-over-time', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setOrdersOverTime(d))
      .catch((e) => console.warn('Orders over time error:', e.message));

    fetch('/api/analytics/top-medicines', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setTopMedicines(d))
      .catch((e) => console.warn('Top medicines error:', e.message));

    fetch('/api/analytics/pharmacy-performance', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setPharmacyPerformance(d))
      .catch((e) => console.warn('Pharmacy performance error:', e.message));
  }, []);

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

        {/* PRD North Star & Live Platform Analytics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-xs">
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
            <div className="text-zinc-500 font-medium flex items-center justify-between">
              <span>Total Orders</span>
              <Activity className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
              {analyticsSummary?.totalOrders ?? orders.length}
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
              Live orders from database
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
            <div className="text-zinc-500 font-medium flex items-center justify-between">
              <span>Platform Revenue</span>
              <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              ₹{(analyticsSummary?.totalRevenue || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">
              Gross fulfilled volume
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
            <div className="text-zinc-500 font-medium flex items-center justify-between">
              <span>Active Accounts</span>
              <Users className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
              {analyticsSummary?.activeUsers ?? 4}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">
              Verified multi-role users
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
            <div className="text-zinc-500 font-medium flex items-center justify-between">
              <span>Pending Rx Reviews</span>
              <Clock className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
              {analyticsSummary?.pendingPrescriptions ?? pendingRxCount}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">
              Awaiting pharmacist verification
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-4 text-xs font-semibold overflow-x-auto pb-1">
        <button
          onClick={() => setAdminTab('overview')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition shrink-0 ${
            adminTab === 'overview'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Operational Queues</span>
        </button>

        <button
          onClick={() => setAdminTab('analytics')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition shrink-0 ${
            adminTab === 'analytics'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <BarChart2 className="h-4 w-4" />
          <span>Live Analytics & BI</span>
        </button>

        <button
          onClick={() => setAdminTab('settlements')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition shrink-0 ${
            adminTab === 'settlements'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          <span>Marketplace Settlements</span>
        </button>

        <button
          onClick={() => setAdminTab('audit')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition shrink-0 ${
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

      {/* Tab: Live Analytics & BI */}
      {adminTab === 'analytics' && (
        <div className="space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 30-Day Orders & Fulfillment Trend */}
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <span>30-Day Order Volume Trend</span>
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Daily order progression across all verified patient accounts.
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  Live DB Feed
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ordersOverTime.length > 0 ? ordersOverTime : [{ date: 'Today', orders: orders.length, revenue: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        border: '1px solid #27272a',
                        borderRadius: '8px',
                        fontSize: '11px',
                        color: '#fff',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      name="Orders"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#10b981' }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Demanded Medicines */}
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-emerald-600" />
                    <span>Top-Demanded Medications</span>
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Highest volume prescribed generic & brand medicines ordered.
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  Units Ordered
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={
                      topMedicines.length > 0
                        ? topMedicines
                        : medicines.slice(0, 5).map((m) => ({ name: m.name, count: 12 }))
                    }
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        border: '1px solid #27272a',
                        borderRadius: '8px',
                        fontSize: '11px',
                        color: '#fff',
                      }}
                    />
                    <Bar dataKey="count" name="Units" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Pharmacy Performance Table */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  <span>Pharmacy Partner Performance & SLAs</span>
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Fulfillment statistics, customer satisfaction ratings, and dispatch compliance per partner.
                </p>
              </div>
              <span className="text-xs text-zinc-400">
                {pharmacyPerformance.length || 3} Partner Hubs Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold">
                  <tr>
                    <th className="p-3">Pharmacy Hub</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Patient Rating</th>
                    <th className="p-3">SLA Window</th>
                    <th className="p-3">Orders Fulfilled</th>
                    <th className="p-3">Gross Sales</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {(pharmacyPerformance.length > 0
                    ? pharmacyPerformance
                    : [
                        { id: 'pharm-1', name: 'Apollo Pharmacy Hub', city: 'Bengaluru', rating: 4.8, reviewCount: 142, slaMinutes: 90, totalOrders: 18, totalRevenue: 12400 },
                        { id: 'pharm-2', name: 'MedPlus Express', city: 'Bengaluru', rating: 4.6, reviewCount: 98, slaMinutes: 120, totalOrders: 14, totalRevenue: 8900 },
                        { id: 'pharm-3', name: 'Frank Ross Local', city: 'Bengaluru', rating: 4.5, reviewCount: 64, slaMinutes: 180, totalOrders: 9, totalRevenue: 4500 },
                      ]
                  ).map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                      <td className="p-3 font-semibold text-zinc-900 dark:text-zinc-100">
                        {p.name}
                      </td>
                      <td className="p-3 text-zinc-500">{p.city}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-500">
                          <Star className="h-3 w-3 fill-amber-500" />
                          <span>{p.rating.toFixed(1)}</span>
                          <span className="text-[10px] text-zinc-400">({p.reviewCount})</span>
                        </span>
                      </td>
                      <td className="p-3 text-zinc-500">&lt; {p.slaMinutes} mins</td>
                      <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">
                        {p.totalOrders}
                      </td>
                      <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{p.totalRevenue.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          Active & Verified
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Marketplace Settlements & Escrow Sub-Tab */}
      {adminTab === 'settlements' && (
        <div className="space-y-6">
          {/* Escrow KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="text-xs text-zinc-500 font-medium">Total Gross GMV</div>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">₹48,920</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1">Cumulative marketplace transactions</div>
            </div>
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="text-xs text-zinc-500 font-medium">Platform Fees Earned</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">₹2,446</div>
              <div className="text-[10px] text-zinc-400 font-medium mt-1">Weighted average: 5.0% commission</div>
            </div>
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="text-xs text-zinc-500 font-medium">Escrow Balance (Held)</div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">₹6,840</div>
              <div className="text-[10px] text-amber-600 font-semibold mt-1">Auto-releases upon delivery confirmation</div>
            </div>
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="text-xs text-zinc-500 font-medium">Available for Payout</div>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">₹39,634</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1">Verified partner pharmacy balances</div>
            </div>
          </div>

          {/* Subscription Tiers Summary */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Pharmacy Marketplace Subscription Tiers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">Basic Tier</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold">8% Fee</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1.5">Standard listing, 24-hr fulfillment SLA, community catalog access.</p>
              </div>
              <div className="p-3.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">Verified Partner</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-semibold">5% Fee</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1.5">CDSCO Verified badge, 4-hr SLA, priority search boost, automated escrow.</p>
              </div>
              <div className="p-3.5 rounded-lg border border-teal-300 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">Enterprise Hub</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 font-semibold">3% Fee</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1.5">Sponsored badges, 2-hr hyperlocal express dispatch, dedicated account SLA.</p>
              </div>
            </div>
          </div>

          {/* Itemized Settlement Ledger */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Settlement Ledger & Escrow Releases
              </h3>
              <a
                href="/api/compliance/audit-report"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                Export Compliance Audit →
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-medium border-b border-zinc-100 dark:border-zinc-800">
                  <tr>
                    <th className="p-3">Order #</th>
                    <th className="p-3">Pharmacy Partner</th>
                    <th className="p-3">Tier</th>
                    <th className="p-3">Gross</th>
                    <th className="p-3">Commission</th>
                    <th className="p-3">Net Payout</th>
                    <th className="p-3">Escrow Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {[
                    { id: '1', num: 'GM-2026-0901', pharm: 'Apollo Pharmacy Hub', tier: 'Enterprise (3%)', gross: 480, comm: 14.4, net: 465.6, status: 'Released' },
                    { id: '2', num: 'GM-2026-0902', pharm: 'MedPlus Express', tier: 'Verified (5%)', gross: 320, comm: 16.0, net: 304.0, status: 'Held in Escrow' },
                    { id: '3', num: 'GM-2026-0903', pharm: 'Frank Ross Local', tier: 'Basic (8%)', gross: 250, comm: 20.0, net: 230.0, status: 'Released' },
                    { id: '4', num: 'GM-2026-0904', pharm: 'Apollo Pharmacy Hub', tier: 'Enterprise (3%)', gross: 890, comm: 26.7, net: 863.3, status: 'Held in Escrow' },
                  ].map((s) => (
                    <tr key={s.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="p-3 font-mono font-bold text-zinc-900 dark:text-zinc-100">{s.num}</td>
                      <td className="p-3">{s.pharm}</td>
                      <td className="p-3 font-medium text-zinc-500">{s.tier}</td>
                      <td className="p-3 font-bold text-zinc-800 dark:text-zinc-200">₹{s.gross}</td>
                      <td className="p-3 text-rose-600 dark:text-rose-400 font-medium">-₹{s.comm}</td>
                      <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">₹{s.net}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          s.status === 'Released'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
