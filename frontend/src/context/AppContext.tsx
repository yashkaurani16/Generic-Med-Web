import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  UserRole,
  Medicine,
  SellerOffer,
  Prescription,
  Order,
  AuditRecord,
  SupportTicket,
  CartItem,
  PrescriptionStatus,
  OrderStatus,
  PharmacyPartner,
  UserAccount,
} from '../types';

// ─── Internal Helpers ──────────────────────────────────────────────────────

/** Typed fetch wrapper — throws on non-OK HTTP status */
async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    credentials: 'include', // Send session cookies
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    let errMsg = `API Error ${res.status}`;
    try {
      const body = await res.json();
      errMsg = body.message || body.error || errMsg;
    } catch { /* response body not JSON */ }
    throw new Error(errMsg);
  }

  return res.json() as Promise<T>;
}

// ─── Toast ────────────────────────────────────────────────────────────────

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

// ─── Context Shape ────────────────────────────────────────────────────────

interface AppContextType {
  // Loading state
  isLoadingData: boolean;

  // Authentication & User Accounts
  currentUser: UserAccount | null;
  users: UserAccount[];
  login: (email: string, password?: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  register: (accountData: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    phone?: string;
    licenseNumber?: string;
    clinicHospital?: string;
    pharmacyId?: string;
    address?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchAccount: (userId: string) => void;

  // Role & Tenant
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activePharmacyId: string;
  setActivePharmacyId: (id: string) => void;
  currentPharmacy: PharmacyPartner | undefined;
  pharmacies: PharmacyPartner[];

  // Catalog & Offers
  medicines: Medicine[];
  offers: SellerOffer[];
  getOffersForMedicinePack: (medicineId: string, packId: string) => SellerOffer[];
  getLowestComparableOffer: (medicineId: string, packId: string) => SellerOffer | undefined;
  updateOfferPrice: (offerId: string, newPrice: number, reason: string) => void;
  updateOfferStock: (offerId: string, inStock: boolean, quantity: number) => void;

  // Prescriptions
  prescriptions: Prescription[];
  uploadPrescription: (data: Partial<Prescription>) => Prescription;
  reviewPrescription: (
    prescriptionId: string,
    status: PrescriptionStatus,
    reviewer: string,
    reason?: string
  ) => void;
  getAcceptedPrescriptionsForPatient: () => Prescription[];

  // Cart & Checkout
  cart: CartItem[];
  addToCart: (offer: SellerOffer, medicine: Medicine, pack: Medicine['packs'][0], quantity?: number) => void;
  removeFromCart: (offerId: string) => void;
  updateCartQuantity: (offerId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotals: {
    subtotal: number;
    deliveryFee: number;
    tax: number;
    total: number;
    savings: number;
    hasRxRequirement: boolean;
  };
  revalidateCart: () => { isValid: boolean; message?: string };

  // Orders
  orders: Order[];
  createOrder: (orderParams: {
    paymentMethod: Order['paymentMethod'];
    deliveryAddress: string;
    deliveryPhone: string;
    prescriptionId?: string;
    notes?: string;
  }) => Order;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, actor: string, note?: string) => void;
  cancelOrder: (orderId: string, reason: string) => void;

  // Auditing & Support
  auditLogs: AuditRecord[];
  addAuditLog: (log: Omit<AuditRecord, 'id' | 'timestamp' | 'correlationId'>) => void;
  tickets: SupportTicket[];
  createSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt'>) => void;

  // Global Toast
  toasts: Toast[];
  showToast: (type: Toast['type'], title: string, message: string) => void;
  dismissToast: (id: string) => void;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedMedicineId: string | null;
  setSelectedMedicineId: (id: string | null) => void;

  // Search & filter state
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedTherapeutic: string;
  setSelectedTherapeutic: (therapeutic: string) => void;
  rxFilter: 'all' | 'rx' | 'otc';
  setRxFilter: (filter: 'all' | 'rx' | 'otc') => void;
  autoPopulateComparisonSearch: (params: {
    query: string;
    therapeutic?: string;
    medicineId?: string;
  }) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── Helper: map API user to UserAccount ──────────────────────────────────

function mapApiUser(u: any): UserAccount {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as UserRole,
    phone: u.phone,
    licenseNumber: u.licenseNumber,
    clinicHospital: u.clinicHospital,
    pharmacyId: u.pharmacyId,
    pharmacyName: u.pharmacyName,
    address: u.address,
    avatarUrl: u.avatarUrl,
    createdAt: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  };
}

// Helper: map API pharmacy to PharmacyPartner
function mapApiPharmacy(p: any): PharmacyPartner {
  return {
    id: p.id,
    name: p.name,
    licenseNumber: p.licenseNumber,
    address: p.address,
    city: p.city,
    rating: p.rating,
    reviewCount: p.reviewCount,
    slaMinutes: p.slaMinutes,
    isActive: p.isActive,
    verified: p.verified,
  };
}

// Helper: map API medicine to Medicine
function mapApiMedicine(m: any): Medicine {
  return {
    id: m.id,
    name: m.name,
    brandName: m.brandName,
    genericName: m.genericName,
    activeIngredient: m.activeIngredient,
    dosageForm: m.dosageForm,
    strength: m.strength,
    therapeuticClass: m.therapeuticClass,
    isPrescriptionRequired: m.isPrescriptionRequired,
    manufacturer: m.manufacturer,
    description: m.description,
    commonUses: m.commonUses || [],
    packs: (m.packs || []).map((pk: any) => ({
      packId: pk.id || pk.packId,
      packQuantity: pk.packQuantity,
      packUnit: pk.packUnit,
      packLabel: pk.packLabel,
      canonicalBarcode: pk.canonicalBarcode,
    })),
  };
}

// Helper: map API offer to SellerOffer
function mapApiOffer(o: any): SellerOffer {
  return {
    id: o.id,
    pharmacyId: o.pharmacyId,
    pharmacyName: o.pharmacy?.name || '',
    medicineId: o.medicineId,
    packId: o.packId,
    price: o.price,
    mrp: o.mrp,
    inStock: o.inStock,
    stockQuantity: o.stockQuantity,
    deliveryEstimate: o.deliveryEstimate,
    deliveryFee: o.deliveryFee,
    lastUpdated: o.lastUpdated ? new Date(o.lastUpdated).toLocaleDateString() : 'Recently',
    freshnessMinutesAgo: o.freshnessMinutesAgo,
    freshnessStatus: o.freshnessStatus,
    verifiedBadge: o.verifiedBadge,
  };
}

// Helper: map API prescription to Prescription
function mapApiPrescription(rx: any): Prescription {
  return {
    id: rx.id,
    patientId: rx.patientId,
    patientName: rx.patient?.name || '',
    doctorName: rx.doctorName,
    doctorLicense: rx.doctorLicense,
    clinicHospital: rx.clinicHospital,
    prescribedDate: rx.prescribedDate,
    validUntil: rx.validUntil,
    uploadedAt: rx.uploadedAt ? new Date(rx.uploadedAt).toLocaleDateString() : '',
    fileName: rx.fileName,
    fileSize: rx.fileSize,
    fileUrl: rx.fileUrl,
    status: rx.status as PrescriptionStatus,
    reviewedBy: rx.reviewedBy,
    reviewedAt: rx.reviewedAt,
    rejectionReason: rx.rejectionReason,
    prescribedMedicines: rx.prescribedMedicines || [],
    diagnosisNote: rx.diagnosisNote,
    matchedMedicineIds: rx.matchedMedicineIds || [],
  };
}

// Helper: map API order to Order
function mapApiOrder(o: any): Order {
  const paymentMethodMap: Record<string, Order['paymentMethod']> = {
    CreditDebitCard: 'Credit/Debit Card',
    UPIInstantPay: 'UPI / Instant Pay',
    NetBanking: 'NetBanking',
    CashOnDelivery: 'Cash on Delivery',
  };
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    patientId: o.patientId,
    patientName: o.patient?.name || '',
    patientEmail: o.patient?.email || '',
    deliveryAddress: o.deliveryAddress,
    deliveryPhone: o.deliveryPhone,
    pharmacyId: o.pharmacyId,
    pharmacyName: o.pharmacy?.name || '',
    items: (o.items || []).map((item: any) => ({
      medicineId: item.medicineId,
      medicineName: item.medicineName,
      genericName: item.genericName,
      packLabel: item.pack?.packLabel || item.packId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      isPrescriptionRequired: item.isPrescriptionRequired,
    })),
    subtotal: o.subtotal,
    deliveryFee: o.deliveryFee,
    tax: o.tax,
    total: o.total,
    prescriptionId: o.prescriptionId,
    paymentMethod: paymentMethodMap[o.paymentMethod] || 'UPI / Instant Pay',
    paymentStatus: o.paymentStatus,
    paymentReference: o.paymentReference,
    orderStatus: o.orderStatus as OrderStatus,
    statusHistory: (o.statusHistory || []).map((ev: any) => ({
      status: ev.status as OrderStatus,
      timestamp: ev.timestamp ? new Date(ev.timestamp).toLocaleString() : '',
      actor: ev.actor,
      note: ev.note,
    })),
    trackingNumber: o.trackingNumber,
    createdAt: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '',
    notes: o.notes,
  };
}

// Helper: map API ticket to SupportTicket
function mapApiTicket(t: any): SupportTicket {
  const categoryMap: Record<string, SupportTicket['category']> = {
    PrescriptionIssue: 'Prescription Issue',
    PriceMismatch: 'Price Mismatch',
    DeliveryDelay: 'Delivery Delay',
    RefundRequest: 'Refund Request',
    CatalogInquiry: 'Catalog Inquiry',
  };
  const statusMap: Record<string, SupportTicket['status']> = {
    Open: 'Open',
    InProgress: 'In Progress',
    Resolved: 'Resolved',
    Closed: 'Closed',
  };
  return {
    id: t.id,
    ticketNumber: t.ticketNumber,
    userId: t.userId,
    userRole: t.user?.role || 'patient',
    userName: t.user?.name || '',
    orderId: t.orderId,
    subject: t.subject,
    category: categoryMap[t.category] || 'Catalog Inquiry',
    status: statusMap[t.status] || 'Open',
    priority: t.priority,
    createdAt: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '',
    messages: (t.messages || []).map((m: any) => ({
      sender: m.sender,
      senderRole: m.senderRole,
      text: m.text,
      timestamp: m.timestamp ? new Date(m.timestamp).toLocaleString() : '',
    })),
  };
}

// Helper: map API audit to AuditRecord
function mapApiAudit(a: any): AuditRecord {
  return {
    id: a.id,
    actor: a.actorName,
    role: a.role,
    action: a.action,
    target: a.target,
    timestamp: a.timestamp ? new Date(a.timestamp).toLocaleString() : '',
    reason: a.reason,
    correlationId: a.correlationId,
    source: (a.source === 'PartnerPortal'
      ? 'Partner Portal'
      : a.source === 'AdminConsole'
      ? 'Admin Console'
      : a.source === 'AutomatedSystem'
      ? 'Automated System'
      : 'Web UI') as AuditRecord['source'],
    diff: a.diffField
      ? { field: a.diffField, before: a.diffBefore ?? '', after: a.diffAfter ?? '' }
      : undefined,
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ── Core UI state ──────────────────────────────────────────────
  const [currentRole, setCurrentRole] = useState<UserRole>('patient');
  const [activePharmacyId, setActivePharmacyId] = useState<string>('pharma-1');
  const [activeTab, setActiveTab] = useState<string>('compare');
  const [selectedMedicineId, setSelectedMedicineId] = useState<string | null>('med-1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTherapeutic, setSelectedTherapeutic] = useState<string>('all');
  const [rxFilter, setRxFilter] = useState<'all' | 'rx' | 'otc'>('all');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // ── Auth state ─────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [users, setUsers] = useState<UserAccount[]>([]);

  // ── Data state ─────────────────────────────────────────────────
  const [pharmacies, setPharmacies] = useState<PharmacyPartner[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [offers, setOffers] = useState<SellerOffer[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  // Cart persists in localStorage (client-only, no auth needed)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('genericmed_cart') : null;
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem('genericmed_cart', JSON.stringify(cart)); } catch { /* ignore */ }
  }, [cart]);

  // ── Toast Helpers ──────────────────────────────────────────────
  const showToast = useCallback((type: Toast['type'], title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── API Data Loading ───────────────────────────────────────────

  /** Load public catalog data (medicines, offers, pharmacies) — no auth required */
  const loadCatalogData = useCallback(async () => {
    try {
      const [medsRes, offersRes, pharmsRes] = await Promise.all([
        apiFetch<{ medicines: any[] }>('/api/medicines'),
        apiFetch<{ offers: any[] }>('/api/offers'),
        apiFetch<{ pharmacies: any[] }>('/api/pharmacies'),
      ]);
      setMedicines(medsRes.medicines.map(mapApiMedicine));
      setOffers(offersRes.offers.map(mapApiOffer));
      setPharmacies(pharmsRes.pharmacies.map(mapApiPharmacy));
    } catch (err: any) {
      // Catalog load failure is non-fatal — keep UI functional with empty arrays
      console.warn('Catalog load failed:', err.message);
    }
  }, []);

  /** Load authenticated user's data after login */
  const loadUserData = useCallback(async (user: UserAccount) => {
    setIsLoadingData(true);
    try {
      const promises: Promise<void>[] = [];

      // All roles get prescriptions and tickets
      promises.push(
        apiFetch<{ prescriptions: any[] }>('/api/prescriptions')
          .then(r => setPrescriptions(r.prescriptions.map(mapApiPrescription)))
          .catch(() => {}),
        apiFetch<{ tickets: any[] }>('/api/tickets')
          .then(r => setTickets(r.tickets.map(mapApiTicket)))
          .catch(() => {}),
      );

      // Patient/Admin get orders
      if (user.role === 'patient' || user.role === 'admin') {
        promises.push(
          apiFetch<{ orders: any[] }>('/api/orders')
            .then(r => setOrders(r.orders.map(mapApiOrder)))
            .catch(() => {}),
        );
      }

      // Pharmacy gets their orders too
      if (user.role === 'pharmacy') {
        promises.push(
          apiFetch<{ orders: any[] }>('/api/orders')
            .then(r => setOrders(r.orders.map(mapApiOrder)))
            .catch(() => {}),
        );
      }

      // Admin gets audit logs and all users
      if (user.role === 'admin') {
        promises.push(
          apiFetch<{ records: any[] }>('/api/audit')
            .then(r => setAuditLogs(r.records.map(mapApiAudit)))
            .catch(() => {}),
          apiFetch<{ users: any[] }>('/api/users')
            .then(r => setUsers(r.users.map(mapApiUser)))
            .catch(() => {}),
        );
      }

      await Promise.all(promises);
    } catch (err: any) {
      console.error('User data load error:', err.message);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // ── Session restore on mount ───────────────────────────────────
  useEffect(() => {
    const init = async () => {
      // Always load public catalog
      await loadCatalogData();

      // Restore session from server
      try {
        const res = await apiFetch<{ user: any }>('/api/auth/me');
        const user = mapApiUser(res.user);
        setCurrentUser(user);
        setCurrentRole(user.role);
        if (user.pharmacyId) setActivePharmacyId(user.pharmacyId);
        await loadUserData(user);
      } catch {
        // No active session — user is guest (fine, catalog is still loaded)
        setCurrentUser(null);
      }
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Authentication ────────────────────────────────────────────

  const login = async (
    email: string,
    password?: string,
    _preferredRole?: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await apiFetch<{ user: any; message: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password: password || '' }),
      });

      const user = mapApiUser(res.user);
      setCurrentUser(user);
      setCurrentRole(user.role);
      if (user.pharmacyId) setActivePharmacyId(user.pharmacyId);

      showToast('success', `Welcome back, ${user.name}!`, `Signed in as ${user.role.toUpperCase()}`);
      await loadUserData(user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Sign in failed.' };
    }
  };

  const register = async (accountData: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    phone?: string;
    licenseNumber?: string;
    clinicHospital?: string;
    pharmacyId?: string;
    address?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await apiFetch<{ user: any; message: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ ...accountData, email: accountData.email.trim().toLowerCase() }),
      });

      const user = mapApiUser(res.user);
      setCurrentUser(user);
      setCurrentRole(user.role);
      if (user.pharmacyId) setActivePharmacyId(user.pharmacyId);

      showToast('success', 'Account Created!', `Welcome to genericMed, ${user.name}.`);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed.' };
    }
  };

  const logout = useCallback(async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch { /* ignore server errors on logout */ }

    setCurrentUser(null);
    setCurrentRole('patient');
    setOrders([]);
    setPrescriptions([]);
    setTickets([]);
    setAuditLogs([]);
    setUsers([]);
    setCart([]);
    showToast('info', 'Signed Out', 'You have been safely signed out.');
  }, [showToast]);

  // switchAccount — dev helper, uses mock session switching
  const switchAccount = useCallback((userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      setCurrentRole(target.role);
      if (target.pharmacyId) setActivePharmacyId(target.pharmacyId);
      showToast('info', 'Switched Account', `Now active as ${target.name} (${target.role.toUpperCase()})`);
    }
  }, [users, showToast]);

  // ── Pharmacy helpers ──────────────────────────────────────────

  const currentPharmacy = useMemo(
    () => pharmacies.find((p) => p.id === activePharmacyId),
    [pharmacies, activePharmacyId]
  );

  // ── Catalog helpers (client-side derived) ─────────────────────

  const getOffersForMedicinePack = useCallback((medicineId: string, packId: string) => {
    return offers
      .filter((o) => o.medicineId === medicineId && o.packId === packId)
      .sort((a, b) => {
        if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
        return a.price - b.price;
      });
  }, [offers]);

  const getLowestComparableOffer = useCallback((medicineId: string, packId: string) => {
    const valid = offers.filter((o) => o.medicineId === medicineId && o.packId === packId && o.inStock);
    if (valid.length === 0) return undefined;
    return valid.reduce((prev, curr) => (curr.price < prev.price ? curr : prev));
  }, [offers]);

  const updateOfferPrice = useCallback(async (offerId: string, newPrice: number, reason: string) => {
    const existing = offers.find((o) => o.id === offerId);
    if (!existing) return;
    try {
      await apiFetch(`/api/offers/${offerId}/price`, {
        method: 'PUT',
        body: JSON.stringify({ price: newPrice, reason }),
      });
      setOffers((prev) =>
        prev.map((o) => o.id === offerId
          ? { ...o, price: newPrice, lastUpdated: 'Just now', freshnessMinutesAgo: 0, freshnessStatus: 'fresh' }
          : o
        )
      );
      showToast('success', 'Price Updated', `Offer price adjusted to ₹${newPrice.toFixed(2)}.`);
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message);
    }
  }, [offers, showToast]);

  const updateOfferStock = useCallback(async (offerId: string, inStock: boolean, quantity: number) => {
    try {
      await apiFetch(`/api/offers/${offerId}/stock`, {
        method: 'PUT',
        body: JSON.stringify({ inStock, stockQuantity: quantity }),
      });
      setOffers((prev) =>
        prev.map((o) => o.id === offerId
          ? { ...o, inStock, stockQuantity: quantity, lastUpdated: 'Just now', freshnessMinutesAgo: 0, freshnessStatus: 'fresh' }
          : o
        )
      );
      showToast('info', 'Inventory Synced', `Stock updated to ${quantity} units.`);
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message);
    }
  }, [showToast]);

  // ── Prescriptions ─────────────────────────────────────────────

  const uploadPrescription = (data: Partial<Prescription>): Prescription => {
    // Optimistic UI — add to local state immediately, sync to API in background
    const tempRx: Prescription = {
      id: `rx-temp-${Date.now()}`,
      patientId: currentUser?.id || 'usr-101',
      patientName: currentUser?.name || 'Patient',
      doctorName: data.doctorName || 'Dr. S. Kulkarni, MD',
      doctorLicense: data.doctorLicense || 'MCI-REG-981120',
      clinicHospital: data.clinicHospital || 'Metro Healthcare Polyclinic',
      prescribedDate: data.prescribedDate || new Date().toISOString().split('T')[0],
      validUntil: data.validUntil || '',
      uploadedAt: new Date().toLocaleDateString(),
      fileName: data.fileName || 'prescription_upload.pdf',
      fileSize: data.fileSize || '1.1 MB',
      fileUrl: data.fileUrl || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
      status: 'Pending Review',
      prescribedMedicines: data.prescribedMedicines || [],
      diagnosisNote: data.diagnosisNote,
      matchedMedicineIds: data.matchedMedicineIds || [],
    };

    setPrescriptions((prev) => [tempRx, ...prev]);
    showToast('success', 'Prescription Uploaded', 'Document queued for licensed pharmacist verification.');

    // Sync to API asynchronously
    apiFetch('/api/prescriptions', {
      method: 'POST',
      body: JSON.stringify({
        ...tempRx,
        fileUrl: tempRx.fileUrl,
      }),
    }).then((res: any) => {
      const persisted = mapApiPrescription(res.prescription);
      // Replace the temp ID with the real persisted ID
      setPrescriptions((prev) => prev.map((rx) => rx.id === tempRx.id ? persisted : rx));
    }).catch((err: any) => {
      console.error('Prescription persist failed:', err.message);
    });

    return tempRx;
  };

  const reviewPrescription = async (
    prescriptionId: string,
    status: PrescriptionStatus,
    reviewer: string,
    reason?: string
  ) => {
    const apiStatusMap: Record<PrescriptionStatus, string> = {
      'Pending Review': 'PendingReview',
      'Accepted': 'Accepted',
      'Rejected': 'Rejected',
      'Expired': 'Expired',
    };

    try {
      await apiFetch(`/api/prescriptions/${prescriptionId}/review`, {
        method: 'PUT',
        body: JSON.stringify({ status: apiStatusMap[status] || status, reason }),
      });
      setPrescriptions((prev) =>
        prev.map((rx) =>
          rx.id === prescriptionId
            ? { ...rx, status, reviewedBy: reviewer, reviewedAt: new Date().toLocaleString(), rejectionReason: reason }
            : rx
        )
      );
      showToast(
        status === 'Accepted' ? 'success' : 'warning',
        `Prescription ${status}`,
        status === 'Accepted'
          ? `Prescription #${prescriptionId} verified and approved.`
          : `Prescription #${prescriptionId} rejected: ${reason}`
      );
    } catch (err: any) {
      showToast('error', 'Review Failed', err.message);
    }
  };

  const getAcceptedPrescriptionsForPatient = useCallback(() => {
    return prescriptions.filter((p) => p.status === 'Accepted');
  }, [prescriptions]);

  // ── Cart ──────────────────────────────────────────────────────

  const addToCart = useCallback((
    offer: SellerOffer,
    medicine: Medicine,
    pack: Medicine['packs'][0],
    quantity: number = 1
  ) => {
    if (!offer.inStock) {
      showToast('error', 'Item Unavailable', 'This offer is currently out of stock.');
      return;
    }
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.offer.id === offer.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + quantity };
        return updated;
      }
      return [...prev, { offer, medicine, pack, quantity }];
    });
    showToast('success', 'Added to Cart', `${medicine.name} (${pack.packLabel}) added.`);
  }, [showToast]);

  const removeFromCart = useCallback((offerId: string) => {
    setCart((prev) => prev.filter((item) => item.offer.id !== offerId));
    showToast('info', 'Cart Updated', 'Item removed from your cart.');
  }, [showToast]);

  const updateCartQuantity = useCallback((offerId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(offerId); return; }
    setCart((prev) => prev.map((item) => item.offer.id === offerId ? { ...item, quantity } : item));
  }, [removeFromCart]);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotals = useMemo(() => {
    let subtotal = 0, deliveryFee = 0, mrpTotal = 0;
    let hasRxRequirement = false;

    cart.forEach((item) => {
      subtotal += item.offer.price * item.quantity;
      mrpTotal += item.offer.mrp * item.quantity;
      if (item.medicine.isPrescriptionRequired) hasRxRequirement = true;
    });

    if (cart.length > 0) {
      deliveryFee = Math.max(...cart.map((i) => i.offer.deliveryFee), 1.0);
    }

    const tax = +(subtotal * 0.05).toFixed(2);
    const total = +(subtotal + deliveryFee + tax).toFixed(2);
    const savings = Math.max(0, +(mrpTotal - subtotal).toFixed(2));

    return { subtotal: +subtotal.toFixed(2), deliveryFee: +deliveryFee.toFixed(2), tax, total, savings, hasRxRequirement };
  }, [cart]);

  const revalidateCart = useCallback((): { isValid: boolean; message?: string } => {
    if (cart.length === 0) return { isValid: false, message: 'Your cart is empty.' };
    for (const item of cart) {
      const freshOffer = offers.find((o) => o.id === item.offer.id);
      if (!freshOffer || !freshOffer.inStock) {
        return { isValid: false, message: `${item.medicine.name} from ${item.offer.pharmacyName} is now out of stock.` };
      }
    }
    return { isValid: true };
  }, [cart, offers]);

  // ── Orders ───────────────────────────────────────────────────

  const createOrder = (orderParams: {
    paymentMethod: Order['paymentMethod'];
    deliveryAddress: string;
    deliveryPhone: string;
    prescriptionId?: string;
    notes?: string;
  }): Order => {
    // Optimistic order — built from cart state to immediately show success screen
    const pmMap: Record<Order['paymentMethod'], string> = {
      'Credit/Debit Card': 'CreditDebitCard',
      'UPI / Instant Pay': 'UPIInstantPay',
      'NetBanking': 'NetBanking',
      'Cash on Delivery': 'CashOnDelivery',
    };

    const primarySeller = cart[0]?.offer.pharmacyName || 'CarePoint Pharmacy';
    const primarySellerId = cart[0]?.offer.pharmacyId || 'pharma-1';
    const orderNum = `GM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toLocaleDateString();

    const tempOrder: Order = {
      id: `ord-temp-${Date.now()}`,
      orderNumber: orderNum,
      patientId: currentUser?.id || 'usr-101',
      patientName: currentUser?.name || 'Patient',
      patientEmail: currentUser?.email || '',
      deliveryAddress: orderParams.deliveryAddress,
      deliveryPhone: orderParams.deliveryPhone,
      pharmacyId: primarySellerId,
      pharmacyName: primarySeller,
      items: cart.map((item) => ({
        medicineId: item.medicine.id,
        medicineName: item.medicine.name,
        genericName: item.medicine.genericName,
        packLabel: item.pack.packLabel,
        quantity: item.quantity,
        unitPrice: item.offer.price,
        totalPrice: +(item.offer.price * item.quantity).toFixed(2),
        isPrescriptionRequired: item.medicine.isPrescriptionRequired,
      })),
      subtotal: cartTotals.subtotal,
      deliveryFee: cartTotals.deliveryFee,
      tax: cartTotals.tax,
      total: cartTotals.total,
      prescriptionId: orderParams.prescriptionId,
      notes: orderParams.notes,
      paymentMethod: orderParams.paymentMethod,
      paymentStatus: 'Success',
      paymentReference: `PAY-REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      orderStatus: 'Paid',
      trackingNumber: `TRK-${primarySellerId.toUpperCase().slice(0, 4)}-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: now,
      statusHistory: [
        { status: 'Created', timestamp: now, actor: currentUser?.name || 'Patient' },
        { status: 'Paid', timestamp: now, actor: `Payment Gateway (${orderParams.paymentMethod})` },
      ],
    };

    setOrders((prev) => [tempOrder, ...prev]);
    clearCart();
    showToast('success', 'Order Confirmed!', `Order ${orderNum} placed successfully.`);

    // Persist to API asynchronously
    apiFetch<{ order: any }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: cart.map((item) => ({
          medicineId: item.medicine.id,
          packId: item.pack.packId,
          offerId: item.offer.id,
          quantity: item.quantity,
        })),
        deliveryAddress: orderParams.deliveryAddress,
        deliveryPhone: orderParams.deliveryPhone,
        paymentMethod: pmMap[orderParams.paymentMethod],
        prescriptionId: orderParams.prescriptionId,
      }),
    }).then((res) => {
      const persisted = mapApiOrder(res.order);
      setOrders((prev) => prev.map((o) => o.id === tempOrder.id ? persisted : o));
    }).catch((err: any) => {
      console.error('Order persist failed:', err.message);
    });

    return tempOrder;
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus,
    actor: string,
    note?: string
  ) => {
    try {
      await apiFetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus, note }),
      });
      const now = new Date().toLocaleString();
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                orderStatus: newStatus,
                statusHistory: [...order.statusHistory, { status: newStatus, timestamp: now, actor, note }],
              }
            : order
        )
      );
      showToast('info', 'Fulfillment Updated', `Order status progressed to "${newStatus}".`);
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message);
    }
  };

  const cancelOrder = useCallback((orderId: string, reason: string) => {
    updateOrderStatus(orderId, 'Cancelled', currentUser?.name || 'User', reason);
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Audit Logs ───────────────────────────────────────────────

  const addAuditLog = useCallback((log: Omit<AuditRecord, 'id' | 'timestamp' | 'correlationId'>) => {
    // Client-side optimistic audit for immediate UI updates
    // Real audit records are created server-side by API routes
    const now = new Date();
    const newRecord: AuditRecord = {
      ...log,
      id: `aud-${Date.now().toString(36)}`,
      timestamp: now.toLocaleString(),
      correlationId: `req-${Math.random().toString(36).substring(2, 9)}`,
    };
    setAuditLogs((prev) => [newRecord, ...prev]);
  }, []);

  // ── Support Tickets ──────────────────────────────────────────

  const createSupportTicket = async (ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt'>) => {
    const categoryApiMap: Record<SupportTicket['category'], string> = {
      'Prescription Issue': 'PrescriptionIssue',
      'Price Mismatch': 'PriceMismatch',
      'Delivery Delay': 'DeliveryDelay',
      'Refund Request': 'RefundRequest',
      'Catalog Inquiry': 'CatalogInquiry',
    };

    try {
      const res = await apiFetch<{ ticket: any; message: string }>('/api/tickets', {
        method: 'POST',
        body: JSON.stringify({
          subject: ticket.subject,
          category: categoryApiMap[ticket.category],
          priority: ticket.priority,
          orderId: ticket.orderId,
          message: ticket.messages[0]?.text || ticket.subject,
        }),
      });
      setTickets((prev) => [mapApiTicket(res.ticket), ...prev]);
      showToast('success', 'Support Ticket Created', `Reference ID: ${res.ticket.ticketNumber}`);
    } catch (err: any) {
      // Fallback: optimistic local ticket
      const fallback: SupportTicket = {
        ...ticket,
        id: `tkt-${Date.now().toString(36)}`,
        ticketNumber: `CASE-${Math.floor(10000 + Math.random() * 90000)}`,
        createdAt: 'Just now',
      };
      setTickets((prev) => [fallback, ...prev]);
      showToast('warning', 'Ticket Created (Offline)', `Saved locally — will sync when connection is restored.`);
    }
  };

  // ── Search helpers ────────────────────────────────────────────

  const autoPopulateComparisonSearch = useCallback(({
    query, therapeutic, medicineId,
  }: { query: string; therapeutic?: string; medicineId?: string }) => {
    setSearchQuery(query);
    if (therapeutic && therapeutic !== 'all') setSelectedTherapeutic(therapeutic);
    if (medicineId) setSelectedMedicineId(medicineId);
    setActiveTab('compare');
    showToast('success', 'Search Auto-Populated', `Auto-matched "${query}" from prescription analysis.`);
  }, [showToast]);

  // ── Context Value ─────────────────────────────────────────────

  return (
    <AppContext.Provider
      value={{
        isLoadingData,
        currentUser,
        users,
        login,
        register,
        logout,
        switchAccount,
        currentRole,
        setCurrentRole,
        activePharmacyId,
        setActivePharmacyId,
        currentPharmacy,
        pharmacies,
        medicines,
        offers,
        getOffersForMedicinePack,
        getLowestComparableOffer,
        updateOfferPrice,
        updateOfferStock,
        prescriptions,
        uploadPrescription,
        reviewPrescription,
        getAcceptedPrescriptionsForPatient,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotals,
        revalidateCart,
        orders,
        createOrder,
        updateOrderStatus,
        cancelOrder,
        auditLogs,
        addAuditLog,
        tickets,
        createSupportTicket,
        toasts,
        showToast,
        dismissToast,
        activeTab,
        setActiveTab,
        selectedMedicineId,
        setSelectedMedicineId,
        searchQuery,
        setSearchQuery,
        selectedTherapeutic,
        setSelectedTherapeutic,
        rxFilter,
        setRxFilter,
        autoPopulateComparisonSearch,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
