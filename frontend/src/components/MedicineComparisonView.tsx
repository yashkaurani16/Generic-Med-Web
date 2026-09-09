import React, { useState, useMemo } from 'react';
import {
  Search,
  Pill,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingDown,
  Info,
  SlidersHorizontal,
  ChevronRight,
  Upload,
  ArrowRight,
  ExternalLink,
  Store,
  AlertTriangle,
  LineChart as LucideLineChart,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Medicine, MedicinePack, SellerOffer } from '../types';
import { HistoricalPriceTrendChart } from './HistoricalPriceTrendChart';
import { SearchAutocomplete } from './SearchAutocomplete';

export const MedicineComparisonView: React.FC = () => {
  const {
    medicines,
    getOffersForMedicinePack,
    getLowestComparableOffer,
    addToCart,
    setActiveTab,
    setSelectedMedicineId,
    prescriptions,
    searchQuery,
    setSearchQuery,
    selectedTherapeutic,
    setSelectedTherapeutic,
    rxFilter,
    setRxFilter,
  } = useApp();

  const [selectedPackMap, setSelectedPackMap] = useState<Record<string, string>>({
    'med-1': 'med-1-pack-10',
    'med-2': 'med-2-pack-30',
    'med-3': 'med-3-pack-10',
    'med-4': 'med-4-pack-15',
    'med-5': 'med-5-pack-10',
    'med-6': 'med-6-pack-3',
    'med-7': 'med-7-pack-15',
    'med-8': 'med-8-pack-10',
  });

  const [explainCalculationOpen, setExplainCalculationOpen] = useState(false);
  const [showPriceTrends, setShowPriceTrends] = useState(true);

  // Filter medicines
  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        med.name.toLowerCase().includes(q) ||
        med.brandName.toLowerCase().includes(q) ||
        med.genericName.toLowerCase().includes(q) ||
        med.activeIngredient.toLowerCase().includes(q) ||
        med.therapeuticClass.toLowerCase().includes(q);

      const matchesTherapeutic =
        selectedTherapeutic === 'all' ||
        med.therapeuticClass.toLowerCase().includes(selectedTherapeutic.toLowerCase());

      const matchesRx =
        rxFilter === 'all' ||
        (rxFilter === 'rx' && med.isPrescriptionRequired) ||
        (rxFilter === 'otc' && !med.isPrescriptionRequired);

      return matchesQuery && matchesTherapeutic && matchesRx;
    });
  }, [medicines, searchQuery, selectedTherapeutic, rxFilter]);

  const acceptedPrescriptionCount = prescriptions.filter((p) => p.status === 'Accepted').length;

  return (
    <div className="space-y-8">
      {/* Hero Search & Value Proposition Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 text-white p-6 sm:p-10 border border-zinc-800 shadow-xl">
        {/* Subtle decorative background glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Prescription-Aware Medicine Marketplace</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Compare verified seller prices for <span className="text-emerald-400">identical medicine packs</span>.
          </h1>
          <p className="mt-3 text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
            Save up to 85% by matching brand names (Lipitor, Glucophage, Amoxil) to authorized generic equivalents with pack size normalization and guaranteed inventory freshness.
          </p>

          {/* Quick Prescription Action Bar */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('prescriptions')}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/30 transition-all"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Prescription for Auto-Match</span>
            </button>
            <button
              onClick={() => {
                setShowPriceTrends(!showPriceTrends);
                if (!showPriceTrends) {
                  setTimeout(() => {
                    document.getElementById('historical-price-trends-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 80);
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold border border-emerald-500/40 shadow-sm transition-all"
            >
              <LucideLineChart className="h-4 w-4 text-emerald-200" />
              <span>{showPriceTrends ? 'Price Trends Chart Active' : 'Historical Price Trends & Market Rate'}</span>
            </button>
            <button
              onClick={() => setExplainCalculationOpen(!explainCalculationOpen)}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors"
            >
              <Info className="h-4 w-4 text-emerald-400" />
              <span>How "Lowest Price" is Calculated</span>
            </button>
          </div>
        </div>

        {/* PRD Transparency Policy Drawer */}
        {explainCalculationOpen && (
          <div className="mt-6 pt-6 border-t border-zinc-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-300">
            <div className="p-3.5 rounded-xl bg-zinc-800/50 border border-zinc-700/60">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
                <ShieldCheck className="h-4 w-4" />
                <span>1. Pack Equivalence Rule</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Offers are only compared when drug identity, strength (e.g. 10mg), dosage form, and quantity (e.g. 10 tablets) pass canonical equivalence validation.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-800/50 border border-zinc-700/60">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
                <Clock className="h-4 w-4" />
                <span>2. Freshness SLA Exclusion</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Seller offers older than 24 hours without inventory re-confirmation are automatically flagged as stale and excluded from the "Lowest Price" ranking.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-800/50 border border-zinc-700/60">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
                <TrendingDown className="h-4 w-4" />
                <span>3. Fee Disclosure</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Base product price is ranked transparently; shipping charges, packaging fees, and taxes are itemized separately in the checkout summary.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Prescription Notice Bar */}
      {acceptedPrescriptionCount > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>{acceptedPrescriptionCount} active verified prescription(s) linked to your profile:</strong> You can purchase prescription-required (Rx) medicines without fulfillment holds.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className="font-bold underline hover:no-underline ml-2 shrink-0"
          >
            Manage Prescriptions
          </button>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="flex flex-col gap-4">
        {searchQuery && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                Active catalog filter: <strong>"{searchQuery}"</strong> (auto-populated or customized)
              </span>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTherapeutic('all');
              }}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/60"
            >
              Reset to All Medicines
            </button>
          </div>
        )}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Main Search Autocomplete Input */}
          <SearchAutocomplete
            value={searchQuery}
            onChange={setSearchQuery}
            onSelect={(med) => setSelectedMedicineId(med.id)}
            placeholder="Search by brand (e.g. Lipitor), generic (Atorvastatin), or indication..."
            className="flex-1"
          />

          {/* Rx Filter Switcher */}
          <div className="inline-flex rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1 text-xs font-medium self-start md:self-auto">
            <button
              onClick={() => setRxFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                rxFilter === 'all'
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              All Drugs
            </button>
            <button
              onClick={() => setRxFilter('rx')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                rxFilter === 'rx'
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Rx Only
            </button>
            <button
              onClick={() => setRxFilter('otc')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                rxFilter === 'otc'
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              OTC (No Rx)
            </button>
          </div>
        </div>

        {/* Therapeutic category chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          <span className="text-zinc-400 font-medium whitespace-nowrap flex items-center gap-1">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filter:
          </span>
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'Cardiovascular', label: 'Cardiovascular' },
            { id: 'Antidiabetic', label: 'Diabetes' },
            { id: 'Antibacterial', label: 'Antibiotics' },
            { id: 'Analgesic', label: 'Pain & Fever' },
            { id: 'Psychotropic', label: 'Mental Health' },
            { id: 'Gastrointestinal', label: 'Gastrointestinal' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedTherapeutic(cat.id)}
              className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                selectedTherapeutic === cat.id
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-semibold'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Historical Price Trends & Market Rate Intelligence (Recharts) */}
      {showPriceTrends && (
        <HistoricalPriceTrendChart
          onSelectMedicine={(medId) => {
            const cardEl = document.getElementById(`medicine-card-${medId}`);
            if (cardEl) {
              cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }}
        />
      )}

      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400 pt-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span>
            Showing <strong>{filteredMedicines.length}</strong> standardized medicine formulations with real-time pharmacy offers
          </span>
          <button
            type="button"
            onClick={() => setShowPriceTrends(!showPriceTrends)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-[11px] transition"
          >
            <LucideLineChart className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{showPriceTrends ? 'Hide Price Trends Chart' : 'Show Price Trends Chart'}</span>
            {showPriceTrends ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
        <span className="hidden sm:inline">
          Prices updated in real-time under genericMed Freshness SLA
        </span>
      </div>

      {/* Medicines Comparison List */}
      <div className="space-y-6">
        {filteredMedicines.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center">
            <Pill className="mx-auto h-8 w-8 text-zinc-400" />
            <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">No medicines match your search</h3>
            <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
              Try searching with the generic name (e.g. "Atorvastatin") or clear active filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTherapeutic('all');
                setRxFilter('all');
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          filteredMedicines.map((med) => {
            const activePackId = selectedPackMap[med.id] || med.packs?.[0]?.packId;
            const currentPack = med.packs?.find((p) => p.packId === activePackId) || med.packs?.[0];
            const offersForPack = currentPack ? getOffersForMedicinePack(med.id, currentPack.packId) : [];
            const lowestOffer = currentPack ? getLowestComparableOffer(med.id, currentPack.packId) : undefined;

            return (
              <div
                key={med.id}
                id={`medicine-card-${med.id}`}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-sm overflow-hidden transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
              >
                {/* Medicine Top Banner */}
                <div className="p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {/* Brand vs Generic Equivalence */}
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        Brand Equivalent: <span className="underline decoration-emerald-500 font-extrabold">{med.brandName}</span>
                      </span>
                      <span className="text-zinc-300 dark:text-zinc-700">•</span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        Generic: <strong className="text-zinc-800 dark:text-zinc-200">{med.genericName}</strong>
                      </span>
                      {med.isPrescriptionRequired ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-400">
                          <ShieldAlert className="h-3 w-3" />
                          Rx Required
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          OTC Eligible
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2.5">
                      <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                        {med.name}
                      </h2>
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {med.strength} • {med.dosageForm}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl">
                      {med.description}
                    </p>
                  </div>

                  {/* Lowest Price Callout Metric for selected pack */}
                  {lowestOffer ? (
                    <div className="lg:text-right shrink-0 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                      <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 flex items-center lg:justify-end gap-1">
                        <TrendingDown className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Lowest Comparable Price</span>
                      </div>
                      <div className="flex items-baseline lg:justify-end gap-2 mt-0.5">
                        <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                          ${lowestOffer.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-zinc-400 line-through">
                          MRP ${lowestOffer.mrp.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                        Save {Math.round(((lowestOffer.mrp - lowestOffer.price) / lowestOffer.mrp) * 100)}% via {lowestOffer.pharmacyName}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMedicineId(med.id);
                          setShowPriceTrends(true);
                          setTimeout(() => {
                            document.getElementById('historical-price-trends-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 50);
                        }}
                        className="mt-2.5 inline-flex items-center justify-center gap-1.5 w-full px-2.5 py-1.5 rounded-lg bg-emerald-100/90 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:hover:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200 text-[11px] font-bold transition shadow-2xs"
                      >
                        <LucideLineChart className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                        <span>View Price Trend & Market Rate</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-400 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      No current offers for this pack
                    </div>
                  )}
                </div>

                {/* Pack Selection & Pack Normalization */}
                <div className="px-5 sm:px-6 py-3 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs bg-white dark:bg-zinc-900">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-600 dark:text-zinc-400">Select Pack Size:</span>
                    <div className="inline-flex gap-1.5">
                      {med.packs.map((pack) => {
                        const isSelected = pack.packId === currentPack.packId;
                        return (
                          <button
                            key={pack.packId}
                            onClick={() =>
                              setSelectedPackMap((prev) => ({
                                ...prev,
                                [med.id]: pack.packId,
                              }))
                            }
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                              isSelected
                                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold shadow-xs'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                            }`}
                          >
                            {pack.packLabel}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <span className="text-[11px] text-zinc-400 font-mono">
                    Barcode ID: {currentPack.canonicalBarcode}
                  </span>
                </div>

                {/* Seller Offers Comparison Table */}
                <div className="p-4 sm:p-6">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center justify-between">
                    <span>Participating Pharmacy Sellers ({offersForPack.length})</span>
                    <span className="text-[11px] font-normal normal-case text-zinc-400">
                      Ranked by lowest payable pack price under freshness SLA
                    </span>
                  </div>

                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    {offersForPack.map((offer, index) => {
                      const isLowest = lowestOffer?.id === offer.id;
                      const unitPrice = (offer.price / currentPack.packQuantity).toFixed(2);

                      return (
                        <div
                          key={offer.id}
                          className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                            isLowest
                              ? 'bg-emerald-50/40 dark:bg-emerald-950/20'
                              : 'bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                          }`}
                        >
                          {/* Seller Identity & Freshness Info */}
                          <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shrink-0 mt-0.5">
                              <Store className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                  {offer.pharmacyName}
                                </h4>
                                {offer.verifiedBadge && (
                                  <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-600 dark:text-zinc-400">
                                    Verified
                                  </span>
                                )}
                                {(offer.pharmacyId === 'pharm-1' || offer.pharmacyId === 'pharm-3') && (
                                  <span className="rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" /> Enterprise Partner
                                  </span>
                                )}
                                {isLowest && (
                                  <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold">
                                    Lowest Price
                                  </span>
                                )}
                              </div>

                              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-zinc-400" />
                                  <span>{offer.deliveryEstimate}</span>
                                </span>
                                <span>•</span>
                                <span>
                                  Delivery:{' '}
                                  <strong className="text-zinc-800 dark:text-zinc-200">
                                    {offer.deliveryFee === 0 ? 'FREE' : `$${offer.deliveryFee.toFixed(2)}`}
                                  </strong>
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1 font-mono text-[11px]">
                                  {offer.freshnessStatus === 'fresh' ? (
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  ) : offer.freshnessStatus === 'warning' ? (
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                  ) : (
                                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                  )}
                                  <span>Updated {offer.lastUpdated}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Price & Action Button */}
                          <div className="flex items-center justify-between sm:justify-end gap-5">
                            <div className="text-right">
                              <div className="flex items-baseline gap-1.5 sm:justify-end">
                                <span className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                                  ${offer.price.toFixed(2)}
                                </span>
                                <span className="text-xs text-zinc-400">
                                  (${unitPrice}/{currentPack.packUnit.slice(0, -1).toLowerCase()})
                                </span>
                              </div>
                              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                {offer.inStock ? (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                    {offer.stockQuantity} in stock
                                  </span>
                                ) : (
                                  <span className="text-rose-600 font-semibold">Out of Stock</span>
                                )}
                              </div>
                            </div>

                            <button
                              disabled={!offer.inStock}
                              onClick={() => addToCart(offer, med, currentPack)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5 ${
                                !offer.inStock
                                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                                  : isLowest
                                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                                  : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200'
                              }`}
                            >
                              <span>{offer.inStock ? 'Select & Add' : 'Unavailable'}</span>
                              {offer.inStock && <ArrowRight className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
