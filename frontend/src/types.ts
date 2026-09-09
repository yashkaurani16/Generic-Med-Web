export type UserRole = 'patient' | 'pharmacy' | 'admin' | 'doctor';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  licenseNumber?: string;
  clinicHospital?: string;
  pharmacyId?: string;
  pharmacyName?: string;
  address?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface MedicinePack {
  packId: string;
  packQuantity: number;
  packUnit: string; // e.g., "Tablets", "Capsules", "ml Bottle"
  packLabel: string; // e.g. "Pack of 10 Tablets", "Pack of 30 Tablets"
  canonicalBarcode: string;
}

export interface Medicine {
  id: string;
  name: string;
  brandName: string;
  genericName: string;
  activeIngredient: string;
  dosageForm: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Ointment' | 'Inhaler';
  strength: string; // e.g., "10 mg", "20 mg", "500 mg"
  therapeuticClass: string;
  isPrescriptionRequired: boolean;
  manufacturer: string;
  description: string;
  commonUses: string[];
  packs: MedicinePack[];
}

export interface PharmacyPartner {
  id: string;
  name: string;
  licenseNumber: string;
  address: string;
  city: string;
  rating: number;
  reviewCount: number;
  slaMinutes: number;
  isActive: boolean;
  verified: boolean;
}

export type FreshnessStatus = 'fresh' | 'warning' | 'stale';

export interface SellerOffer {
  id: string;
  pharmacyId: string;
  pharmacyName: string;
  medicineId: string;
  packId: string;
  price: number;
  mrp: number; // Maximum Retail Price
  inStock: boolean;
  stockQuantity: number;
  deliveryEstimate: string; // e.g. "Within 2 hrs", "Today by 6 PM", "Tomorrow"
  deliveryFee: number;
  lastUpdated: string; // ISO or human string
  freshnessMinutesAgo: number;
  freshnessStatus: FreshnessStatus;
  verifiedBadge: boolean;
}

export type PrescriptionStatus = 'Pending Review' | 'Accepted' | 'Rejected' | 'Expired';

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  doctorLicense: string;
  clinicHospital: string;
  prescribedDate: string;
  validUntil: string;
  uploadedAt: string;
  fileName: string;
  fileSize: string;
  fileUrl: string;
  status: PrescriptionStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  prescribedMedicines: string[];
  diagnosisNote?: string;
  matchedMedicineIds?: string[];
}

export interface CartItem {
  offer: SellerOffer;
  medicine: Medicine;
  pack: MedicinePack;
  quantity: number;
}

export type OrderStatus =
  | 'Created'
  | 'Paid'
  | 'Accepted'
  | 'Packed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded';

export type PaymentStatus = 'Initiated' | 'Pending' | 'Success' | 'Failed' | 'Refunded';

export interface OrderStatusEvent {
  status: OrderStatus;
  timestamp: string;
  actor: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  deliveryAddress: string;
  deliveryPhone: string;
  pharmacyId: string;
  pharmacyName: string;
  items: {
    medicineId: string;
    medicineName: string;
    genericName: string;
    packLabel: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    isPrescriptionRequired: boolean;
  }[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  prescriptionId?: string;
  prescriptionStatus?: PrescriptionStatus;
  paymentMethod: 'Credit/Debit Card' | 'UPI / Instant Pay' | 'NetBanking' | 'Cash on Delivery';
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  orderStatus: OrderStatus;
  statusHistory: OrderStatusEvent[];
  trackingNumber?: string;
  createdAt: string;
  notes?: string;
}

export interface AuditRecord {
  id: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  timestamp: string;
  reason?: string;
  correlationId: string;
  source: 'Web UI' | 'Partner Portal' | 'Admin Console' | 'Automated System';
  diff?: {
    field: string;
    before: string | number;
    after: string | number;
  };
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userRole: UserRole;
  userName: string;
  orderId?: string;
  subject: string;
  category: 'Prescription Issue' | 'Price Mismatch' | 'Delivery Delay' | 'Refund Request' | 'Catalog Inquiry';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  createdAt: string;
  messages: {
    sender: string;
    senderRole: string;
    text: string;
    timestamp: string;
  }[];
}

export interface ExtractedPrescriptionMedicine {
  name: string;
  genericName: string;
  strength: string;
  dosageForm: string;
  frequency: string;
  searchQuery: string;
  therapeuticClass?: string;
  confidenceScore: number;
  matchedMedicineId?: string;
  matchedMedicineName?: string;
}

export interface PrescriptionAnalysisResult {
  doctorName: string;
  doctorLicense: string;
  clinicHospital: string;
  patientName?: string;
  diagnosisNote?: string;
  rawExtractedText: string;
  medicines: ExtractedPrescriptionMedicine[];
  analysisTimestamp: string;
  modelUsed: string;
}

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

