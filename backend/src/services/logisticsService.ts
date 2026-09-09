import {
  CarrierName,
  CarrierServiceOption,
  CARRIER_OPTIONS,
  Coordinates,
  LiveTrackingData,
} from '../lib/logistics';
import { logger } from '../lib/logger';
import { eventBus } from '../lib/eventBus';

// Sample Bangalore city coordinates for live tracking demonstration
const DEFAULT_ORIGIN: { name: string; address: string; coords: Coordinates } = {
  name: 'Apollo Pharmacy Hub',
  address: '100ft Road, Indiranagar, Bangalore 560038',
  coords: { lat: 12.9716, lng: 77.5946 },
};

const DEFAULT_DESTINATION: { name: string; address: string; coords: Coordinates } = {
  name: 'Patient Residence',
  address: 'Sector 4, HSR Layout, Bangalore 560102',
  coords: { lat: 12.9121, lng: 77.6446 },
};

// Simulated in-memory store for tracking records
const trackingSessions = new Map<string, LiveTrackingData>();

export class LogisticsService {
  /**
   * List available 3PL delivery partners and SLA capabilities
   */
  static getCarriers(): CarrierServiceOption[] {
    return CARRIER_OPTIONS;
  }

  /**
   * Estimate shipping cost and delivery duration
   */
  static estimateShipping(
    carrierId: string,
    isColdChainRequired: boolean,
    distanceKm: number = 8.5
  ) {
    const carrier = CARRIER_OPTIONS.find((c) => c.id === carrierId) || CARRIER_OPTIONS[0];
    let rate = carrier.baseRate;

    // Add per-km surcharge beyond 5km
    if (distanceKm > 5) {
      rate += Math.round((distanceKm - 5) * 8);
    }

    if (isColdChainRequired && !carrier.coldChainCertified) {
      // Must reroute to cold chain
      const coldCarrier = CARRIER_OPTIONS.find((c) => c.coldChainCertified)!;
      return {
        carrier: coldCarrier.name,
        estimatedRate: coldCarrier.baseRate + Math.round(distanceKm * 6),
        estimatedHours: coldCarrier.estimatedHours,
        requiresSpecialHandling: true,
      };
    }

    return {
      carrier: carrier.name,
      estimatedRate: rate,
      estimatedHours: carrier.estimatedHours,
      requiresSpecialHandling: isColdChainRequired,
    };
  }

  /**
   * Dispatch an order with a 3PL logistics partner
   */
  static dispatchShipment(
    orderId: string,
    carrierName: CarrierName = 'Dunzo Express',
    destinationAddress: string = DEFAULT_DESTINATION.address
  ): LiveTrackingData {
    const trackingNumber = `TRK-${carrierName.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;

    // Generate waypoints between origin and destination
    const waypoints: Coordinates[] = [
      DEFAULT_ORIGIN.coords,
      { lat: 12.955, lng: 77.608 },
      { lat: 12.938, lng: 77.625 },
      { lat: 12.924, lng: 77.635 },
      DEFAULT_DESTINATION.coords,
    ];

    const trackingData: LiveTrackingData = {
      trackingNumber,
      carrier: carrierName,
      status: 'Out for Delivery',
      origin: DEFAULT_ORIGIN,
      destination: {
        ...DEFAULT_DESTINATION,
        address: destinationAddress,
      },
      currentLocation: waypoints[1], // Starting along the route
      driver: {
        name: 'Arun Kumar',
        phone: '+91 98450 12345',
        vehicleModel: 'Hero Electric Nyx (Cold Insulated)',
        vehiclePlate: 'KA 03 EQ 4821',
        rating: 4.9,
      },
      etaMinutes: 24,
      waypoints,
      lastUpdated: new Date().toISOString(),
    };

    trackingSessions.set(trackingNumber, trackingData);

    logger.info(`Shipment dispatched for order ${orderId}: ${trackingNumber} via ${carrierName}`, {
      module: 'LogisticsService',
      orderId,
      trackingNumber,
    });

    eventBus.publish('logistics.dispatched', {
      orderId,
      trackingNumber,
      carrier: carrierName,
    });

    return trackingData;
  }

  /**
   * Get live tracking telemetry for a tracking number (simulates movement)
   */
  static getLiveTracking(trackingNumber: string): LiveTrackingData {
    let tracking = trackingSessions.get(trackingNumber);

    if (!tracking) {
      // Auto-provision a realistic session for demo/test purposes
      tracking = this.dispatchShipment('demo-order', 'Dunzo Express');
      tracking.trackingNumber = trackingNumber;
      trackingSessions.set(trackingNumber, tracking);
    }

    // Advance driver location slightly along the route for real-time demonstration
    const now = Date.now();
    const elapsedCycles = Math.floor((now / 4000) % tracking.waypoints.length);
    tracking.currentLocation = tracking.waypoints[elapsedCycles];
    tracking.etaMinutes = Math.max(3, 25 - elapsedCycles * 5);
    tracking.status = elapsedCycles >= 3 ? 'Arriving Soon' : 'Out for Delivery';
    tracking.lastUpdated = new Date().toISOString();

    return tracking;
  }

  /**
   * Handle incoming carrier webhook
   */
  static handleCarrierWebhook(payload: {
    trackingNumber: string;
    status: string;
    eventTimestamp: string;
    carrier: string;
  }) {
    logger.info(`Carrier webhook received: ${payload.trackingNumber} → ${payload.status}`, {
      module: 'LogisticsService',
      ...payload,
    });

    const tracking = trackingSessions.get(payload.trackingNumber);
    if (tracking) {
      if (payload.status === 'DELIVERED') {
        tracking.status = 'Delivered';
        tracking.etaMinutes = 0;
      }
    }

    return { received: true, trackingNumber: payload.trackingNumber };
  }
}
