import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Lock,
  FileText,
  Truck,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';

interface CartCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartCheckoutDrawer: React.FC<CartCheckoutDrawerProps> = ({ isOpen, onClose }) => {
  const {
    cart,
    cartTotals,
    updateCartQuantity,
    removeFromCart,
    revalidateCart,
    createOrder,
    prescriptions,
    setActiveTab,
  } = useApp();

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'payment' | 'success'>('cart');
  const [deliveryAddress, setDeliveryAddress] = useState('Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103');
  const [deliveryPhone, setDeliveryPhone] = useState('+91 98765 43210');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<Order['paymentMethod']>('UPI / Instant Pay');
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Accepted prescriptions available to link
  const acceptedRxList = prescriptions.filter((p) => p.status === 'Accepted');

  // Auto select first accepted Rx if available
  React.useEffect(() => {
    if (acceptedRxList.length > 0 && !selectedPrescriptionId) {
      setSelectedPrescriptionId(acceptedRxList[0].id);
    }
  }, [acceptedRxList, selectedPrescriptionId]);

  if (!isOpen) return null;

  const handleProceedToShipping = () => {
    const check = revalidateCart();
    if (!check.isValid) {
      alert(check.message || 'Cart validation failed.');
      return;
    }

    if (cartTotals.hasRxRequirement && acceptedRxList.length === 0) {
      // Missing accepted prescription!
      setCheckoutStep('shipping');
    } else {
      setCheckoutStep('shipping');
    }
  };

  const handleExecutePayment = () => {
    setIsProcessingPayment(true);

    setTimeout(() => {
      const order = createOrder({
        deliveryAddress,
        deliveryPhone,
        paymentMethod: selectedPaymentMethod,
        prescriptionId: cartTotals.hasRxRequirement ? selectedPrescriptionId : undefined,
      });

      setIsProcessingPayment(false);
      setConfirmedOrder(order);
      setCheckoutStep('success');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col justify-between border-l border-zinc-200 dark:border-zinc-800 transition-transform duration-300"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {checkoutStep === 'cart' && `Your Cart (${cart.reduce((acc, i) => acc + i.quantity, 0)} items)`}
              {checkoutStep === 'shipping' && 'Delivery & Prescription Verification'}
              {checkoutStep === 'payment' && 'Select Payment Method'}
              {checkoutStep === 'success' && 'Order Confirmed!'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {checkoutStep === 'cart' && (
            <>
              {cart.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h4 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Your cart is empty</h4>
                  <p className="mt-1 text-xs text-zinc-500 max-w-xs mx-auto">
                    Compare prices across partner pharmacies to find the lowest cost for your medications.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      setActiveTab('compare');
                    }}
                    className="mt-6 px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold"
                  >
                    Explore Medicines
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.offer.id}
                      className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <Building2 className="h-3 w-3" />
                            <span>Fulfilled by {item.offer.pharmacyName}</span>
                          </div>
                          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                            {item.medicine.name}
                          </h4>
                          <div className="text-xs text-zinc-500">
                            {item.pack.packLabel} • {item.medicine.strength}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                            ${(item.offer.price * item.quantity).toFixed(2)}
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            ${item.offer.price.toFixed(2)} each
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
                        {item.medicine.isPrescriptionRequired ? (
                          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <Lock className="h-3 w-3" /> Rx Required
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            OTC Item
                          </span>
                        )}

                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800">
                            <button
                              onClick={() => updateCartQuantity(item.offer.id, item.quantity - 1)}
                              className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(item.offer.id, item.quantity + 1)}
                              className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.offer.id)}
                            className="p-1.5 text-zinc-400 hover:text-rose-600 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Savings callout banner */}
                  {cartTotals.savings > 0 && (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                      <span className="flex items-center gap-1 font-medium">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        Total Savings vs. Brand Name MRP:
                      </span>
                      <strong className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                        ${cartTotals.savings.toFixed(2)}
                      </strong>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {checkoutStep === 'shipping' && (
            <div className="space-y-5">
              {/* Prescription verification gate */}
              {cartTotals.hasRxRequirement && (
                <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/80 bg-amber-50/60 dark:bg-amber-950/30 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs">
                    <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span>Prescription Verification Required</span>
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    Your cart contains prescription-required medications. Select a verified prescription from your vault or upload a new one.
                  </p>

                  {acceptedRxList.length > 0 ? (
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                        Select Verified Prescription:
                      </label>
                      {acceptedRxList.map((rx) => (
                        <label
                          key={rx.id}
                          className={`flex items-center justify-between p-3 rounded-lg border text-xs cursor-pointer ${
                            selectedPrescriptionId === rx.id
                              ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 font-semibold'
                              : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="prescription"
                              checked={selectedPrescriptionId === rx.id}
                              onChange={() => setSelectedPrescriptionId(rx.id)}
                              className="text-emerald-600 focus:ring-emerald-500"
                            />
                            <div>
                              <div>{rx.doctorName}</div>
                              <div className="text-[10px] text-zinc-500">
                                {rx.clinicHospital} • Valid until {rx.validUntil}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded font-bold">
                            Verified
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-xs text-rose-900 dark:text-rose-200 flex flex-col gap-2">
                      <span>No active accepted prescription found in your account!</span>
                      <button
                        onClick={() => {
                          onClose();
                          setActiveTab('prescriptions');
                        }}
                        className="font-bold underline text-left"
                      >
                        Upload Prescription Now
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Delivery Address
                </label>
                <textarea
                  rows={3}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  value={deliveryPhone}
                  onChange={(e) => setDeliveryPhone(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
            </div>
          )}

          {checkoutStep === 'payment' && (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Choose Payment Method
              </div>

              {[
                { id: 'UPI / Instant Pay', desc: 'Google Pay, PhonePe, Paytm, QR Code', icon: Sparkles },
                { id: 'Credit/Debit Card', desc: 'Visa, Mastercard, RuPay, Amex', icon: CreditCard },
                { id: 'NetBanking', desc: 'HDFC, ICICI, SBI, Axis Bank', icon: Building2 },
                { id: 'Cash on Delivery', desc: 'Pay cash or card on package arrival', icon: Truck },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedPaymentMethod(method.id as any)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition ${
                    selectedPaymentMethod === method.id
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 font-semibold'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <method.icon className="h-4 w-4 text-zinc-500" />
                    <div>
                      <div className="text-xs text-zinc-900 dark:text-zinc-100">{method.id}</div>
                      <div className="text-[10px] text-zinc-500">{method.desc}</div>
                    </div>
                  </div>
                  {selectedPaymentMethod === method.id && (
                    <Check className="h-4 w-4 text-emerald-600" />
                  )}
                </button>
              ))}

              <div className="mt-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 text-[11px] text-zinc-500 flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>256-Bit Encrypted Payment Simulation with Idempotency Token Guarantee</span>
              </div>
            </div>
          )}

          {checkoutStep === 'success' && confirmedOrder && (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Order Successfully Placed
                </span>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                  {confirmedOrder.orderNumber}
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Assigned to <strong className="text-zinc-800 dark:text-zinc-200">{confirmedOrder.pharmacyName}</strong> for dispensing.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Tracking Number:</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    {confirmedOrder.trackingNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total Paid:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    ${confirmedOrder.total.toFixed(2)} ({confirmedOrder.paymentMethod})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Delivery To:</span>
                  <span className="text-zinc-800 dark:text-zinc-200 truncate max-w-[220px]">
                    {confirmedOrder.deliveryAddress}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-2">
                <button
                  onClick={() => {
                    onClose();
                    setActiveTab('orders');
                  }}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-xs"
                >
                  View Order Live Tracking
                </button>
                <button
                  onClick={() => {
                    onClose();
                    setActiveTab('compare');
                  }}
                  className="w-full py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer with Price Breakdown and Progression */}
        {checkoutStep !== 'success' && cart.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-3">
            {/* Transparent Fees Breakdown (PRD FR-CORE-05 & FR-ORDER-03) */}
            <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex justify-between">
                <span>Medicine Subtotal:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  ${cartTotals.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Pharmacy Express Delivery:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  ${cartTotals.deliveryFee.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Healthcare Tax (5% GST):</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  ${cartTotals.tax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800 text-sm font-black text-zinc-900 dark:text-zinc-100">
                <span>Total Payable:</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  ${cartTotals.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Step navigation buttons */}
            {checkoutStep === 'cart' && (
              <button
                onClick={handleProceedToShipping}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
              >
                <span>Proceed to Delivery & Verification</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {checkoutStep === 'shipping' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setCheckoutStep('cart')}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  Back to Cart
                </button>
                <button
                  disabled={cartTotals.hasRxRequirement && !selectedPrescriptionId}
                  onClick={() => setCheckoutStep('payment')}
                  className="flex-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {checkoutStep === 'payment' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setCheckoutStep('shipping')}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  Back
                </button>
                <button
                  disabled={isProcessingPayment}
                  onClick={handleExecutePayment}
                  className="flex-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
                >
                  {isProcessingPayment ? (
                    <span>Authorizing Payment...</span>
                  ) : (
                    <span>Pay ${cartTotals.total.toFixed(2)} & Place Order</span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
