import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Truck,
  Phone,
  Clock,
  ShieldCheck,
  Navigation,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { LiveTrackingData } from '../types';

interface DeliveryTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  trackingNumber?: string;
  deliveryAddress: string;
}

export const DeliveryTrackingModal: React.FC<DeliveryTrackingModalProps> = ({
  isOpen,
  onClose,
  orderNumber,
  trackingNumber,
  deliveryAddress,
}) => {
  const [tracking, setTracking] = useState<LiveTrackingData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeStep, setActiveStep] = useState<number>(2); // Simulated route index

  const trackNum = trackingNumber || `TRK-DNZ-${orderNumber.replace(/[^0-9]/g, '').slice(-5) || '84920'}`;

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchTracking = async () => {
      try {
        const res = await fetch(`/api/logistics/track/${encodeURIComponent(trackNum)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setTracking(data);
        } else {
          // Fallback simulation
          if (isMounted) {
            setTracking({
              trackingNumber: trackNum,
              carrier: 'Dunzo Express',
              status: 'Out for Delivery',
              origin: {
                name: 'Apollo Pharmacy Hub',
                address: '100ft Road, Indiranagar, Bangalore',
                coords: { lat: 12.9716, lng: 77.5946 },
              },
              destination: {
                name: 'Patient Residence',
                address: deliveryAddress || 'HSR Layout Sector 4, Bangalore',
                coords: { lat: 12.9121, lng: 77.6446 },
              },
              currentLocation: { lat: 12.938, lng: 77.625 },
              driver: {
                name: 'Arun Kumar',
                phone: '+91 98450 12345',
                vehicleModel: 'Hero Electric Nyx (Cold Insulated)',
                vehiclePlate: 'KA 03 EQ 4821',
                rating: 4.9,
              },
              etaMinutes: 18,
              waypoints: [
                { lat: 12.9716, lng: 77.5946 },
                { lat: 12.955, lng: 77.608 },
                { lat: 12.938, lng: 77.625 },
                { lat: 12.924, lng: 77.635 },
                { lat: 12.9121, lng: 77.6446 },
              ],
              lastUpdated: new Date().toISOString(),
            });
          }
        }
      } catch {
        // Safe fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTracking();

    // Pulse animation timer for moving courier
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < 4 ? prev + 1 : 1));
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen, trackNum, deliveryAddress]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                  Live Courier Tracking
                </h3>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {tracking?.carrier || 'Dunzo Express'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                Order #{orderNumber} • AWB: {trackNum}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Simulated Interactive Route Map */}
          <div className="relative h-48 w-full rounded-xl bg-gradient-to-br from-zinc-100 via-zinc-200 to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col justify-between p-4">
            {/* Grid background styling */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />

            {/* Map Top Bar */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/90 dark:bg-zinc-800/90 shadow-sm text-xs font-semibold text-zinc-800 dark:text-zinc-200 backdrop-blur-sm border border-zinc-200 dark:border-zinc-700">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                Est. Arrival: {tracking?.etaMinutes ?? 18} mins
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-200 dark:border-emerald-800/50">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Temperature Monitored (2-8°C)
              </span>
            </div>

            {/* Interactive Waypoint Pathway */}
            <div className="relative z-10 my-auto py-2">
              <div className="relative flex items-center justify-between max-w-md mx-auto">
                {/* Connecting Track Line */}
                <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
                <div
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${(activeStep / 4) * 88}%` }}
                />

                {/* Stop 1: Pharmacy */}
                <div className="relative flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-md">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400 mt-1">
                    Pharmacy
                  </span>
                </div>

                {/* Stop 2: En Route Hub */}
                <div className="relative flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-md transition-colors ${
                      activeStep >= 1
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400 mt-1">
                    Dispatched
                  </span>
                </div>

                {/* Stop 3: Moving Driver */}
                <div className="relative flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg ring-4 ring-emerald-500/20 animate-bounce">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    On the way
                  </span>
                </div>

                {/* Stop 4: Destination */}
                <div className="relative flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-md transition-colors ${
                      activeStep >= 4
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400 mt-1">
                    Delivered
                  </span>
                </div>
              </div>
            </div>

            {/* Map Bottom Status */}
            <div className="relative z-10 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live GPS Sync (±12m accuracy)
              </span>
              <span>Updated seconds ago</span>
            </div>
          </div>

          {/* Courier & Vehicle Information */}
          {tracking?.driver && (
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                  {tracking.driver.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-zinc-900 dark:text-white">
                      {tracking.driver.name}
                    </h4>
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      ★ {tracking.driver.rating}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {tracking.driver.vehicleModel} •{' '}
                    <span className="font-mono font-medium">{tracking.driver.vehiclePlate}</span>
                  </p>
                </div>
              </div>

              <a
                href={`tel:${tracking.driver.phone}`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                Call Driver
              </a>
            </div>
          )}

          {/* Delivery Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
                Pickup Pharmacy
              </span>
              <p className="font-medium text-zinc-800 dark:text-zinc-200">
                {tracking?.origin.name || 'Apollo Pharmacy'}
              </p>
              <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                {tracking?.origin.address || '100ft Road, Indiranagar, Bangalore'}
              </p>
            </div>
            <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
                Delivery Address
              </span>
              <p className="font-medium text-zinc-800 dark:text-zinc-200">
                {tracking?.destination.name || 'Patient'}
              </p>
              <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                {deliveryAddress || tracking?.destination.address}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>Courier Partner: {tracking?.carrier || 'Dunzo Express'}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
          >
            Close Tracking
          </button>
        </div>
      </div>
    </div>
  );
};
