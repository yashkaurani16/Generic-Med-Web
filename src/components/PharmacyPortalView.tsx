import React, { useState } from 'react';
import {
  Building2,
  Package,
  FileCheck,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit2,
  Save,
  Layers,
  ArrowRight,
  ShieldCheck,
  Search,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OrderStatus, PrescriptionStatus } from '../types';

export const PharmacyPortalView: React.FC = () => {
  const {
    currentPharmacy,
    pharmacies,
    setActivePharmacyId,
    activePharmacyId,
    orders,
    updateOrderStatus,
    prescriptions,
    reviewPrescription,
    offers,
    medicines,
    updateOfferPrice,
    updateOfferStock,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'rx_review' | 'inventory' | 'metrics'>('orders');

  // Price edit state
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [newPriceInput, setNewPriceInput] = useState<string>('');
  const [priceReason, setPriceReason] = useState<string>('Competitive market repricing');

  // Prescription reject modal
  const [rejectModalRxId, setRejectModalRxId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('Prescription past 30-day validity window');

  // Filter orders assigned to this pharmacy store
  const partnerOrders = orders.filter((o) => o.pharmacyId === activePharmacyId);
  const pendingRxList = prescriptions.filter((p) => p.status === 'Pending Review');
  const partnerOffers = offers.filter((o) => o.pharmacyId === activePharmacyId);

  const handleSavePrice = (offerId: string) => {
    const val = parseFloat(newPriceInput);
    if (!isNaN(val) && val > 0) {
      updateOfferPrice(offerId, val, priceReason);
      setEditingOfferId(null);
      setNewPriceInput('');
    }
  };

  const handleExecuteRxReview = (rxId: string, status: PrescriptionStatus, reason?: string) => {
    const reviewerName = `Pharmacist at ${currentPharmacy?.name || 'Partner Store'}`;
    reviewPrescription(rxId, status, reviewerName, reason);
    setRejectModalRxId(null);
  };

  return (
    <div className="space-y-6">
      {/* Pharmacy Portal Banner */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 shrink-0">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
                  {currentPharmacy?.name}
                </h1>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5">
                  Verified Partner Hub
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                License: <span className="font-mono">{currentPharmacy?.licenseNumber}</span> • {currentPharmacy?.address}, {currentPharmacy?.city} • SLA Target: &lt; {currentPharmacy?.slaMinutes} mins
              </p>
            </div>
          </div>

          {/* Quick Pharmacy Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Switch Store:</span>
            <select
              value={activePharmacyId}
              onChange={(e) => setActivePharmacyId(e.target.value)}
              className="h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200"
            >
              {pharmacies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Operational Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-xs">
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
            <div className="text-zinc-500">Assigned Orders</div>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {partnerOrders.length}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
            <div className="text-zinc-500">Pending Rx Queue</div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
              {pendingRxList.length}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
            <div className="text-zinc-500">Active Live Offers</div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {partnerOffers.length}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
            <div className="text-zinc-500">Partner SLA Rating</div>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {currentPharmacy?.rating} / 5.0
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeSubTab === 'orders'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <Package className="h-4 w-4" />
          <span>Fulfillment Queue ({partnerOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('rx_review')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeSubTab === 'rx_review'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <FileCheck className="h-4 w-4" />
          <span>Prescription Clinical Review ({pendingRxList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeSubTab === 'inventory'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Inventory & Pricing Freshness ({partnerOffers.length})</span>
        </button>
      </div>

      {/* Subtab 1: Order Fulfillment Queue */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          <div className="text-xs text-zinc-500">
            Orders placed by patients where <strong>{currentPharmacy?.name}</strong> was chosen as the winning offer seller.
          </div>

          {partnerOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center text-xs text-zinc-500">
              No orders assigned to this pharmacy branch currently.
            </div>
          ) : (
            partnerOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-zinc-400">•</span>
                      <span className="text-xs text-zinc-500">{order.createdAt}</span>
                    </div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                      Patient: <strong className="text-zinc-900 dark:text-zinc-100">{order.patientName}</strong> ({order.deliveryPhone})
                    </div>
                    <div className="text-xs text-zinc-500 truncate max-w-md">
                      Address: {order.deliveryAddress}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {order.orderStatus}
                    </span>
                    <div className="text-sm font-black text-zinc-900 dark:text-zinc-100 mt-1">
                      ${order.total.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Items to pick & dispense */}
                <div className="space-y-1.5 text-xs">
                  <div className="font-bold text-zinc-500 uppercase tracking-wider text-[10px]">
                    Prescription & Packaging Checklist:
                  </div>
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
                    >
                      <div>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {item.medicineName}
                        </span>
                        <span className="text-zinc-500 ml-2">({item.packLabel})</span>
                      </div>
                      <div className="font-mono font-bold text-zinc-700 dark:text-zinc-300">
                        Qty: {item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions to advance the state machine */}
                <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                  {order.orderStatus === 'Paid' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Accepted', currentPharmacy?.name || 'Pharmacy')}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                    >
                      Accept & Verify Order
                    </button>
                  )}
                  {order.orderStatus === 'Accepted' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Packed', currentPharmacy?.name || 'Pharmacy', 'Verified tamper-proof seals applied')}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                    >
                      Mark as Packed & Sealed
                    </button>
                  )}
                  {order.orderStatus === 'Packed' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Shipped', currentPharmacy?.name || 'Pharmacy', 'Dispatched with courier rider')}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                    >
                      Hand Over to Courier (Ship)
                    </button>
                  )}
                  {order.orderStatus === 'Shipped' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'Delivered', currentPharmacy?.name || 'Pharmacy', 'Delivered and customer OTP verified')}
                      className="px-3.5 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold transition"
                    >
                      Mark Delivered (OTP Verified)
                    </button>
                  )}
                  {order.orderStatus === 'Delivered' && (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> Fulfillment Completed
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Subtab 2: Prescription Review Queue */}
      {activeSubTab === 'rx_review' && (
        <div className="space-y-4">
          <div className="text-xs text-zinc-500">
            Authorized clinical review queue. Licensed pharmacists must inspect uploaded prescriptions before fulfillment (PRD FR-VEND-04).
          </div>

          {pendingRxList.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center text-xs text-zinc-500">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
              All prescriptions in your queue have been verified! No pending reviews.
            </div>
          ) : (
            pendingRxList.map((rx) => (
              <div
                key={rx.id}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {rx.id.toUpperCase()}
                      </span>
                      <span className="text-xs text-zinc-400">•</span>
                      <span className="text-xs text-zinc-500">Uploaded {rx.uploadedAt}</span>
                    </div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                      Prescribed by {rx.doctorName}
                    </div>
                    <div className="text-xs text-zinc-500">
                      License: <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">{rx.doctorLicense}</span> • {rx.clinicHospital}
                    </div>
                  </div>

                  <span className="self-start sm:self-auto rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold px-3 py-1">
                    Pending Pharmacist Review
                  </span>
                </div>

                {/* Prescribed medicines list */}
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 text-xs space-y-2">
                  <div className="font-bold text-zinc-700 dark:text-zinc-300">
                    Prescription Content:
                  </div>
                  <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 space-y-1 font-mono">
                    {rx.prescribedMedicines.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                  {rx.diagnosisNote && (
                    <div className="pt-2 text-zinc-500 text-[11px] border-t border-zinc-200 dark:border-zinc-700">
                      <strong>Clinical Note:</strong> {rx.diagnosisNote}
                    </div>
                  )}
                </div>

                {/* Accept / Reject actions */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setRejectModalRxId(rx.id)}
                    className="px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition"
                  >
                    Reject Prescription
                  </button>
                  <button
                    onClick={() => handleExecuteRxReview(rx.id, 'Accepted')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Verify & Accept Prescription</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Subtab 3: Inventory & Pricing Freshness */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-4">
          <div className="text-xs text-zinc-500">
            Real-time price & stock updates. Price adjustments directly update the comparison engine ranking (PRD FR-VEND-02).
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {partnerOffers.map((offer) => {
                const med = medicines.find((m) => m.id === offer.medicineId);
                const pack = med?.packs.find((p) => p.packId === offer.packId);
                const isEditing = editingOfferId === offer.id;

                return (
                  <div key={offer.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {med?.name}
                        </h4>
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          {pack?.packLabel}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                        <span>Barcode: {pack?.canonicalBarcode}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Last updated: {offer.lastUpdated}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400">$</span>
                            <input
                              type="number"
                              step="0.05"
                              value={newPriceInput}
                              onChange={(e) => setNewPriceInput(e.target.value)}
                              className="w-24 h-8 pl-6 pr-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-zinc-100"
                              placeholder={offer.price.toString()}
                            />
                          </div>
                          <button
                            onClick={() => handleSavePrice(offer.id)}
                            className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition"
                          >
                            <Save className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingOfferId(null)}
                            className="p-2 text-zinc-400 hover:text-zinc-600 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-base font-black text-zinc-900 dark:text-zinc-100">
                              ${offer.price.toFixed(2)}
                            </div>
                            <div className="text-[10px] text-zinc-400">
                              Stock: {offer.inStock ? `${offer.stockQuantity} units` : 'Out of stock'}
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setEditingOfferId(offer.id);
                              setNewPriceInput(offer.price.toString());
                            }}
                            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition"
                            title="Edit Price"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => updateOfferStock(offer.id, !offer.inStock, offer.inStock ? 0 : 50)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                              offer.inStock
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            }`}
                          >
                            {offer.inStock ? 'In Stock' : 'Out of Stock'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Reject Prescription Modal */}
      {rejectModalRxId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 p-6 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Reject Prescription {rejectModalRxId.toUpperCase()}
            </h3>
            <p className="text-xs text-zinc-500">
              Per PRD Section 9.3 (FR-PRES-04), a standardized rejection reason code must be recorded and customer notified.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Reason Code:
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                >
                  <option value="Prescription past 30-day validity window">Prescription past 30-day validity window</option>
                  <option value="Doctor medical registration number invalid or missing">Doctor medical registration number invalid or missing</option>
                  <option value="Unclear / blurred document scan or illegible dosage">Unclear / blurred document scan or illegible dosage</option>
                  <option value="Controlled substance requires physical counter-signature">Controlled substance requires physical counter-signature</option>
                  <option value="Patient identity mismatch with account profile">Patient identity mismatch with account profile</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setRejectModalRxId(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleExecuteRxReview(rejectModalRxId, 'Rejected', rejectionReason)}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
