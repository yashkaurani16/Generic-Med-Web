import React, { useState, useEffect } from 'react';
import {
  Building2,
  Star,
  Clock,
  MapPin,
  ShieldCheck,
  Award,
  Pill,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PharmacyPartner } from '../types';

export const PharmacyProfileView: React.FC = () => {
  const { pharmacies, activePharmacyId, setActivePharmacyId, medicines, offers, addToCart, setActiveTab } = useApp();
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyPartner | null>(null);
  const [userRating, setUserRating] = useState<number>(5);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingMessage, setRatingMessage] = useState<string | null>(null);

  useEffect(() => {
    const current = pharmacies.find((p) => p.id === activePharmacyId) || pharmacies[0] || null;
    setSelectedPharmacy(current);
  }, [activePharmacyId, pharmacies]);

  const pharmacyOffers = offers.filter((o) => o.pharmacyId === selectedPharmacy?.id);

  const handleRatePharmacy = async () => {
    if (!selectedPharmacy) return;
    setIsSubmittingRating(true);
    try {
      const res = await fetch(`/api/pharmacies/${selectedPharmacy.id}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rating: userRating }),
      });
      if (res.ok) {
        const data = await res.json();
        setRatingMessage('Thank you for rating this pharmacy partner!');
        if (data.pharmacy) {
          setSelectedPharmacy((prev) => prev ? { ...prev, rating: data.pharmacy.rating, reviewCount: data.pharmacy.reviewCount } : null);
        }
      }
    } catch (err: any) {
      console.error('Rating failed:', err);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (!selectedPharmacy) {
    return (
      <div className="py-20 text-center text-zinc-500 text-sm">
        No pharmacy partner selected.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Pharmacy Switcher Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider shrink-0 mr-2">
          Select Pharmacy:
        </span>
        {pharmacies.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setActivePharmacyId(p.id);
              setSelectedPharmacy(p);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-1.5 ${
              selectedPharmacy.id === p.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 text-white p-6 sm:p-8 border border-zinc-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>CDSCO Verified & Compliant</span>
              </span>
              <span className="text-xs text-zinc-400">License: {selectedPharmacy.licenseNumber}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {selectedPharmacy.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-300">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                {selectedPharmacy.address}, {selectedPharmacy.city}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-emerald-400" />
                Avg Fulfillment SLA: {selectedPharmacy.slaMinutes} minutes
              </span>
            </div>
          </div>

          {/* Rating Badge Card */}
          <div className="p-4 rounded-2xl bg-zinc-800/80 border border-zinc-700/80 flex flex-col items-center justify-center shrink-0 min-w-[160px] text-center">
            <div className="flex items-center gap-1 text-amber-400 text-xl font-black">
              <Star className="h-5 w-5 fill-amber-400" />
              <span>{selectedPharmacy.rating.toFixed(1)}</span>
            </div>
            <span className="text-[11px] text-zinc-400 mt-1">
              Based on {selectedPharmacy.reviewCount} patient reviews
            </span>
          </div>
        </div>
      </div>

      {/* Rate This Pharmacy Card */}
      <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Award className="h-4 w-4 text-emerald-600" />
            <span>Rate Your Experience with {selectedPharmacy.name}</span>
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Help fellow patients choose reliable local dispensing partners.
          </p>
        </div>

        {ratingMessage ? (
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {ratingMessage}
          </span>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setUserRating(star)}
                  className={`p-1 transition ${
                    userRating >= star ? 'text-amber-400' : 'text-zinc-300 dark:text-zinc-700'
                  }`}
                >
                  <Star className="h-4 w-4 fill-current" />
                </button>
              ))}
            </div>

            <button
              onClick={handleRatePharmacy}
              disabled={isSubmittingRating}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 transition disabled:opacity-50"
            >
              {isSubmittingRating ? 'Saving...' : 'Submit Rating'}
            </button>
          </div>
        )}
      </div>

      {/* Available Medicine Offers from this Pharmacy */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Pill className="h-4 w-4 text-emerald-600" />
            <span>Available Medicines at this Location ({pharmacyOffers.length})</span>
          </h3>

          <button
            onClick={() => setActiveTab('compare')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Compare with other sellers</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {pharmacyOffers.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-xs text-zinc-500">
            No live inventory offers currently registered for this pharmacy.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pharmacyOffers.map((offer) => {
              const med = medicines.find((m) => m.id === offer.medicineId);
              const pack = med?.packs?.find((p) => p.packId === offer.packId);
              if (!med || !pack) return null;

              return (
                <div
                  key={offer.id}
                  className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between hover:border-emerald-500/50 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {med.name}
                      </h4>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        ₹{offer.price.toFixed(2)}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-500">Generic: {med.genericName}</p>
                    <p className="text-[11px] text-zinc-400">{pack.packLabel} · {med.strength}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400">
                      Est. delivery: {offer.deliveryEstimate}
                    </span>

                    <button
                      onClick={() => addToCart(offer, med, pack, 1)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                    >
                      Add to Cart
                    </button>
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
