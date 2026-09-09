export type CarrierName = 'Dunzo Express' | 'Shiprocket' | 'Shadowfax ColdChain';

export interface CarrierServiceOption {
  id: string;
  name: CarrierName;
  serviceType: 'Hyperlocal 2-Hour' | 'Standard Intercity' | 'Cold-Chain Sensitive';
  estimatedHours: number;
  baseRate: number;
  available: boolean;
  coldChainCertified: boolean;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DriverInfo {
  name: string;
  phone: string;
  vehicleModel: string;
  vehiclePlate: string;
  rating: number;
  photoUrl?: string;
}

export interface LiveTrackingData {
  trackingNumber: string;
  carrier: CarrierName;
  status: 'Dispatched' | 'Driver Assigned' | 'Out for Delivery' | 'Arriving Soon' | 'Delivered';
  origin: {
    name: string;
    address: string;
    coords: Coordinates;
  };
  destination: {
    name: string;
    address: string;
    coords: Coordinates;
  };
  currentLocation: Coordinates;
  driver: DriverInfo;
  etaMinutes: number;
  waypoints: Coordinates[];
  lastUpdated: string;
}

export const CARRIER_OPTIONS: CarrierServiceOption[] = [
  {
    id: 'carrier-dunzo',
    name: 'Dunzo Express',
    serviceType: 'Hyperlocal 2-Hour',
    estimatedHours: 2,
    baseRate: 49,
    available: true,
    coldChainCertified: false,
  },
  {
    id: 'carrier-shiprocket',
    name: 'Shiprocket',
    serviceType: 'Standard Intercity',
    estimatedHours: 24,
    baseRate: 29,
    available: true,
    coldChainCertified: false,
  },
  {
    id: 'carrier-shadowfax',
    name: 'Shadowfax ColdChain',
    serviceType: 'Cold-Chain Sensitive',
    estimatedHours: 4,
    baseRate: 89,
    available: true,
    coldChainCertified: true,
  },
];
