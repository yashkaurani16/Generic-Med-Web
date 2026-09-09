import React, { useState } from 'react';
import {
  Sparkles,
  FileImage,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Search,
  Building2,
  FileText,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Pill,
  ExternalLink,
  Layers,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PrescriptionAnalysisResult, ExtractedPrescriptionMedicine } from '../types';
import { matchPrescriptionToCatalog } from '../utils/prescriptionMatcher';

interface AIPrescriptionScannerProps {
  onApplyDoctorInfo: (doctorName: string, doctorLicense: string, clinic: string) => void;
  onExtractionComplete?: (result: PrescriptionAnalysisResult) => void;
}

export const AIPrescriptionScanner: React.FC<AIPrescriptionScannerProps> = ({
  onApplyDoctorInfo,
  onExtractionComplete,
}) => {
  const { medicines, autoPopulateComparisonSearch, showToast } = useApp();

  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    dataUrl: string;
    sampleId?: string;
  } | null>({
    name: 'dr_sharma_cardio_prescription.jpg',
    size: '1.2 MB',
    dataUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    sampleId: 'sample-cardio',
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisPhase, setAnalysisPhase] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<PrescriptionAnalysisResult | null>(null);
  const [showRawText, setShowRawText] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preset sample prescriptions for immediate testing
  const samplePresets = [
    {
      id: 'sample-cardio',
      label: 'Cardiology Rx',
      doctor: 'Dr. Anita Sharma, MD',
      drugs: 'Atorvastatin 10mg + Metformin 500mg',
      imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
      tag: 'Cardio & Diabetes',
    },
    {
      id: 'sample-antibiotic',
      label: 'Pulmonology Rx',
      doctor: 'Dr. Vikramaditya Sen, MBBS',
      drugs: 'Amoxicillin 500mg + Montelukast 10mg',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
      tag: 'Respiratory & Infection',
    },
    {
      id: 'sample-gastro',
      label: 'Gastroenterology Rx',
      doctor: 'Dr. Meenakshi Sundaram, MD',
      drugs: 'Pantoprazole 40mg + Paracetamol 650mg',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
      tag: 'Gastro & Analgesic',
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        dataUrl: event.target?.result as string,
      });
      setAnalysisResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: typeof samplePresets[0]) => {
    setSelectedFile({
      name: `${sample.id}_prescription.jpg`,
      size: '1.4 MB',
      dataUrl: sample.imageUrl,
      sampleId: sample.id,
    });
    setAnalysisResult(null);
    setError(null);
  };

  const runVisualAnalysis = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysisPhase('Scanning image typography & doctor header...');

    const phaseTimer1 = setTimeout(() => {
      setAnalysisPhase('Extracting handwriting & pharmacological sig codes (Gemini Flash)...');
    }, 800);

    const phaseTimer2 = setTimeout(() => {
      setAnalysisPhase('Matching active ingredients to canonical medicine catalog...');
    }, 1600);

    try {
      const response = await fetch('/api/prescription/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: selectedFile.dataUrl,
          sampleId: selectedFile.sampleId,
          mimeType: 'image/jpeg',
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data: PrescriptionAnalysisResult = await response.json();
      setAnalysisResult(data);

      if (onExtractionComplete) {
        onExtractionComplete(data);
      }

      showToast(
        'success',
        'Visual Analysis Complete',
        `Identified ${data.medicines.length} medications from prescription image.`
      );
    } catch (err: any) {
      console.error('Visual analysis failed:', err);
      setError('Prescription visual analysis failed. Please verify the image is legible.');
    } finally {
      clearTimeout(phaseTimer1);
      clearTimeout(phaseTimer2);
      setIsAnalyzing(false);
      setAnalysisPhase('');
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Powered Prescription Vision (PRD FR-USER-02)</span>
          </div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            Visual OCR & Medicine Search Auto-Populate
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Extracts prescribed medications, active ingredients, and strengths from prescription photos to auto-populate price comparison fields.
          </p>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-500 bg-white dark:bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <Zap className="h-3 w-3 text-amber-500" />
            <span>gemini-3.8-flash</span>
          </span>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Sample Prescription Presets */}
        <div>
          <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center justify-between">
            <span>Select Sample or Upload Your Own:</span>
            <span className="text-[11px] font-normal text-zinc-500">1-Click Test Presets</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {samplePresets.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  selectedFile?.sampleId === sample.id
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/40 dark:bg-zinc-900/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  <span>{sample.label}</span>
                  <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {sample.tag}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500 mt-1 truncate">{sample.doctor}</div>
                <div className="text-[11px] font-mono font-medium text-emerald-700 dark:text-emerald-400 mt-1 truncate">
                  {sample.drugs}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Upload & Preview Area */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
          {/* File Picker & Drop Zone */}
          <div className="md:col-span-6 relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-5 text-center bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors flex flex-col items-center justify-center min-h-[170px]">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <FileImage className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mb-2" />
            <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Drag & drop prescription image, or <span className="text-emerald-600 dark:text-emerald-400 underline">browse</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">
              Supports JPEG, PNG, WebP up to 20MB
            </div>
            {selectedFile && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-700 dark:text-zinc-300">
                <FileText className="h-3.5 w-3.5 text-emerald-500" />
                <span className="truncate max-w-[180px]">{selectedFile.name}</span>
                <span className="text-zinc-400">({selectedFile.size})</span>
              </div>
            )}
          </div>

          {/* Document Preview & Scanning State */}
          <div className="md:col-span-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950/80 overflow-hidden relative min-h-[170px] flex items-center justify-center">
            {selectedFile?.dataUrl ? (
              <div className="relative w-full h-full max-h-[180px] flex items-center justify-center overflow-hidden">
                <img
                  src={selectedFile.dataUrl}
                  alt="Prescription preview"
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                {/* Laser scan animation when analyzing */}
                {isAnalyzing && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="w-full h-1 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse transition-all duration-300 translate-y-12" />
                    <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[0.5px]" />
                  </div>
                )}

                <div className="absolute bottom-2 left-2 right-2 text-white text-[11px] flex items-center justify-between font-mono bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                  <span className="truncate">{selectedFile.name}</span>
                  <span className="text-emerald-400 font-bold">Ready</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-zinc-400">No document selected</div>
            )}
          </div>
        </div>

        {/* Action Button: Run Visual Analysis */}
        <div>
          <button
            type="button"
            onClick={runVisualAnalysis}
            disabled={!selectedFile || isAnalyzing}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-zinc-300 disabled:to-zinc-400 dark:disabled:from-zinc-800 dark:disabled:to-zinc-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-white" />
                <span>{analysisPhase || 'Analyzing prescription image...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-emerald-200" />
                <span>Run AI Visual Analysis (Gemini Flash)</span>
              </>
            )}
          </button>

          {error && (
            <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Analysis Results Display */}
        {analysisResult && (
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-5 animate-fadeIn">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                    Prescription Visual Extraction Succeeded
                  </div>
                  <div className="text-[11px] text-emerald-800 dark:text-emerald-300">
                    Extracted credentials for <strong>{analysisResult.doctorName}</strong> • {analysisResult.medicines.length} medicine(s) detected
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  onApplyDoctorInfo(
                    analysisResult.doctorName,
                    analysisResult.doctorLicense,
                    analysisResult.clinicHospital
                  )
                }
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition"
              >
                <span>Apply to Upload Form</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {/* Extracted Doctor & Diagnosis Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <span className="text-[11px] text-zinc-500">Prescribing Doctor</span>
                <div className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 truncate">
                  {analysisResult.doctorName}
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5 font-mono">
                  Reg: {analysisResult.doctorLicense}
                </div>
              </div>

              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <span className="text-[11px] text-zinc-500">Clinic / Hospital</span>
                <div className="font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 truncate">
                  {analysisResult.clinicHospital}
                </div>
                {analysisResult.patientName && (
                  <div className="text-[11px] text-zinc-500 mt-0.5 truncate">
                    Patient: {analysisResult.patientName}
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <span className="text-[11px] text-zinc-500">Diagnosis / Indication</span>
                <div className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 line-clamp-2">
                  {analysisResult.diagnosisNote || 'Not specified on Rx'}
                </div>
              </div>
            </div>

            {/* Extracted Medicines & Auto-Populate Action */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Pill className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Prescribed Medications Identified ({analysisResult.medicines.length})</span>
                </div>
                <span className="text-[11px] text-zinc-500">
                  Click below to auto-populate search and compare seller prices
                </span>
              </div>

              <div className="space-y-2.5">
                {analysisResult.medicines.map((med: ExtractedPrescriptionMedicine, idx: number) => {
                  const match = matchPrescriptionToCatalog(med, medicines);

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-xs hover:border-emerald-400 dark:hover:border-emerald-600 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                              {med.name}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                              {med.dosageForm} • {med.strength}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                              <ShieldCheck className="h-3 w-3" />
                              {med.confidenceScore}% legibility
                            </span>
                          </div>

                          <div className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                            Sig: {med.frequency}
                          </div>

                          {match.medicine ? (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium pt-1">
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                              <span>
                                Catalog Equivalent: <strong>{match.medicine.name}</strong> ({match.medicine.brandName})
                              </span>
                            </div>
                          ) : (
                            <div className="text-[11px] text-zinc-500 pt-1">
                              Active Ingredient: {med.genericName}
                            </div>
                          )}
                        </div>

                        {/* Direct Auto-Populate and Search Button */}
                        <div className="shrink-0 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              autoPopulateComparisonSearch({
                                query: match.suggestedSearchQuery || med.searchQuery,
                                therapeutic: med.therapeuticClass,
                                medicineId: match.medicine?.id,
                              })
                            }
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all group"
                          >
                            <Search className="h-3.5 w-3.5" />
                            <span>Auto-Populate & Compare</span>
                            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Verbatim Raw OCR Transcript Accordion */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-3.5 text-xs">
              <button
                type="button"
                onClick={() => setShowRawText(!showRawText)}
                className="w-full flex items-center justify-between text-zinc-700 dark:text-zinc-300 font-medium hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-zinc-500" />
                  <span>Clinical OCR Transcription (Raw Verbatim Text)</span>
                </div>
                {showRawText ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showRawText && (
                <div className="mt-3 p-3 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {analysisResult.rawExtractedText}
                </div>
              )}
            </div>

            {/* PRD Clinical Compliance Notice */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-200">
              <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>PRD Section 4.3 & 9.3 Compliance:</strong> AI prescription visual analysis automatically fills the comparison query to save you time. However, all prescription orders undergo mandatory secondary verification by licensed pharmacists before pack dispatch.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
