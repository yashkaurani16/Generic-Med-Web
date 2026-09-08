import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
  ReferenceLine,
} from 'recharts';
import {
  TrendingDown,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Calendar,
  Layers,
  Store,
  Info,
  ArrowRight,
  Pill,
  Award,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Medicine, MedicinePack } from '../types';
import {
  getHistoricalPriceTrends,
  assessMarketRate,
  Timeframe,
  PriceTrendPoint,
} from '../data/priceHistoryData';

interface HistoricalPriceTrendChartProps {
  initialMedicineId?: string;
  onSelectMedicine?: (medicineId: string) => void;
  className?: string;
}

export const HistoricalPriceTrendChart: React.FC<HistoricalPriceTrendChartProps> = ({
  initialMedicineId,
  onSelectMedicine,
  className = '',
}) => {
  const {
    medicines,
    selectedMedicineId,
    setSelectedMedicineId,
    getLowestComparableOffer,
    addToCart,
    showToast,
  } = useApp();

  // Active medicine state
  const activeMedId = initialMedicineId || selectedMedicineId || medicines[0]?.id || 'med-1';
  const activeMed = useMemo(() => {
    return medicines.find((m) => m.id === activeMedId) || medicines[0];
  }, [medicines, activeMedId]);

  // Selected pack state for the active medicine
  const [selectedPackId, setSelectedPackId] = useState<string>(() => {
    return activeMed?.packs[0]?.packId || 'med-1-pack-10';
  });

  // Ensure selectedPackId stays aligned with activeMed packs
  const currentPack = useMemo(() => {
    return (
      activeMed.packs.find((p) => p.packId === selectedPackId) || activeMed.packs[0]
    );
  }, [activeMed, selectedPackId]);

  // Selected timeframe
  const [timeframe, setTimeframe] = useState<Timeframe>('180d');

  // View mode: 'market' (Generic vs Brand/Market Avg) or 'sellers' (By Pharmacy Partner)
  const [viewMode, setViewMode] = useState<'market' | 'sellers'>('market');

  // Toggle brand reference line in market view (to avoid squashing generic scale if desired)
  const [showBrandReference, setShowBrandReference] = useState<boolean>(true);

  // Retrieve trend points and market rate assessment
  const trendData = useMemo(() => {
    return getHistoricalPriceTrends(currentPack.packId, timeframe);
  }, [currentPack.packId, timeframe]);

  const assessment = useMemo(() => {
    return assessMarketRate(currentPack.packId, timeframe);
  }, [currentPack.packId, timeframe]);

  // Lowest live seller offer for this pack
  const lowestLiveOffer = useMemo(() => {
    return getLowestComparableOffer(activeMed.id, currentPack.packId);
  }, [getLowestComparableOffer, activeMed.id, currentPack.packId]);

  const handleMedicineChange = (newMedId: string) => {
    setSelectedMedicineId(newMedId);
    if (onSelectMedicine) {
      onSelectMedicine(newMedId);
    }
    const newMed = medicines.find((m) => m.id === newMedId);
    if (newMed && newMed.packs[0]) {
      setSelectedPackId(newMed.packs[0].packId);
    }
  };

  const handleInstantBuyBestRate = () => {
    if (lowestLiveOffer) {
      addToCart(lowestLiveOffer, activeMed, currentPack);
      showToast(
        'success',
        'Best Market Rate Added to Cart',
        `Added ${activeMed.name} (${currentPack.packLabel}) from ${lowestLiveOffer.pharmacyName} at $${lowestLiveOffer.price.toFixed(2)}.`
      );
    }
  };

  // Custom rich tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: PriceTrendPoint = payload[0]?.payload;
      return (
        <div className="rounded-xl bg-zinc-950/95 border border-zinc-800 p-3.5 shadow-2xl text-xs text-white max-w-xs backdrop-blur-md">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
            <span className="font-semibold text-zinc-300">{data.fullDate || label}</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded">
              Verified Rates
            </span>
          </div>

          <div className="space-y-1.5">
            {viewMode === 'market' ? (
              <>
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>genericMed Lowest:</span>
                  </span>
                  <span className="font-bold text-emerald-300 font-mono text-sm">
                    ${data.lowestPrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <span className="h-2 w-2 rounded-full bg-cyan-400" />
                    <span>Market Average:</span>
                  </span>
                  <span className="font-mono text-zinc-200">
                    ${data.marketAverage.toFixed(2)}
                  </span>
                </div>

                {showBrandReference && (
                  <div className="flex items-center justify-between gap-4 pt-1 border-t border-zinc-800/80">
                    <span className="flex items-center gap-1.5 text-rose-400">
                      <span className="h-2 w-2 rounded-full bg-rose-400" />
                      <span>Brand ({activeMed.brandName.split('/')[0]}):</span>
                    </span>
                    <span className="font-mono text-rose-300 line-through">
                      ${data.brandPrice.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="mt-2 pt-1.5 border-t border-zinc-800 text-[11px] text-emerald-400 flex justify-between font-medium">
                  <span>Savings vs Brand:</span>
                  <span>
                    ${(data.brandPrice - data.lowestPrice).toFixed(2)} (
                    {Math.round(((data.brandPrice - data.lowestPrice) / data.brandPrice) * 100)}%)
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="text-[11px] text-zinc-400 mb-1">Seller Offer Breakdown:</div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" /> MedPlus:
                  </span>
                  <span className="font-mono font-bold">${data.medplus.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-blue-400 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-400" /> CarePoint:
                  </span>
                  <span className="font-mono font-bold">${data.carepoint.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-teal-400 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-teal-400" /> NetMedics:
                  </span>
                  <span className="font-mono font-bold">${data.netmedics.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-purple-400 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-purple-400" /> Apollo:
                  </span>
                  <span className="font-mono font-bold">${data.apollo.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-400" /> Wellness 24/7:
                  </span>
                  <span className="font-mono font-bold">${data.wellness.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="historical-price-trends-section"
      className={`rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm transition-all ${className}`}
    >
      {/* Header with Title and Global Selectors */}
      <div className="p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Market Rate Intelligence (Recharts Analytics)</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Historical Price Trends & Market Rate Benchmark
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Verify whether you are paying the best market rate across pharmacy partners, track 30D to 1Y price volatility, and view generic savings corridors.
          </p>
        </div>

        {/* Medicine Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="trend-med-select" className="text-xs font-medium text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
            Medicine:
          </label>
          <select
            id="trend-med-select"
            value={activeMed.id}
            onChange={(e) => handleMedicineChange(e.target.value)}
            className="h-9 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {medicines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.strength}) - {m.brandName.split('/')[0].trim()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Best Market Rate Evaluation Banner */}
      <div className="p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-emerald-50/60 via-teal-50/40 to-white dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-zinc-900">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                <Award className="h-3.5 w-3.5" />
                {assessment.badgeText}
              </span>

              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {activeMed.name} ({currentPack.packLabel})
              </span>

              {assessment.trendDirection === 'falling' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-900/50 px-2 py-0.5 rounded-md">
                  <TrendingDown className="h-3.5 w-3.5" />
                  {Math.abs(assessment.trendPercent)}% price drop this period
                </span>
              ) : assessment.trendDirection === 'rising' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-900/50 px-2 py-0.5 rounded-md">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +{assessment.trendPercent}% vs period start
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                  Stable Market Rate (±1%)
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
              {assessment.verdict}{' '}
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                {assessment.suggestedAction}
              </span>
            </p>
          </div>

          {/* Direct Cart Action */}
          {lowestLiveOffer && (
            <div className="shrink-0 flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-zinc-500">Live Lowest Offer</div>
                <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
                  ${lowestLiveOffer.price.toFixed(2)}
                </div>
                <div className="text-[11px] text-zinc-500 truncate max-w-[140px]">
                  via {lowestLiveOffer.pharmacyName}
                </div>
              </div>

              <button
                type="button"
                onClick={handleInstantBuyBestRate}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
              >
                <span>Select & Lock Rate</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* 4 Quantitative Intelligence Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-emerald-200/50 dark:border-emerald-800/40 text-xs">
          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
            <span className="text-[11px] text-zinc-500">Current Best Market Rate</span>
            <div className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
              ${assessment.currentLowest.toFixed(2)}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              via {assessment.lowestSellerName}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
            <span className="text-[11px] text-zinc-500">Regional Market Average</span>
            <div className="text-base sm:text-lg font-black text-zinc-800 dark:text-zinc-200 mt-0.5">
              ${assessment.averagePrice.toFixed(2)}
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
              Save {assessment.savingsVsAvgPct}% below average
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
            <span className="text-[11px] text-zinc-500">Brand Name ({activeMed.brandName.split('/')[0].trim()})</span>
            <div className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400 line-through mt-0.5">
              ${assessment.brandPrice.toFixed(2)}
            </div>
            <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold mt-0.5">
              Save {assessment.savingsVsBrandPct}% with generic
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
            <span className="text-[11px] text-zinc-500">Period Low / High</span>
            <div className="text-base sm:text-lg font-black text-zinc-800 dark:text-zinc-200 mt-0.5">
              ${assessment.periodLow.toFixed(2)} - ${assessment.periodHigh.toFixed(2)}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              {timeframe.toUpperCase()} timeframe
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls Bar: Pack Size, Timeframe, View Mode */}
      <div className="p-4 sm:px-6 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Pack selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-zinc-500">Pack:</span>
          <div className="inline-flex gap-1.5 flex-wrap">
            {activeMed.packs.map((pack) => {
              const isSelected = pack.packId === currentPack.packId;
              return (
                <button
                  key={pack.packId}
                  type="button"
                  onClick={() => setSelectedPackId(pack.packId)}
                  className={`px-3 py-1 rounded-lg text-xs transition-all ${
                    isSelected
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-medium'
                  }`}
                >
                  {pack.packLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* View mode & Timeframe toggles */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* View mode pills */}
          <div className="inline-flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('market')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                viewMode === 'market'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Market Corridor
            </button>
            <button
              type="button"
              onClick={() => setViewMode('sellers')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                viewMode === 'sellers'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Seller Comparison
            </button>
          </div>

          {/* Timeframe selector */}
          <div className="inline-flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-0.5">
            {(['30d', '90d', '180d', '1y'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition uppercase ${
                  timeframe === tf
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Brand Reference line toggle (in market view) */}
          {viewMode === 'market' && (
            <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-zinc-600 dark:text-zinc-400 select-none">
              <input
                type="checkbox"
                checked={showBrandReference}
                onChange={(e) => setShowBrandReference(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
              />
              <span>Brand Price Curve</span>
            </label>
          )}
        </div>
      </div>

      {/* Main Recharts Area */}
      <div className="p-4 sm:p-6">
        <div className="w-full h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'market' ? (
              <AreaChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="lowestPriceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="marketAvgGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#71717a' }}
                  tickLine={false}
                  axisLine={{ stroke: '#d4d4d8' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#71717a' }}
                  tickLine={false}
                  axisLine={{ stroke: '#d4d4d8' }}
                  tickFormatter={(val) => `$${val.toFixed(0)}`}
                  domain={['dataMin - 1', 'dataMax + 2']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '14px', fontSize: '12px' }}
                  formatter={(value) => {
                    if (value === 'lowestPrice') return 'genericMed Lowest Offer (Best Market Rate)';
                    if (value === 'marketAverage') return 'Regional Market Average (Generic)';
                    if (value === 'brandPrice') return `Brand Name (${activeMed.brandName.split('/')[0]})`;
                    return value;
                  }}
                />

                {/* Reference line showing current live lowest rate */}
                <ReferenceLine
                  y={assessment.currentLowest}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{
                    value: `Best Live: $${assessment.currentLowest.toFixed(2)}`,
                    position: 'insideBottomRight',
                    fill: '#10b981',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />

                {/* Generic Lowest Price Area & Line */}
                <Area
                  type="monotone"
                  dataKey="lowestPrice"
                  name="lowestPrice"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#lowestPriceGradient)"
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
                />

                {/* Regional Market Average Line */}
                <Line
                  type="monotone"
                  dataKey="marketAverage"
                  name="marketAverage"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#06b6d4' }}
                />

                {/* Innovator Brand Price Line */}
                {showBrandReference && (
                  <Line
                    type="monotone"
                    dataKey="brandPrice"
                    name="brandPrice"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#f43f5e' }}
                  />
                )}
              </AreaChart>
            ) : (
              /* Seller Comparison Multi-Line Chart */
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#71717a' }}
                  tickLine={false}
                  axisLine={{ stroke: '#d4d4d8' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#71717a' }}
                  tickLine={false}
                  axisLine={{ stroke: '#d4d4d8' }}
                  tickFormatter={(val) => `$${val.toFixed(0)}`}
                  domain={['dataMin - 0.5', 'dataMax + 0.5']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '14px', fontSize: '12px' }}
                  formatter={(value) => {
                    const sellerLabels: Record<string, string> = {
                      medplus: 'MedPlus Direct',
                      carepoint: 'CarePoint Pharmacy',
                      netmedics: 'NetMedics Hub',
                      apollo: 'Apollo Health Store',
                      wellness: 'Wellness Forever 24/7',
                    };
                    return sellerLabels[value] || value;
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="medplus"
                  name="medplus"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="carepoint"
                  name="carepoint"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="netmedics"
                  name="netmedics"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="apollo"
                  name="apollo"
                  stroke="#a855f7"
                  strokeWidth={1.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="wellness"
                  name="wellness"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Footer with Compliance & Calculation Notes */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            <span>
              Best Market Rate benchmark calculated via daily normalized unit pricing across accredited regional sellers.
            </span>
          </div>
          <span className="font-mono text-zinc-400">
            Freshness SLA: Verified hourly
          </span>
        </div>
      </div>
    </div>
  );
};
