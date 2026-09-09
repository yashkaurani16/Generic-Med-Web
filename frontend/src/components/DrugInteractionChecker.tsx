import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Loader2, Pill } from 'lucide-react';
import { CartItem } from '../types';

interface DrugInteractionCheckerProps {
  items: CartItem[];
}

interface InteractionDetail {
  drug1: string;
  drug2: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  recommendation: string;
}

interface InteractionResponse {
  medicines: string[];
  interactions: InteractionDetail[];
  overallRisk: 'mild' | 'moderate' | 'severe';
  checkedAt: string;
  source: string;
}

export const DrugInteractionChecker: React.FC<DrugInteractionCheckerProps> = ({ items }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InteractionResponse | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract unique medicines from cart
  const uniqueMeds = React.useMemo(() => {
    const map = new Map<string, { genericName: string; strength?: string }>();
    items.forEach((item) => {
      if (!map.has(item.medicine.genericName)) {
        map.set(item.medicine.genericName, {
          genericName: item.medicine.genericName,
          strength: item.medicine.strength,
        });
      }
    });
    return Array.from(map.values());
  }, [items]);

  useEffect(() => {
    if (uniqueMeds.length < 2) {
      setResult(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch('/api/interactions/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ medicines: uniqueMeds }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Interaction check unavailable');
        }
        return res.json();
      })
      .then((data: InteractionResponse) => {
        if (isMounted) {
          setResult(data);
          setLoading(false);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          console.warn('[INTERACTION CHECK]', err.message);
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [uniqueMeds]);

  if (uniqueMeds.length < 2) return null;

  if (loading) {
    return (
      <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex items-center gap-3 text-xs text-zinc-500">
        <Loader2 className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-400" />
        <span>Screening {uniqueMeds.length} medications for clinical drug-drug interactions...</span>
      </div>
    );
  }

  if (error || !result) return null;

  const isSevere = result.overallRisk === 'severe';
  const isModerate = result.overallRisk === 'moderate';

  const containerClasses = isSevere
    ? 'bg-red-50/80 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-200'
    : isModerate
    ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200'
    : 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200';

  const iconClasses = isSevere
    ? 'text-red-600 dark:text-red-400'
    : isModerate
    ? 'text-amber-600 dark:text-amber-400'
    : 'text-emerald-600 dark:text-emerald-400';

  return (
    <div className={`rounded-xl border p-3.5 text-xs transition-all shadow-xs ${containerClasses}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          {isSevere ? (
            <ShieldAlert className={`h-5 w-5 shrink-0 mt-0.5 ${iconClasses}`} />
          ) : isModerate ? (
            <AlertTriangle className={`h-5 w-5 shrink-0 mt-0.5 ${iconClasses}`} />
          ) : (
            <CheckCircle2 className={`h-5 w-5 shrink-0 mt-0.5 ${iconClasses}`} />
          )}
          <div>
            <div className="font-semibold flex items-center gap-2">
              <span>
                {isSevere
                  ? 'Severe Drug Interaction Warning'
                  : isModerate
                  ? 'Moderate Drug Interaction Alert'
                  : 'Drug Interaction Safety Check Passed'}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                isSevere
                  ? 'bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-100'
                  : isModerate
                  ? 'bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-100'
                  : 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100'
              }`}>
                {result.overallRisk}
              </span>
            </div>
            <p className="mt-1 text-[11px] opacity-90 leading-relaxed">
              {result.interactions[0]?.description || 'No adverse interactions detected among cart items.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition shrink-0"
          aria-label={expanded ? 'Collapse details' : 'Expand details'}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-current/10 space-y-2">
          {result.interactions.map((interaction, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-1 font-semibold text-[11px]">
                <Pill className="h-3 w-3" />
                <span>{interaction.drug1} + {interaction.drug2}</span>
              </div>
              <p className="text-[11px] opacity-80 pl-4">{interaction.recommendation}</p>
            </div>
          ))}
          <div className="text-[10px] opacity-60 pt-1 text-right">
            Verified via {result.source}
          </div>
        </div>
      )}
    </div>
  );
};
