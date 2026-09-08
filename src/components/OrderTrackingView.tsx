import React, { useState } from 'react';
import {
  PackageCheck,
  Clock,
  CheckCircle2,
  Truck,
  Building2,
  XCircle,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  FileText,
  User,
  ExternalLink,
  Download,
  FileDown,
  Receipt,
  FileSpreadsheet,
  Check,
  Printer,
  Sparkles,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import {
  generateOrderInsuranceReceipt,
  generateOrderHistoryStatement,
  InsuranceDetails,
} from '../utils/pdfGenerator';

export const OrderTrackingView: React.FC = () => {
  const {
    orders,
    cancelOrder,
    createSupportTicket,
    setActiveTab,
    pharmacies,
    prescriptions,
    showToast,
    addAuditLog,
  } = useApp();

  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportCategory, setSupportCategory] = useState<
    'Delivery Delay' | 'Prescription Issue' | 'Price Mismatch' | 'Refund Request'
  >('Delivery Delay');
  const [supportSubject, setSupportSubject] = useState('');

  // Insurance Modal State
  const [insuranceModalOpen, setInsuranceModalOpen] = useState(false);
  const [insuranceInfo, setInsuranceInfo] = useState<InsuranceDetails>({
    providerName: 'Blue Cross Blue Shield',
    policyNumber: 'POL-BCBS-994218',
    memberId: 'MEM-88214',
    groupNumber: 'GRP-TECH-500',
  });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const activeOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];
  const activePharmacy = pharmacies.find((p) => p.id === activeOrder?.pharmacyId);
  const activePrescription = prescriptions.find((p) => p.id === activeOrder?.prescriptionId);

  const steps: { status: OrderStatus; label: string; icon: any }[] = [
    { status: 'Paid', label: 'Payment Confirmed', icon: CheckCircle2 },
    { status: 'Accepted', label: 'Pharmacy Accepted', icon: Building2 },
    { status: 'Packed', label: 'Packed & Sealed', icon: PackageCheck },
    { status: 'Shipped', label: 'Out for Delivery', icon: Truck },
    { status: 'Delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  const getStepIndex = (currentStatus: OrderStatus) => {
    switch (currentStatus) {
      case 'Created':
        return 0;
      case 'Paid':
        return 1;
      case 'Accepted':
        return 2;
      case 'Packed':
        return 3;
      case 'Shipped':
        return 4;
      case 'Delivered':
        return 5;
      case 'Cancelled':
      case 'Refunded':
        return -1;
      default:
        return 1;
    }
  };

  const handleExecuteCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModalOrder || !cancelReason.trim()) return;
    cancelOrder(cancelModalOrder.id, cancelReason);
    setCancelModalOrder(null);
    setCancelReason('');
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportSubject.trim()) return;

    createSupportTicket({
      userId: 'usr-101',
      userRole: 'patient',
      userName: 'Yash Kaurani',
      orderId: activeOrder?.id,
      category: supportCategory,
      subject: supportSubject,
      status: 'Open',
      priority: 'Medium',
      messages: [
        {
          sender: 'Yash Kaurani',
          senderRole: 'patient',
          text: supportSubject,
          timestamp: 'Just now',
        },
      ],
    });

    setSupportModalOpen(false);
    setSupportSubject('');
  };

  // Download Individual Order Receipt as formatted PDF
  const handleDownloadSingleReceipt = (orderToDownload: Order = activeOrder) => {
    if (!orderToDownload) return;
    setIsGeneratingPdf(true);

    try {
      const pharmacyObj = pharmacies.find((p) => p.id === orderToDownload.pharmacyId);
      const prescriptionObj = prescriptions.find((p) => p.id === orderToDownload.prescriptionId);

      const doc = generateOrderInsuranceReceipt(
        orderToDownload,
        pharmacyObj,
        prescriptionObj,
        insuranceInfo
      );

      doc.save(`genericMed_Insurance_Receipt_${orderToDownload.orderNumber}.pdf`);

      showToast(
        'success',
        'Official PDF Receipt Generated',
        `Insurance claim receipt for ${orderToDownload.orderNumber} saved to your device.`
      );

      addAuditLog({
        actor: 'Yash Kaurani (Patient)',
        role: 'patient',
        action: 'DOWNLOAD_INSURANCE_RECEIPT',
        target: `Order ${orderToDownload.orderNumber}`,
        reason: 'Exported official PDF receipt for medical insurance claim reimbursement',
        source: 'Web UI',
      });
    } catch (err) {
      console.error('Error generating PDF receipt:', err);
      showToast('error', 'PDF Generation Failed', 'Could not generate insurance claim document.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Download Full Order History Statement as formatted PDF
  const handleDownloadHistoryStatement = () => {
    if (orders.length === 0) return;
    setIsGeneratingPdf(true);

    try {
      const doc = generateOrderHistoryStatement(
        orders,
        'Yash Kaurani',
        insuranceInfo,
        'Annual Year-To-Date (2026)'
      );

      doc.save(`genericMed_Insurance_Claims_Statement_2026.pdf`);

      showToast(
        'success',
        'Annual Claims Statement Generated',
        `Downloaded formatted PDF ledger covering all ${orders.length} medication orders.`
      );

      addAuditLog({
        actor: 'Yash Kaurani (Patient)',
        role: 'patient',
        action: 'DOWNLOAD_INSURANCE_STATEMENT',
        target: 'All Orders History',
        reason: 'Consolidated annual prescription expenditure statement exported for insurance filing',
        source: 'Web UI',
      });
    } catch (err) {
      console.error('Error generating statement PDF:', err);
      showToast('error', 'PDF Generation Failed', 'Could not generate consolidated statement.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <PackageCheck className="mx-auto h-12 w-12 text-zinc-400" />
        <h3 className="mt-3 text-base font-bold text-zinc-900 dark:text-zinc-100">No orders yet</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Find and compare verified medicine offers to place your first order.
        </p>
        <button
          onClick={() => setActiveTab('compare')}
          className="mt-5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
        >
          Compare Medicine Prices
        </button>
      </div>
    );
  }

  const activeIndex = getStepIndex(activeOrder?.orderStatus || 'Created');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <PackageCheck className="h-4 w-4" />
            <span>Fulfillment State Machine & Claims Vault (PRD 9.5 & 11.1)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Order Tracking & History
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-500">
            Real-time fulfillment milestone tracker connected with participating pharmacy dispensing hubs.
          </p>
        </div>

        {/* Action Group: PDF Insurance Downloads & Support */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="download-history-statement-btn"
            onClick={handleDownloadHistoryStatement}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
            title="Download full history statement formatted for insurance reimbursement"
          >
            <FileDown className="h-4 w-4" />
            <span>Download Claims Statement (PDF)</span>
          </button>

          <button
            id="open-insurance-settings-btn"
            onClick={() => setInsuranceModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
            title="Configure Insurance Provider & Policy details for PDF printing"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Insurance Claim Details</span>
          </button>

          <button
            onClick={() => setSupportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
          >
            <HelpCircle className="h-3.5 w-3.5 text-zinc-400" />
            <span>Help</span>
          </button>
        </div>
      </div>

      {/* Insurance Compliance Notice Banner */}
      <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-200">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            <strong>Insurance Claim Ready:</strong> All pharmacy receipts and consolidated statements feature certified drug license numbers, doctor registration codes, itemized GST tax breakdowns, and pharmacist validation seals.
          </span>
        </div>
        <button
          onClick={() => setInsuranceModalOpen(true)}
          className="text-emerald-700 dark:text-emerald-300 font-bold hover:underline shrink-0 text-[11px]"
        >
          Edit Policy ({insuranceInfo.providerName}) →
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Orders Selector Column */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Your Purchases ({orders.length})
            </div>
            <button
              onClick={handleDownloadHistoryStatement}
              className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Download className="h-3 w-3" />
              <span>Export All (PDF)</span>
            </button>
          </div>

          <div className="space-y-2">
            {orders.map((order) => {
              const isSelected = order.id === activeOrder?.id;
              return (
                <div
                  key={order.id}
                  className={`group relative w-full p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <button
                    onClick={() => setSelectedOrderId(order.id)}
                    className="w-full text-left focus:outline-none"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          order.orderStatus === 'Delivered'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : order.orderStatus === 'Cancelled'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>

                    <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300 font-medium truncate">
                      {order.items.map((i) => i.medicineName).join(', ')}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
                      <span>{order.pharmacyName}</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </button>

                  {/* Direct PDF Download Action Button on item */}
                  <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400 text-[10px]">Claim eligible: ${order.total.toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadSingleReceipt(order);
                      }}
                      className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-semibold px-2 py-0.5 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                      title="Download PDF Receipt for this specific order"
                    >
                      <Download className="h-3 w-3" />
                      <span>PDF Receipt</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Order Detailed Tracking View */}
        {activeOrder && (
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs">
              {/* Order Meta Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                      {activeOrder.orderNumber}
                    </span>
                    <span className="text-zinc-400">•</span>
                    <span className="text-xs text-zinc-500">Placed on {activeOrder.createdAt}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                    <span>
                      Seller Pharmacy: <strong className="text-zinc-900 dark:text-zinc-100">{activeOrder.pharmacyName}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-2">
                  <div className="text-left sm:text-right">
                    <div className="text-xs text-zinc-500">Total Payable Amount</div>
                    <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                      ${activeOrder.total.toFixed(2)}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      Paid via {activeOrder.paymentMethod}
                    </div>
                  </div>

                  {/* Primary PDF Download Action */}
                  <button
                    id="download-order-receipt-pdf-btn"
                    onClick={() => handleDownloadSingleReceipt(activeOrder)}
                    disabled={isGeneratingPdf}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold shadow-xs transition"
                  >
                    <Download className="h-3.5 w-3.5 text-emerald-400 dark:text-emerald-600" />
                    <span>Download Insurance Receipt (PDF)</span>
                  </button>
                </div>
              </div>

              {/* Insurance Metadata Quick-Badge */}
              <div className="mt-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Insurance Reimbursement Ready:
                    </span>{' '}
                    <span className="text-zinc-500">
                      Eligible: <strong>${activeOrder.total.toFixed(2)}</strong> under Outpatient Prescription Benefits.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setInsuranceModalOpen(true)}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                  >
                    Custom Policy ({insuranceInfo.providerName})
                  </button>
                </div>
              </div>

              {/* Visual State Machine Stepper */}
              <div className="py-6">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4">
                  Fulfillment Status Tracker
                </div>

                {activeOrder.orderStatus === 'Cancelled' ? (
                  <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-200 flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-rose-600 shrink-0" />
                    <div>
                      <div className="font-bold">Order Cancelled</div>
                      <p className="mt-0.5 text-zinc-500 dark:text-zinc-400">
                        Refund processed to original payment method ({activeOrder.paymentMethod}). Reference: {activeOrder.paymentReference}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="grid grid-cols-5 gap-2 text-center">
                      {steps.map((step, idx) => {
                        const isDone = activeIndex >= idx + 1;
                        const isCurrent = activeIndex === idx + 1;
                        const StepIcon = step.icon;

                        return (
                          <div key={step.status} className="flex flex-col items-center">
                            <div
                              className={`h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all ${
                                isDone
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : isCurrent
                                  ? 'bg-white dark:bg-zinc-800 border-emerald-500 text-emerald-600 dark:text-emerald-400 animate-pulse'
                                  : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400'
                              }`}
                            >
                              <StepIcon className="h-4 w-4" />
                            </div>
                            <div className="mt-2 text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                              {step.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
                  Dispensed Items & Charges
                </div>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {activeOrder.items.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-zinc-900 dark:text-zinc-100">
                          {item.medicineName}
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          {item.packLabel} • Qty: {item.quantity} • {item.isPrescriptionRequired ? 'Prescription Required' : 'Over-The-Counter'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100">
                          ${item.totalPrice.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          (${item.unitPrice.toFixed(2)} each)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal / Tax breakdown */}
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex justify-between">
                    <span>Items Subtotal:</span>
                    <span>${activeOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pharmacy Cold-Chain / Delivery:</span>
                    <span>${activeOrder.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Healthcare GST (5%):</span>
                    <span>${activeOrder.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-zinc-900 dark:text-zinc-100 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                    <span>Total Paid:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">${activeOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Status Change History / Audit Trail */}
              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                  Fulfillment Event Timeline (Auditable)
                </div>
                <div className="space-y-2">
                  {activeOrder.statusHistory.map((hist, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800"
                    >
                      <div>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">
                          Status updated to {hist.status}
                        </span>
                        <div className="text-[10px] text-zinc-500">Actor: {hist.actor}</div>
                        {hist.note && (
                          <div className="text-[10px] text-zinc-600 dark:text-zinc-400 mt-0.5">
                            Note: {hist.note}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">{hist.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadSingleReceipt(activeOrder)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition"
                  >
                    <Download className="h-3.5 w-3.5 text-emerald-600" />
                    <span>PDF Claim Receipt</span>
                  </button>

                  <button
                    onClick={() => setInsuranceModalOpen(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Claim Options</span>
                  </button>
                </div>

                {/* Cancel if eligible */}
                {(activeOrder.orderStatus === 'Created' || activeOrder.orderStatus === 'Paid') && (
                  <button
                    onClick={() => setCancelModalOrder(activeOrder)}
                    className="px-3.5 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Insurance Claims & PDF Export Modal */}
      {insuranceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 p-6 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span>HEALTH INSURANCE CLAIM REIMBURSEMENT</span>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                  Download Insurance Documents
                </h3>
                <p className="text-xs text-zinc-500">
                  Configure insurance provider and policy details to print directly onto formatted medical receipts and claim summaries.
                </p>
              </div>
              <button
                onClick={() => setInsuranceModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Health Insurance Provider:
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {[
                    'Blue Cross Blue Shield',
                    'UnitedHealthcare',
                    'Aetna Health',
                    'Cigna Healthcare',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setInsuranceInfo({ ...insuranceInfo, providerName: preset })}
                      className={`p-2 rounded-lg border text-left font-medium transition ${
                        insuranceInfo.providerName === preset
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or enter custom insurance provider..."
                  value={insuranceInfo.providerName}
                  onChange={(e) => setInsuranceInfo({ ...insuranceInfo, providerName: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Policy / Member ID:
                  </label>
                  <input
                    type="text"
                    value={insuranceInfo.policyNumber}
                    onChange={(e) => setInsuranceInfo({ ...insuranceInfo, policyNumber: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Group / Employer #:
                  </label>
                  <input
                    type="text"
                    value={insuranceInfo.groupNumber || ''}
                    onChange={(e) => setInsuranceInfo({ ...insuranceInfo, groupNumber: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Regulatory features included */}
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-1 text-[11px] text-zinc-600 dark:text-zinc-400">
                <div className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                  Standard Medical Documentation Included on PDF:
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-emerald-600" />
                  <span>Verified Dispensing Pharmacy Drug License # & GSTIN Tax ID</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-emerald-600" />
                  <span>Doctor Registration & Hospital Clinical Accreditation Details</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-emerald-600" />
                  <span>Itemized NDC/Chemical formulations, pack sizes & unit cost reconciliation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-emerald-600" />
                  <span>Registered Pharmacist Verification Seal & Outpatient Claim Checklist</span>
                </div>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setInsuranceModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Close
              </button>

              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleDownloadSingleReceipt(activeOrder);
                    setInsuranceModalOpen(false);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold transition"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Receipt ({activeOrder?.orderNumber})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleDownloadHistoryStatement();
                    setInsuranceModalOpen(false);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  <span>Full History Statement (PDF)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 p-6 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Cancel Order {cancelModalOrder.orderNumber}?
            </h3>
            <p className="text-xs text-zinc-500">
              Per genericMed cancellation policy (FR-ORDER-05), cancelling before packaging initiates an automatic full refund.
            </p>

            <form onSubmit={handleExecuteCancel} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Reason for Cancellation:
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  required
                  className="w-full h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                >
                  <option value="">Select a reason...</option>
                  <option value="Bought alternate medication locally">Bought alternate medication locally</option>
                  <option value="Changed delivery address">Changed delivery address</option>
                  <option value="Accidental duplicate order">Accidental duplicate order</option>
                  <option value="Doctor revised prescription">Doctor revised prescription</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOrder(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={!cancelReason}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold disabled:opacity-50"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Support Ticket Modal */}
      {supportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 p-6 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Raise Support Case (PRD FR-SUP-01)
            </h3>
            <p className="text-xs text-zinc-500">
              Our operations and pharmacy care team will respond within the SLA window.
            </p>

            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Issue Category:
                </label>
                <select
                  value={supportCategory}
                  onChange={(e) => setSupportCategory(e.target.value as any)}
                  className="w-full h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                >
                  <option value="Delivery Delay">Delivery Delay</option>
                  <option value="Prescription Issue">Prescription Issue</option>
                  <option value="Price Mismatch">Price Mismatch</option>
                  <option value="Refund Request">Refund Request</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Describe the Issue:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide context regarding your medicine order or pharmacy fulfillment..."
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSupportModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
