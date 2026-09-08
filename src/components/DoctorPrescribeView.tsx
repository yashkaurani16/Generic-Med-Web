import React, { useState } from 'react';
import {
  Stethoscope,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Pill,
  Send,
  Plus,
  Trash2,
  Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DoctorPrescribeView: React.FC = () => {
  const { uploadPrescription, setActiveTab } = useApp();

  const [patientName, setPatientName] = useState('Yash Kaurani');
  const [doctorName, setDoctorName] = useState('Dr. Marcus Vance, MD (Cardiologist)');
  const [doctorLicense, setDoctorLicense] = useState('MCI-REG-778210');
  const [clinic, setClinic] = useState('Apex Heart & Vascular Institute');
  const [diagnosis, setDiagnosis] = useState('Hyperlipidemia & Secondary Atherosclerosis Prophylaxis');
  const [medsList, setMedsList] = useState<string[]>([
    'Atorvastatin Calcium 10mg Tablets (1 tablet orally at bedtime x 90 days)',
    'Metformin Hydrochloride 500mg (1 tablet orally with dinner)',
  ]);
  const [newMedInput, setNewMedInput] = useState('');
  const [issuedSuccessfully, setIssuedSuccessfully] = useState(false);

  const handleAddMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedInput.trim()) return;
    setMedsList([...medsList, newMedInput.trim()]);
    setNewMedInput('');
  };

  const handleRemoveMed = (idx: number) => {
    setMedsList(medsList.filter((_, i) => i !== idx));
  };

  const handleIssuePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (medsList.length === 0) return;

    uploadPrescription({
      patientName,
      doctorName,
      doctorLicense,
      clinicHospital: clinic,
      diagnosisNote: diagnosis,
      prescribedMedicines: medsList,
      fileName: `digital_rx_${doctorLicense}.pdf`,
      fileSize: '840 KB',
    });

    setIssuedSuccessfully(true);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/20 shrink-0">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
                  Prescriber Portal & Clinical Integrity
                </h1>
                <span className="rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[10px] font-bold px-2.5 py-0.5">
                  Doctor Verified (Persona B)
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Preserve medicine identity, dosage instructions, and prevent unauthorized pharmacy substitutions (PRD Section 4.3).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs">
            <Lock className="h-4 w-4 text-emerald-500" />
            <span>Digital Cryptographic Signature Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Prescription Generator Form */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-600" />
              <span>Generate Official Digital Prescription</span>
            </h3>

            {issuedSuccessfully ? (
              <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
                <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                  Prescription Issued & Transmitted
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
                  The prescription has been cryptographically signed and added to {patientName}'s secure prescription vault with immediate pharmacist queue routing.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => setActiveTab('prescriptions')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
                  >
                    View in Prescription Vault
                  </button>
                  <button
                    onClick={() => setIssuedSuccessfully(false)}
                    className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold"
                  >
                    Issue Another Prescription
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleIssuePrescription} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Patient Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Clinical Diagnosis / Indication
                    </label>
                    <input
                      type="text"
                      required
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Doctor Name & Specialization
                    </label>
                    <input
                      type="text"
                      required
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Medical Registration / License #
                    </label>
                    <input
                      type="text"
                      required
                      value={doctorLicense}
                      onChange={(e) => setDoctorLicense(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                    />
                  </div>
                </div>

                {/* Prescribed Drugs list */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Prescribed Medicines & Dosage Instructions:
                  </label>
                  <div className="space-y-2 mb-3">
                    {medsList.map((med, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Pill className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                          <span className="font-mono text-zinc-800 dark:text-zinc-200">{med}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMed(idx)}
                          className="p-1 text-zinc-400 hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add drug input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add medicine (e.g. Amoxicillin 500mg 1 cap tid x 7 days)..."
                      value={newMedInput}
                      onChange={(e) => setNewMedInput(e.target.value)}
                      className="flex-1 h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddMed}
                      className="px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>Digitally Sign & Transmit to genericMed Vault</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Doctor Trust Policy Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 p-5 space-y-3 text-xs">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              <span>Doctor Protection Clauses (PRD Section 3.1 & 4.3)</span>
            </h4>
            <div className="space-y-2 text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <p>
                <strong>Prescription Integrity:</strong> genericMed guarantees that the medicine name, strength, dosage form, and prescribed quantity are strictly preserved when an offer is sourced.
              </p>
              <p>
                <strong>No Clinical Substitution:</strong> Lower price will never override clinical instructions. The platform strictly prohibits automatic substitution of distinct chemical entities or dissimilar dosages.
              </p>
              <p>
                <strong>Pharmacist Check:</strong> An independent licensed pharmacist at the fulfillment pharmacy reviews the digital document before dispensing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
