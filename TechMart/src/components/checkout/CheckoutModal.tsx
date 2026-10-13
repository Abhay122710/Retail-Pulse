import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { PaymentChannel, TechMartTransaction } from '../../types';
import { 
  X, 
  CheckCircle2, 
  Truck, 
  CreditCard, 
  ShieldCheck, 
  Smartphone, 
  Building2, 
  Wallet, 
  DollarSign, 
  Zap,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PAYMENT_CHANNELS: Array<{ id: PaymentChannel; label: string; icon: any; desc: string }> = [
  { id: 'UPI', label: 'UPI / QR Code', icon: Smartphone, desc: 'Google Pay, PhonePe, Paytm, BHIM' },
  { id: 'Card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay, Amex' },
  { id: 'Net Banking', label: 'Net Banking', icon: Building2, desc: 'HDFC, ICICI, SBI, Axis, Kotak' },
  { id: 'Cash on Delivery', label: 'Cash on Delivery', icon: DollarSign, desc: 'Pay cash upon courier delivery' },
  { id: 'Wallet', label: 'TechMart Wallet', icon: Wallet, desc: 'Instant 1-click checkout balance' }
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cart, activeUser, createCheckoutOrder } = useApp();

  const [step, setStep] = useState<number>(1);
  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel>('UPI');
  
  // Form State
  const [customerName, setCustomerName] = useState(activeUser.full_name);
  const [customerEmail, setCustomerEmail] = useState(activeUser.email_address);
  const [customerPhone, setCustomerPhone] = useState(activeUser.mobile_number);
  
  const [deliveryCity, setDeliveryCity] = useState(activeUser.city);
  const [deliveryState, setDeliveryState] = useState(activeUser.state);
  const [postalCode, setPostalCode] = useState(activeUser.postal_code);

  const [createdOrder, setCreatedOrder] = useState<TechMartTransaction | null>(null);

  if (!isOpen) return null;

  // Calculate Cart Totals
  const grossValue = cart.reduce((sum, item) => sum + item.product.unit_price * item.units, 0);
  const discountValue = cart.reduce((sum, item) => {
    const disc = item.product.discount_percent
      ? Math.round((item.product.unit_price * item.product.discount_percent) / 100)
      : 0;
    return sum + disc * item.units;
  }, 0);

  const taxValue = Math.round((grossValue - discountValue) * 0.18);
  const shippingValue = grossValue > 50000 ? 0 : 150;
  const netValue = grossValue - discountValue + taxValue + shippingValue;

  const handleCompleteOrder = () => {
    const order = createCheckoutOrder(selectedChannel, deliveryCity, deliveryState);
    setCreatedOrder(order);
    setStep(4);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">TechMart Multi-Step Checkout</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">1</span>
            <span>Customer</span>
          </div>
          <div className="w-8 h-px bg-slate-800" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">2</span>
            <span>Delivery</span>
          </div>
          <div className="w-8 h-px bg-slate-800" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">3</span>
            <span>Payment</span>
          </div>
          <div className="w-8 h-px bg-slate-800" />
          <div className={`flex items-center gap-2 ${step >= 4 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">4</span>
            <span>Confirmation</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* STEP 1: CUSTOMER INFORMATION */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Step 1: Customer Profile Details</h3>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
                User Code: <strong className="text-cyan-400 font-mono">{activeUser.user_code}</strong> (Registered User)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DELIVERY INFORMATION */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Step 2: Shipping & Delivery Address</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Delivery City</label>
                  <input
                    type="text"
                    value={deliveryCity}
                    onChange={(e) => setDeliveryCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Delivery State</label>
                  <input
                    type="text"
                    value={deliveryState}
                    onChange={(e) => setDeliveryState(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fulfillment Warehouse Hub</label>
                  <div className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-800 text-cyan-400 text-xs font-mono font-bold flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    <span>Auto-routed to WH-NCR Hub</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT METHOD */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Step 3: Select Payment Channel</h3>
              <div className="space-y-2">
                {PAYMENT_CHANNELS.map((ch) => {
                  const Icon = ch.icon;
                  const isSelected = selectedChannel === ch.id;
                  return (
                    <div
                      key={ch.id}
                      onClick={() => setSelectedChannel(ch.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold">{ch.label}</p>
                          <p className="text-[11px] text-slate-400">{ch.desc}</p>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'}`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Amount Summary */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Gross Value:</span>
                  <span>₹{grossValue.toLocaleString('en-IN')}</span>
                </div>
                {discountValue > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount Value:</span>
                    <span>-₹{discountValue.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>GST Tax (18%):</span>
                  <span>+₹{taxValue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Shipping Charge:</span>
                  <span>{shippingValue === 0 ? 'FREE' : `+₹${shippingValue}`}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-white">
                  <span>Net Payable Value:</span>
                  <span className="text-cyan-400">₹{netValue.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: ORDER CONFIRMATION */}
          {step === 4 && createdOrder && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Transaction Confirmed!</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Transaction stored and dispatched to TechMart Database
                </p>
              </div>

              <div className="p-4 rounded-2xl glass-card border border-cyan-500/30 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Transaction ID:</span>
                  <span className="font-mono font-bold text-cyan-400 text-sm">{createdOrder.transaction_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer Code:</span>
                  <span className="font-mono text-slate-200">{createdOrder.user_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Channel:</span>
                  <span className="font-bold text-slate-200">{createdOrder.payment_channel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Delivery Location:</span>
                  <span className="text-slate-200">{createdOrder.delivery_city}, {createdOrder.delivery_state}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Transaction Status:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                    {createdOrder.transaction_status}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-sm">
                  <span className="text-slate-200">Net Value:</span>
                  <span className="text-cyan-400">₹{createdOrder.net_value.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                This transaction is now available for Retail Pulse extraction via API or CSV export.
              </p>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          {step > 1 && step < 4 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : <div />}

          {step === 1 && (
            <button
              onClick={() => setStep(2)}
              className="glow-button px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ml-auto"
            >
              <span>Continue to Delivery</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 2 && (
            <button
              onClick={() => setStep(3)}
              className="glow-button px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ml-auto"
            >
              <span>Proceed to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleCompleteOrder}
              className="glow-button px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ml-auto shadow-lg shadow-cyan-500/30"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Confirm & Complete Order</span>
            </button>
          )}

          {step === 4 && (
            <button
              onClick={onClose}
              className="glow-button px-6 py-2.5 rounded-xl text-xs font-bold mx-auto"
            >
              Done & Return to TechMart
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
