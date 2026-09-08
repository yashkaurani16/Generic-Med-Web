import React, { createContext, useContext, useState, useEffect } from 'react';
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
import {
  INITIAL_MEDICINES,
  INITIAL_PHARMACIES,
  INITIAL_OFFERS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_ORDERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_TICKETS,
  INITIAL_USERS,
} from '../data/mockData';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface AppContextType {
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

  // Active view tab navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedMedicineId: string | null;
  setSelectedMedicineId: (id: string | null) => void;

  // Medicine Search & Filter state (auto-populated by AI prescription visual analysis)
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

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State Initialization
  const [currentRole, setCurrentRole] = useState<UserRole>('patient');
  const [activePharmacyId, setActivePharmacyId] = useState<string>('pharma-1');
  const [pharmacies] = useState<PharmacyPartner[]>(INITIAL_PHARMACIES);
  const [medicines, setMedicines] = useState<Medicine[]>(INITIAL_MEDICINES);
  const [offers, setOffers] = useState<SellerOffer[]>(INITIAL_OFFERS);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(INITIAL_PRESCRIPTIONS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>(INITIAL_AUDIT_LOGS);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeTab, setActiveTab] = useState<string>('compare');
  const [selectedMedicineId, setSelectedMedicineId] = useState<string | null>('med-1');

  // Authentication State
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('genericmed_users') : null;
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('genericmed_current_user') : null;
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_USERS[0]; // Default logged-in patient
  });

  useEffect(() => {
    try {
      localStorage.setItem('genericmed_users', JSON.stringify(users));
    } catch (e) {
      // ignore
    }
  }, [users]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('genericmed_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('genericmed_current_user');
      }
    } catch (e) {
      // ignore
    }
  }, [currentUser]);

  // Search and filter state for Medicine Comparison View
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTherapeutic, setSelectedTherapeutic] = useState<string>('all');
  const [rxFilter, setRxFilter] = useState<'all' | 'rx' | 'otc'>('all');

  const autoPopulateComparisonSearch = ({
    query,
    therapeutic,
    medicineId,
  }: {
    query: string;
    therapeutic?: string;
    medicineId?: string;
  }) => {
    setSearchQuery(query);
    if (therapeutic && therapeutic !== 'all') {
      setSelectedTherapeutic(therapeutic);
    }
    if (medicineId) {
      setSelectedMedicineId(medicineId);
    }
    setActiveTab('compare');
    showToast(
      'success',
      'Search Auto-Populated',
      `Auto-matched "${query}" from prescription visual analysis. Comparing seller prices now.`
    );
    addAuditLog({
      actor: 'AI Clinical Vision (Gemini)',
      role: 'System/AI',
      action: 'AUTO_POPULATE_SEARCH_FROM_PRESCRIPTION',
      target: query,
      reason: 'Auto-populated medicine comparison search fields based on extracted prescription image',
      source: 'Automated System',
    });
  };

  // Load / Save cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('genericmed_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch {
      // safe fallback
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('genericmed_cart', JSON.stringify(cart));
    } catch {
      // safe fallback
    }
  }, [cart]);

  // Toast Helper
  const showToast = (type: Toast['type'], title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Audit Log Helper
  const addAuditLog = (log: Omit<AuditRecord, 'id' | 'timestamp' | 'correlationId'>) => {
    const now = new Date();
    const timeString = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newRecord: AuditRecord = {
      ...log,
      id: `aud-${Date.now().toString(36)}`,
      timestamp: timeString,
      correlationId: `req-${Math.random().toString(36).substring(2, 9)}`,
    };
    setAuditLogs((prev) => [newRecord, ...prev]);
  };

  // Authentication Handlers
  const login = async (email: string, _password?: string, preferredRole?: UserRole): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Please provide your email address.' };
    }

    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      setCurrentUser(existing);
      setCurrentRole(existing.role);
      if (existing.pharmacyId) {
        setActivePharmacyId(existing.pharmacyId);
      }
      addAuditLog({
        actor: existing.name,
        role: existing.role === 'pharmacy' ? 'Pharmacy Partner' : existing.role === 'admin' ? 'Admin / Operations' : existing.role === 'doctor' ? 'Doctor / Prescriber' : 'Patient / Consumer',
        action: 'USER_LOGIN_SUCCESS',
        target: existing.email,
        source: 'Web UI',
        reason: 'User authenticated successfully.',
      });
      showToast('success', `Welcome back, ${existing.name}!`, `Authenticated as ${existing.role.toUpperCase()}`);
      return { success: true };
    }

    // If new email submitted during login, auto-provision account gracefully
    const namePart = cleanEmail.split('@')[0].replace(/[._]/g, ' ');
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const role: UserRole = preferredRole || 'patient';
    const newUser: UserAccount = {
      id: `usr-${Date.now().toString(36)}`,
      name: formattedName || 'Verified Member',
      email: cleanEmail,
      role,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    setCurrentRole(role);
    addAuditLog({
      actor: newUser.name,
      role: role === 'pharmacy' ? 'Pharmacy Partner' : role === 'admin' ? 'Admin / Operations' : role === 'doctor' ? 'Doctor / Prescriber' : 'Patient / Consumer',
      action: 'USER_PROVISION_LOGIN',
      target: newUser.email,
      source: 'Web UI',
      reason: 'Instant verification credential issue.',
    });
    showToast('success', `Welcome to genericMed, ${newUser.name}!`, `Account created as ${role.toUpperCase()}`);
    return { success: true };
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
    const cleanEmail = accountData.email.trim().toLowerCase();
    const cleanName = accountData.name.trim();

    if (!cleanName) {
      return { success: false, error: 'Full name is required.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'A valid email address is required.' };
    }

    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return {
        success: false,
        error: 'An account with this email already exists. Please sign in instead.',
      };
    }

    let pharmacyName: string | undefined;
    if (accountData.pharmacyId) {
      const p = pharmacies.find((ph) => ph.id === accountData.pharmacyId);
      if (p) pharmacyName = p.name;
    }

    const newUser: UserAccount = {
      id: `usr-${Date.now().toString(36)}`,
      name: cleanName,
      email: cleanEmail,
      role: accountData.role,
      phone: accountData.phone,
      licenseNumber: accountData.licenseNumber,
      clinicHospital: accountData.clinicHospital,
      pharmacyId: accountData.pharmacyId,
      pharmacyName,
      address: accountData.address,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    setCurrentRole(newUser.role);
    if (newUser.pharmacyId) {
      setActivePharmacyId(newUser.pharmacyId);
    }

    addAuditLog({
      actor: newUser.name,
      role: newUser.role === 'pharmacy' ? 'Pharmacy Partner' : newUser.role === 'admin' ? 'Admin / Operations' : newUser.role === 'doctor' ? 'Doctor / Prescriber' : 'Patient / Consumer',
      action: 'USER_REGISTER_SUCCESS',
      target: newUser.email,
      source: 'Web UI',
      reason: `New ${newUser.role} profile registered and verified.`,
    });

    showToast('success', `Account Created!`, `Welcome to genericMed, ${newUser.name}.`);
    return { success: true };
  };

  const logout = () => {
    if (currentUser) {
      addAuditLog({
        actor: currentUser.name,
        role: currentUser.role === 'pharmacy' ? 'Pharmacy Partner' : currentUser.role === 'admin' ? 'Admin / Operations' : currentUser.role === 'doctor' ? 'Doctor / Prescriber' : 'Patient / Consumer',
        action: 'USER_LOGOUT',
        target: currentUser.email,
        source: 'Web UI',
        reason: 'User initiated session sign out.',
      });
    }
    setCurrentUser(null);
    showToast('info', 'Signed Out', 'You have been safely signed out.');
  };

  const switchAccount = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      setCurrentRole(target.role);
      if (target.pharmacyId) {
        setActivePharmacyId(target.pharmacyId);
      }
      showToast('info', `Switched Account`, `Now active as ${target.name} (${target.role.toUpperCase()})`);
    }
  };

  // Helper to find current pharmacy partner
  const currentPharmacy = pharmacies.find((p) => p.id === activePharmacyId);

  // Get offers for specific medicine and pack with freshness checks
  const getOffersForMedicinePack = (medicineId: string, packId: string) => {
    return offers
      .filter((o) => o.medicineId === medicineId && o.packId === packId)
      .sort((a, b) => {
        // Freshness-aware sorting: in-stock first, then price ascending
        if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
        return a.price - b.price;
      });
  };

  // Calculate lowest comparable price
  const getLowestComparableOffer = (medicineId: string, packId: string) => {
    const validOffers = offers.filter(
      (o) => o.medicineId === medicineId && o.packId === packId && o.inStock
    );
    if (validOffers.length === 0) return undefined;
    return validOffers.reduce((prev, curr) => (curr.price < prev.price ? curr : prev));
  };

  // Pharmacy partner modifies price
  const updateOfferPrice = (offerId: string, newPrice: number, reason: string) => {
    const existing = offers.find((o) => o.id === offerId);
    if (!existing) return;
    const oldPrice = existing.price;

    setOffers((prev) =>
      prev.map((o) =>
        o.id === offerId
          ? {
              ...o,
              price: newPrice,
              lastUpdated: 'Just now',
              freshnessMinutesAgo: 0,
              freshnessStatus: 'fresh',
            }
          : o
      )
    );

    addAuditLog({
      actor: currentPharmacy?.name || 'Pharmacy Partner',
      role: 'Pharmacy Operator',
      action: 'OFFER_PRICE_CHANGED',
      target: `Offer #${offerId}`,
      source: 'Partner Portal',
      reason,
      diff: {
        field: 'price',
        before: oldPrice,
        after: newPrice,
      },
    });

    showToast('success', 'Price Updated', `Offer price adjusted from $${oldPrice.toFixed(2)} to $${newPrice.toFixed(2)}.`);
  };

  // Pharmacy partner modifies stock
  const updateOfferStock = (offerId: string, inStock: boolean, quantity: number) => {
    setOffers((prev) =>
      prev.map((o) =>
        o.id === offerId
          ? {
              ...o,
              inStock,
              stockQuantity: quantity,
              lastUpdated: 'Just now',
              freshnessMinutesAgo: 0,
              freshnessStatus: 'fresh',
            }
          : o
      )
    );

    addAuditLog({
      actor: currentPharmacy?.name || 'Pharmacy Partner',
      role: 'Pharmacy Operator',
      action: 'OFFER_STOCK_CHANGED',
      target: `Offer #${offerId}`,
      source: 'Partner Portal',
      reason: 'Inventory stock sync adjustment',
      diff: {
        field: 'stockQuantity',
        before: inStock ? 'In Stock' : 'Out of Stock',
        after: `${quantity} units (${inStock ? 'Available' : 'Unavailable'})`,
      },
    });

    showToast('info', 'Inventory Synced', `Stock updated to ${quantity} units.`);
  };

  // Upload Prescription
  const uploadPrescription = (data: Partial<Prescription>): Prescription => {
    const now = new Date();
    const timeString = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newRx: Prescription = {
      id: `rx-${Math.floor(100 + Math.random() * 900)}`,
      patientId: 'usr-101',
      patientName: 'Yash Kaurani',
      doctorName: data.doctorName || 'Dr. S. Kulkarni, MD',
      doctorLicense: data.doctorLicense || 'MCI-REG-981120',
      clinicHospital: data.clinicHospital || 'Metro Healthcare Polyclinic',
      prescribedDate: data.prescribedDate || new Date().toISOString().split('T')[0],
      validUntil: data.validUntil || '2026-11-30',
      uploadedAt: timeString,
      fileName: data.fileName || 'prescription_upload.pdf',
      fileSize: data.fileSize || '1.1 MB',
      fileUrl:
        data.fileUrl ||
        'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
      status: 'Pending Review',
      prescribedMedicines: data.prescribedMedicines || ['Atorvastatin 10mg Tablets', 'Metformin 500mg'],
      diagnosisNote: data.diagnosisNote || 'Routine cardiac preventive & lipid therapy',
      matchedMedicineIds: data.matchedMedicineIds || ['med-1', 'med-2'],
    };

    setPrescriptions((prev) => [newRx, ...prev]);

    addAuditLog({
      actor: 'Yash Kaurani',
      role: 'Patient',
      action: 'PRESCRIPTION_UPLOADED',
      target: `Prescription #${newRx.id}`,
      source: 'Web UI',
      reason: 'Patient submitted digital prescription for clinical review before purchase.',
    });

    showToast(
      'success',
      'Prescription Uploaded',
      'Document queued for licensed pharmacist verification. You will be notified once reviewed.'
    );

    return newRx;
  };

  // Review Prescription (Accept/Reject)
  const reviewPrescription = (
    prescriptionId: string,
    status: PrescriptionStatus,
    reviewer: string,
    reason?: string
  ) => {
    setPrescriptions((prev) =>
      prev.map((rx) => {
        if (rx.id === prescriptionId) {
          const now = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
          return {
            ...rx,
            status,
            reviewedBy: reviewer,
            reviewedAt: now,
            rejectionReason: reason,
          };
        }
        return rx;
      })
    );

    addAuditLog({
      actor: reviewer,
      role: 'Pharmacy Reviewer',
      action: status === 'Accepted' ? 'PRESCRIPTION_ACCEPTED' : 'PRESCRIPTION_REJECTED',
      target: `Prescription #${prescriptionId}`,
      source: 'Partner Portal',
      reason: reason || (status === 'Accepted' ? 'Doctor credentials and dosage matched' : 'Compliance criteria unmet'),
      diff: {
        field: 'status',
        before: 'Pending Review',
        after: status,
      },
    });

    showToast(
      status === 'Accepted' ? 'success' : 'warning',
      `Prescription ${status}`,
      status === 'Accepted'
        ? `Prescription #${prescriptionId} has been verified and approved.`
        : `Prescription #${prescriptionId} rejected: ${reason}`
    );
  };

  const getAcceptedPrescriptionsForPatient = () => {
    return prescriptions.filter((p) => p.status === 'Accepted');
  };

  // Cart operations
  const addToCart = (
    offer: SellerOffer,
    medicine: Medicine,
    pack: Medicine['packs'][0],
    quantity: number = 1
  ) => {
    if (!offer.inStock) {
      showToast('error', 'Item Unavailable', 'This seller offer is currently out of stock.');
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.offer.id === offer.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { offer, medicine, pack, quantity }];
    });

    showToast('success', 'Added to Cart', `${medicine.name} (${pack.packLabel}) added.`);
  };

  const removeFromCart = (offerId: string) => {
    setCart((prev) => prev.filter((item) => item.offer.id !== offerId));
    showToast('info', 'Cart Updated', 'Item removed from your cart.');
  };

  const updateCartQuantity = (offerId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(offerId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.offer.id === offerId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Cart totals calculation with transparent fees breakdown (PRD Section 9.5 & FR-ORDER-03)
  const cartTotals = React.useMemo(() => {
    let subtotal = 0;
    let deliveryFee = 0;
    let mrpTotal = 0;
    let hasRxRequirement = false;

    // Track distinct pharmacies in cart to calculate realistic logistics
    const sellerIds = new Set<string>();

    cart.forEach((item) => {
      subtotal += item.offer.price * item.quantity;
      mrpTotal += item.offer.mrp * item.quantity;
      sellerIds.add(item.offer.pharmacyId);
      if (item.medicine.isPrescriptionRequired) {
        hasRxRequirement = true;
      }
    });

    // Delivery fee is max fee per pharmacy group (or free if empty)
    if (cart.length > 0) {
      deliveryFee = Math.max(...cart.map((i) => i.offer.deliveryFee), 1.0);
    }

    const tax = +(subtotal * 0.05).toFixed(2); // 5% healthcare VAT / GST
    const total = +(subtotal + deliveryFee + tax).toFixed(2);
    const savings = +(mrpTotal - subtotal).toFixed(2);

    return {
      subtotal: +subtotal.toFixed(2),
      deliveryFee: +deliveryFee.toFixed(2),
      tax,
      total,
      savings: Math.max(0, savings),
      hasRxRequirement,
    };
  }, [cart]);

  // Revalidate cart before order placement (PRD FR-ORDER-02)
  const revalidateCart = (): { isValid: boolean; message?: string } => {
    if (cart.length === 0) {
      return { isValid: false, message: 'Your cart is empty.' };
    }

    for (const item of cart) {
      // Check stock
      const freshOffer = offers.find((o) => o.id === item.offer.id);
      if (!freshOffer || !freshOffer.inStock) {
        return {
          isValid: false,
          message: `${item.medicine.name} from ${item.offer.pharmacyName} is now out of stock.`,
        };
      }
    }

    return { isValid: true };
  };

  // Order Creation (PRD FR-ORDER-01..06 & FR-PAY-01)
  const createOrder = (orderParams: {
    paymentMethod: Order['paymentMethod'];
    deliveryAddress: string;
    deliveryPhone: string;
    prescriptionId?: string;
  }): Order => {
    const primarySeller = cart[0]?.offer.pharmacyName || 'CarePoint Pharmacy';
    const primarySellerId = cart[0]?.offer.pharmacyId || 'pharma-1';

    const orderNum = `GM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const timeString = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newOrder: Order = {
      id: `ord-${Date.now().toString(36)}`,
      orderNumber: orderNum,
      patientId: 'usr-101',
      patientName: 'Yash Kaurani',
      patientEmail: 'yashkaurani@gmail.com',
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
      prescriptionStatus: orderParams.prescriptionId ? 'Accepted' : undefined,
      paymentMethod: orderParams.paymentMethod,
      paymentStatus: 'Success',
      paymentReference: `PAY-REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      orderStatus: 'Paid',
      trackingNumber: `TRK-${primarySellerId.toUpperCase().slice(0, 4)}-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: timeString,
      statusHistory: [
        { status: 'Created', timestamp: timeString, actor: 'Yash Kaurani (Patient)' },
        { status: 'Paid', timestamp: timeString, actor: `Payment Gateway (${orderParams.paymentMethod})` },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();

    addAuditLog({
      actor: 'Yash Kaurani',
      role: 'Patient',
      action: 'ORDER_PLACED_AND_PAID',
      target: `Order #${newOrder.orderNumber}`,
      source: 'Web UI',
      reason: `Patient completed checkout for $${newOrder.total.toFixed(2)} via ${orderParams.paymentMethod}`,
    });

    showToast('success', 'Order Confirmed!', `Order ${newOrder.orderNumber} placed successfully.`);
    return newOrder;
  };

  // Advance Order Fulfillment State
  const updateOrderStatus = (
    orderId: string,
    newStatus: OrderStatus,
    actor: string,
    note?: string
  ) => {
    const now = new Date();
    const timeString = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    let orderNum = '';

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          orderNum = order.orderNumber;
          return {
            ...order,
            orderStatus: newStatus,
            statusHistory: [
              ...order.statusHistory,
              {
                status: newStatus,
                timestamp: timeString,
                actor,
                note,
              },
            ],
          };
        }
        return order;
      })
    );

    addAuditLog({
      actor,
      role: currentRole === 'pharmacy' ? 'Pharmacy Partner' : 'Admin / Operations',
      action: 'ORDER_FULFILLMENT_STATE_CHANGED',
      target: `Order #${orderNum || orderId}`,
      source: currentRole === 'pharmacy' ? 'Partner Portal' : 'Admin Console',
      reason: note || `State transitioned to ${newStatus}`,
      diff: {
        field: 'orderStatus',
        before: 'Previous',
        after: newStatus,
      },
    });

    showToast('info', 'Fulfillment Updated', `Order status progressed to "${newStatus}".`);
  };

  // Cancel order
  const cancelOrder = (orderId: string, reason: string) => {
    updateOrderStatus(orderId, 'Cancelled', 'User Requested', reason);
  };

  // Support ticket creation
  const createSupportTicket = (ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt'>) => {
    const newTkt: SupportTicket = {
      ...ticket,
      id: `tkt-${Date.now().toString(36)}`,
      ticketNumber: `CASE-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: 'Just now',
    };
    setTickets((prev) => [newTkt, ...prev]);
    showToast('success', 'Support Ticket Created', `Reference ID: ${newTkt.ticketNumber}`);
  };

  return (
    <AppContext.Provider
      value={{
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
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
