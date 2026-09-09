import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Lock,
  User,
  Check,
  Search,
  Pill,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Prescription, PrescriptionAnalysisResult } from '../types';
import { AIPrescriptionScanner } from './AIPrescriptionScanner';

export const PrescriptionUploadView: React.FC = () => {
  const {
    prescriptions,
    uploadPrescription,
    setActiveTab,
    setSelectedMedicineId,
    autoPopulateComparisonSearch,
  } = useApp();

  const [doctorName, setDoctorName] = useState('Dr. Anita Sharma, MD');
  const [doctorLicense, setDoctorLicense] = useState('MCI-REG-448201');
  const [clinicHospital, setClinicHospital] = useState('Fortis Memorial Healthcare');
  const [selectedMeds, setSelectedMeds] = useState<string[]>([
    'Atorvastatin 10mg Tablets (1 tab daily hs)',
    'Metformin HCl 500mg Tablets (1 tab bid with meals)',
  ]);
  const [diagnosisNote, setDiagnosisNote] = useState('Dyslipidemia and impaired fasting glucose management.');
  const [patientConsent, setPatientConsent] = useState(true);
  const [uploadSuccessModal, setUploadSuccessModal] = useState<Prescription | null>(null);

  const handleApplyDoctorInfo = (name: string, license: string, clinic: string) => {
    setDoctorName(name);
    setDoctorLicense(license);
    setClinicHospital(clinic);
  };

  const handleExtractionComplete = (result: PrescriptionAnalysisResult) => {
    setDoctorName(result.doctorName);
    setDoctorLicense(result.doctorLicense);
    setClinicHospital(result.clinicHospital);
    if (result.diagnosisNote) {
      setDiagnosisNote(result.diagnosisNote);
    }
    if (result.medicines && result.medicines.length > 0) {
      setSelectedMeds(
        result.medicines.map(
          (m) => `${m.name} (${m.dosageForm} • ${m.strength}) - ${m.frequency}`
        )
      );
    }
  };

  const handleQuickUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientConsent) return;

    const newRx = uploadPrescription({
      doctorName,
      doctorLicense,
      clinicHospital,
      fileName: 'verified_prescription_document.pdf',
      fileSize: '1.4 MB',
      prescribedMedicines: selectedMeds,
      diagnosisNote,
      matchedMedicineIds: ['med-1', 'med-2'],
    });

    setUploadSuccessModal(newRx);
  };

  const getStatusBadge = (status: Prescription['status']) => {
    switch (status) {
      case 'Accepted':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Accepted & Validated
          </span>
        );
      case 'Pending Review':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 text-xs font-semibold">
            <Clock className="h-3.5 w-3.5" />
            Pending Review
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 px-2.5 py-0.5 text-xs font-semibold">
            <AlertTriangle className="h-3.5 w-3.5" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2.5 py-0.5 text-xs">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span>Clinical Verification Gateway & AI Vision (PRD Section 9.3)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Prescription Upload & AI Visual Analysis
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Upload prescription documents to auto-populate medicine comparison search fields via Gemini visual OCR and submit genuine prescriptions for clinical pharmacist verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs">
            <div className="text-zinc-500">Security & Privacy</div>
            <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
              <Lock className="h-3 w-3 text-emerald-500" />
              <span>HIPAA / Encrypted Vault</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Visual Analysis Hero Module */}
      <AIPrescriptionScanner
        onApplyDoctorInfo={handleApplyDoctorInfo}
        onExtractionComplete={handleExtractionComplete}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Form Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span>Submit to Pharmacist Review Queue</span>
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Form auto-fills from AI visual extraction above. Verify prescriber details before submitting.
            </p>

            <form onSubmit={handleQuickUpload} className="mt-5 space-y-4">
              {/* Doctor Details */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Doctor / Prescriber Name
                </label>
                <input
                  type="text"
                  required
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Medical License No.
                  </label>
                  <input
                    type="text"
                    required
                    value={doctorLicense}
                    onChange={(e) => setDoctorLicense(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Clinic / Hospital
                  </label>
                  <input
                    type="text"
                    required
                    value={clinicHospital}
                    onChange={(e) => setClinicHospital(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Diagnosis Note */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Diagnosis / Indication Note
                </label>
                <input
                  type="text"
                  value={diagnosisNote}
                  onChange={(e) => setDiagnosisNote(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Prescribed Drugs Extracted */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Extracted Prescribed Medicines ({selectedMeds.length})
                </label>
                <div className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs space-y-1 font-mono text-zinc-700 dark:text-zinc-300 max-h-28 overflow-y-auto">
                  {selectedMeds.map((med, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{med}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consent requirement (PRD FR-USER-02) */}
              <div className="pt-2">
                <label className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={patientConsent}
                    onChange={(e) => setPatientConsent(e.target.checked)}
                    className="mt-0.5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>
                    I confirm that this prescription is authentic, current, issued to me, and has not been altered. I authorize verification by partner pharmacies.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={!patientConsent}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Submit Prescription for Pharmacist Review</span>
              </button>
            </form>
          </div>

          {/* Clinical Policy Notice */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-5 text-xs text-zinc-600 dark:text-zinc-400 space-y-2">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Non-Substitution Guarantee (PRD Section 4.3 & 9.3)</span>
            </h4>
            <p className="leading-relaxed">
              genericMed strictly preserves doctor clinical instructions. The platform will never automatically change a prescription based solely on price. Generic alternatives are presented strictly within biological equivalence standards.
            </p>
          </div>
        </div>

        {/* Existing Prescriptions Vault */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Prescription Vault ({prescriptions.length})
            </h3>
            <span className="text-xs text-zinc-500">
              Encrypted storage with immutable audit trail
            </span>
          </div>

          <div className="space-y-4">
            {prescriptions.map((rx) => (
              <div
                key={rx.id}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs transition hover:border-zinc-300 dark:hover:border-zinc-700"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {rx.id.toUpperCase()}
                      </span>
                      <span className="text-xs text-zinc-400">•</span>
                      <span className="text-xs text-zinc-500">Uploaded {rx.uploadedAt}</span>
                    </div>
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
                      {rx.doctorName} ({rx.doctorLicense})
                    </div>
                    <div className="text-xs text-zinc-500">{rx.clinicHospital}</div>
                  </div>

                  <div className="shrink-0">{getStatusBadge(rx.status)}</div>
                </div>

                {/* Prescribed Drugs details */}
                <div className="py-3">
                  <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                    Prescribed Medicines:
                  </div>
                  <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                    {rx.prescribedMedicines.map((medText, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                        <span>{medText}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Reviewer / Rejection Note */}
                {rx.status === 'Accepted' && rx.reviewedBy && (
                  <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                    <span>
                      Reviewed & Approved by: <strong>{rx.reviewedBy}</strong> at {rx.reviewedAt}
                    </span>
                    <button
                      onClick={() => setActiveTab('compare')}
                      className="font-bold underline hover:no-underline ml-2"
                    >
                      Compare Seller Prices
                    </button>
                  </div>
                )}

                {rx.status === 'Rejected' && rx.rejectionReason && (
                  <div className="mt-2 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-xs text-rose-900 dark:text-rose-200">
                    <strong>Rejection Reason:</strong> {rx.rejectionReason}
                  </div>
                )}

                {rx.status === 'Pending Review' && (
                  <div className="mt-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
                    <span>
                      In review queue with partner pharmacists. Turnaround SLA: &lt; 30 minutes.
                    </span>
                    <span className="text-[10px] font-mono text-amber-700 dark:text-amber-300">
                      Auto-updates on review
                    </span>
                  </div>
                )}

                {/* Direct auto-populate comparison action */}
                <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500">
                    {rx.prescribedMedicines.length} verified item(s)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const firstMed = rx.prescribedMedicines[0] || 'Atorvastatin';
                      const cleanTerm = firstMed.split(' ')[0];
                      autoPopulateComparisonSearch({
                        query: cleanTerm,
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold transition"
                  >
                    <Search className="h-3.5 w-3.5" />
                    <span>Auto-Populate & Compare Prices</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Success Modal */}
      {uploadSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Prescription Submitted Successfully
                </h3>
                <p className="text-xs text-zinc-500">
                  Reference: {uploadSuccessModal.id.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-500">Prescribing Doctor:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {uploadSuccessModal.doctorName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">License:</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">
                  {uploadSuccessModal.doctorLicense}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Status:</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  Pending Pharmacist Review
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUploadSuccessModal(null)}
                className="flex-1 py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setUploadSuccessModal(null);
                  autoPopulateComparisonSearch({
                    query: 'Atorvastatin',
                  });
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Compare Prices</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
