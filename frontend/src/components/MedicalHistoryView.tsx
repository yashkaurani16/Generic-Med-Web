import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  Download,
  Pill,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Search,
  Filter,
  Activity,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useApp } from '../context/AppContext';

interface TimelineEvent {
  id: string;
  date: string;
  type: 'prescription' | 'order';
  title: string;
  subtitle: string;
  status: string;
  details: string[];
}

interface ActiveMedication {
  medicineName: string;
  genericName: string;
  lastOrdered: string;
  orderCount: number;
}

interface MedicalHistoryData {
  patient: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  } | null;
  timeline: TimelineEvent[];
  totalOrders: number;
  totalPrescriptions: number;
  activeMedications: ActiveMedication[];
}

export const MedicalHistoryView: React.FC = () => {
  const { currentUser, setActiveTab } = useApp();
  const [data, setData] = useState<MedicalHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'prescription' | 'order'>('all');
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch('/api/medical-history', { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((history: MedicalHistoryData) => {
        if (isMounted) {
          setData(history);
          setLoading(false);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleExportPDF = () => {
    if (!data) return;

    const doc = new jsPDF();
    const patientName = data.patient?.name || currentUser?.name || 'Patient';

    // Header Banner
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('genericMed — Patient Medical History', 14, 18);

    // Patient Details
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Patient Name: ${patientName}`, 14, 38);
    doc.text(`Email: ${data.patient?.email || currentUser?.email || 'N/A'}`, 14, 45);
    doc.text(`Generated On: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}`, 14, 52);

    // Summary Counts
    doc.setDrawColor(220, 220, 220);
    doc.line(14, 58, 196, 58);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary Overview', 14, 66);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Orders: ${data.totalOrders}    |    Verified Prescriptions: ${data.totalPrescriptions}    |    Active Medications: ${data.activeMedications.length}`, 14, 73);

    // Active Medications Section
    doc.line(14, 79, 196, 79);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Active Medications', 14, 88);

    let y = 96;
    data.activeMedications.forEach((med, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${med.medicineName}`, 16, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Generic: ${med.genericName}  |  Total Units Ordered: ${med.orderCount}  |  Last Ordered: ${new Date(med.lastOrdered).toLocaleDateString()}`, 16, y + 5);
      doc.setTextColor(50, 50, 50);
      y += 12;
    });

    // Timeline Events Section
    if (y > 240) {
      doc.addPage();
      y = 20;
    } else {
      y += 8;
    }

    doc.line(14, y - 4, 196, y - 4);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Clinical Care & Order Timeline', 14, y);
    y += 8;

    data.timeline.forEach((event) => {
      if (y > 265) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const dateStr = new Date(event.date).toLocaleDateString();
      doc.text(`[${dateStr}] [${event.type.toUpperCase()}] ${event.title}`, 16, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Status: ${event.status} — ${event.subtitle}`, 16, y + 5);
      if (event.details.length > 0) {
        doc.text(`Items: ${event.details.join(', ')}`, 16, y + 10);
        y += 16;
      } else {
        y += 12;
      }
      doc.setTextColor(50, 50, 50);
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('genericMed — Verified Generic Medicine Platform · www.genericmed.in', 14, 288);

    doc.save(`Medical_History_${patientName.replace(/\s+/g, '_')}.pdf`);
  };

  const filteredTimeline = (data?.timeline || []).filter((event) => {
    const matchesType = filterType === 'all' || event.type === filterType;
    const q = searchFilter.toLowerCase().trim();
    const matchesSearch =
      !q ||
      event.title.toLowerCase().includes(q) ||
      event.subtitle.toLowerCase().includes(q) ||
      event.details.some((d) => d.toLowerCase().includes(q));
    return matchesType && matchesSearch;
  });

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400" />
        <p className="text-sm text-zinc-500">Loading your comprehensive medical records...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Unable to load medical records</h3>
        <p className="text-xs text-zinc-500">{error || 'Please log in as a patient to view medical history.'}</p>
        <button
          onClick={() => setActiveTab('compare')}
          className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 text-white p-6 sm:p-8 border border-zinc-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Activity className="h-3.5 w-3.5" />
            <span>Health Records & Clinical Timeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Patient Medical History
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
            View all dispensed medications, physician prescriptions, and fulfillment events in a unified timeline.
          </p>
        </div>

        <button
          onClick={handleExportPDF}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 transition shrink-0"
        >
          <Download className="h-4 w-4" />
          <span>Export Medical Report (PDF)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Prescriptions Uploaded</span>
            <FileText className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-2">
            {data.totalPrescriptions}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Verified by licensed pharmacists</p>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Total Orders Placed</span>
            <Clock className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-2">
            {data.totalOrders}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Across partner pharmacy network</p>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Active Medications</span>
            <Pill className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-2">
            {data.activeMedications.length}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Dispensed in last 90 days</p>
        </div>
      </div>

      {/* Active Medications Grid */}
      {data.activeMedications.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Pill className="h-4 w-4 text-emerald-600" />
            <span>Medication Regimen (Current & Recent)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.activeMedications.map((med, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate pr-2">
                    {med.medicineName}
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold shrink-0">
                    {med.orderCount} units
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 truncate">Generic: {med.genericName}</p>
                <div className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
                  Last ordered: {new Date(med.lastOrdered).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-600" />
            <span>Care & Fulfillment Timeline</span>
          </h3>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full h-8 pl-8 pr-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="inline-flex rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-0.5 text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                  filterType === 'all'
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('prescription')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                  filterType === 'prescription'
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                Prescriptions
              </button>
              <button
                onClick={() => setFilterType('order')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                  filterType === 'order'
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                Orders
              </button>
            </div>
          </div>
        </div>

        {/* Timeline Events List */}
        {filteredTimeline.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs text-zinc-500">
            No events match your current filter criteria.
          </div>
        ) : (
          <div className="relative pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 space-y-6">
            {filteredTimeline.map((event) => {
              const isRx = event.type === 'prescription';
              const dateStr = new Date(event.date).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div key={event.id} className="relative group">
                  {/* Timeline bullet */}
                  <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 bg-white dark:bg-zinc-900 transition ${
                    isRx
                      ? 'border-teal-500 group-hover:scale-125'
                      : 'border-emerald-500 group-hover:scale-125'
                  }`} />

                  <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-500/50 transition-colors shadow-xs space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                          isRx
                            ? 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        }`}>
                          {isRx ? 'Prescription' : 'Dispensed Order'}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {event.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <span>{dateStr}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          event.status === 'Accepted' || event.status === 'Delivered'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                            : event.status === 'Rejected' || event.status === 'Cancelled'
                            ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-500">{event.subtitle}</p>

                    {event.details.length > 0 && (
                      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                        <div className="flex flex-wrap gap-1.5">
                          {event.details.map((detail, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                            >
                              {detail}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
