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
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Sparkles
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PAYMENT_CHANNELS: Array<{ id: PaymentChannel; label: string; icon: any; desc: string }> = [
  { id: 'UPI', label: 'UPI / QR Code', icon: Smartphone, desc: 'Google Pay, PhonePe, Paytm, BHIM instant transfer' },
  { id: 'Card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay, Amex encrypted gateway' },
  { id: 'Net Banking', label: 'Net Banking', icon: Building2, desc: 'HDFC, ICICI, SBI, Axis, Kotak direct bank transfer' },
  { id: 'Cash on Delivery', label: 'Cash on Delivery', icon: DollarSign, desc: 'Pay cash or UPI upon courier doorstep delivery' },
  { id: 'Wallet', label: 'TechMart Wallet', icon: Wallet, desc: 'Instant 1-click checkout from pre-loaded balance' }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-100 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ff5530]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Secure Express Checkout</h2>
              <p className="text-xs text-slate-500">Fast, 256-bit SSL encrypted transaction</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#ff5530] font-bold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step >= 1 ? 'bg-[#ff5530] text-white' : 'border border-slate-300 text-slate-400'
            }`}>1</span>
            <span>Customer</span>
          </div>
          <div className={`w-8 h-0.5 ${step >= 2 ? 'bg-[#ff5530]' : 'bg-slate-200'}`} />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#ff5530] font-bold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step >= 2 ? 'bg-[#ff5530] text-white' : 'border border-slate-300 text-slate-400'
            }`}>2</span>
            <span>Delivery</span>
          </div>
          <div className={`w-8 h-0.5 ${step >= 3 ? 'bg-[#ff5530]' : 'bg-slate-200'}`} />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#ff5530] font-bold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step >= 3 ? 'bg-[#ff5530] text-white' : 'border border-slate-300 text-slate-400'
            }`}>3</span>
            <span>Payment</span>
          </div>
          <div className={`w-8 h-0.5 ${step >= 4 ? 'bg-[#ff5530]' : 'bg-slate-200'}`} />
          <div className={`flex items-center gap-2 ${step >= 4 ? 'text-[#ff5530] font-bold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step >= 4 ? 'bg-[#ff5530] text-white' : 'border border-slate-300 text-slate-400'
            }`}>4</span>
            <span>Confirmation</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">

          {/* STEP 1: CUSTOMER INFORMATION */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 1 of 3: Customer Information</h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  ID: <span className="font-mono font-bold text-slate-900">{activeUser.user_code}</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-[#ff5530] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-[#ff5530] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Mobile Contact Number</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-[#ff5530] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-start gap-3 text-xs text-amber-800">
                <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <span>
                  Member perks unlocked: Free express shipping and standard 1-year manufacturer warranty applied to this order.
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: DELIVERY INFORMATION */}
          {step === 2 && (
            <div className="space-y-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 2 of 3: Shipping & Delivery Address</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Delivery City</label>
                  <input
                    type="text"
                    value={deliveryCity}
                    onChange={(e) => setDeliveryCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-[#ff5530] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Delivery State</label>
                  <input
                    type="text"
                    value={deliveryState}
                    onChange={(e) => setDeliveryState(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-[#ff5530] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Postal Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-[#ff5530] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Fulfillment Hub</label>
                  <div className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#ff5530]" />
                    <span>Auto-routed to WH-NCR Hub (Fast Dispatch)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT METHOD */}
          {step === 3 && (
            <div className="space-y-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 3 of 3: Select Payment Channel</h3>
              <div className="space-y-2.5">
                {PAYMENT_CHANNELS.map((ch) => {
                  const Icon = ch.icon;
                  const isSelected = selectedChannel === ch.id;
                  return (
                    <div
                      key={ch.id}
                      onClick={() => setSelectedChannel(ch.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-orange-50/70 border-[#ff5530] shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-[#ff5530] text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{ch.label}</p>
                          <p className="text-[11px] text-slate-500">{ch.desc}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-[#ff5530] bg-[#ff5530]' : 'border-slate-300'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Amount Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Order Value:</span>
                  <span className="font-semibold text-slate-900">₹{grossValue.toLocaleString('en-IN')}</span>
                </div>
                {discountValue > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Promotional Savings:</span>
                    <span>-₹{discountValue.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>GST Tax (18% Included):</span>
                  <span className="font-semibold text-slate-900">+₹{taxValue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Standard Shipping:</span>
                  <span className="font-bold text-emerald-600">{shippingValue === 0 ? 'FREE' : `+₹${shippingValue}`}</span>
                </div>
                <div className="pt-2.5 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
                  <span>Net Payable Amount:</span>
                  <span className="text-[#ff5530] text-base">₹{netValue.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: ORDER CONFIRMATION */}
          {step === 4 && createdOrder && (
            <div className="text-center py-4 space-y-5">
              <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-500 mx-auto flex items-center justify-center animate-bounce shadow-lg shadow-emerald-100">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900">Order Confirmed!</h3>
                <p className="text-xs text-slate-500">
                  Thank you for your purchase. Transaction dispatched to TechMart database and RetailPulse pipeline.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Transaction ID:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{createdOrder.transaction_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer Code:</span>
                  <span className="font-mono font-semibold text-slate-800">{createdOrder.user_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Channel:</span>
                  <span className="font-bold text-slate-800">{createdOrder.payment_channel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery Destination:</span>
                  <span className="font-semibold text-slate-800">{createdOrder.delivery_city}, {createdOrder.delivery_state}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction Status:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                    {createdOrder.transaction_status}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2.5 font-black text-sm">
                  <span className="text-slate-900">Net Amount Paid:</span>
                  <span className="text-[#ff5530] text-base">₹{createdOrder.net_value.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                This transaction is live and immediately indexed for real-time BI analytics.
              </p>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          {step > 1 && step < 4 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : <div />}

          {step === 1 && (
            <button
              onClick={() => setStep(2)}
              className="btn-dark px-6 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 ml-auto shadow-sm"
            >
              <span>Continue to Delivery</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 2 && (
            <button
              onClick={() => setStep(3)}
              className="btn-dark px-6 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 ml-auto shadow-sm"
            >
              <span>Proceed to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleCompleteOrder}
              className="btn-coral px-7 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 ml-auto shadow-lg shadow-[#ff5530]/25"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Confirm & Place Order</span>
            </button>
          )}

          {step === 4 && (
            <button
              onClick={onClose}
              className="btn-dark px-8 py-2.5 rounded-full text-xs font-bold mx-auto shadow-sm"
            >
              Done & Return to Shopping
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
