import React, { useState } from 'react';
import { X, CheckCircle2, CreditCard, QrCode, Banknote, ShieldCheck, ArrowRight, ArrowLeft, Download, ShoppingBag } from 'lucide-react';
import { CartItem, Customer, PaymentMethod, Order } from '../../types';
import { api, downloadCSV } from '../../services/api';
import { connectorTracker } from '../../services/connectorTracker';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currentUser: Customer | null;
  onOrderComplete: (newOrder: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  currentUser,
  onOrderComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [name, setName] = useState(currentUser?.name || 'Rahul Sharma');
  const [email, setEmail] = useState(currentUser?.email || 'rahul.sharma@example.com');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98765 43210');
  const [city, setCity] = useState(currentUser?.city || 'Delhi');
  const [state, setState] = useState(currentUser?.state || 'Delhi');
  const [pincode, setPincode] = useState(currentUser?.pincode || '110001');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');

  // Confirmation Order
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  // Price calculations
  let rawSubtotal = 0;
  let totalDiscount = 0;
  cartItems.forEach((item) => {
    const itemRaw = item.product.price * item.quantity;
    const itemDisc = Math.round(item.product.price * (item.product.discount / 100)) * item.quantity;
    rawSubtotal += itemRaw;
    totalDiscount += itemDisc;
  });
  const netSubtotal = rawSubtotal - totalDiscount;
  const tax = Math.round(netSubtotal * 0.18);
  const shippingCost = netSubtotal > 999 ? 0 : 99;
  const finalTotal = netSubtotal + tax + shippingCost;

  const handleCreateOrder = () => {
    let customerId = currentUser?.customer_id;
    if (!customerId) {
      const existing = api.getCustomers().find((c) => c.email === email);
      if (existing) {
        customerId = existing.customer_id;
      } else {
        const newCust = api.addCustomer({
          name,
          email,
          phone,
          city,
          state,
          pincode,
        });
        customerId = newCust.customer_id;
      }
    }

    const order = api.createOrder(customerId, city, state, paymentMethod, cartItems);
    
    // Trigger Real Order Created Event to Retail Pulse Connector
    connectorTracker.trackOrderCreated(order.order_id, order.total_amount, paymentMethod, customerId);

    setCreatedOrder(order);
    setStep(4);
    onOrderComplete(order);
  };

  const handleDownloadInvoice = () => {
    if (!createdOrder) return;
    const headers = ['Order ID', 'Customer ID', 'Date', 'Payment Method', 'City', 'Total Amount (₹)'];
    const rows = [
      [
        createdOrder.order_id,
        createdOrder.customer_id,
        createdOrder.order_date,
        createdOrder.payment_method,
        createdOrder.shipping_city,
        createdOrder.total_amount,
      ],
    ];
    downloadCSV(`Invoice_${createdOrder.order_id}`, headers, rows);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 relative my-8">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">ShopPulse Checkout</span>
            <h2 className="text-lg font-bold text-slate-900">
              {step === 1 && 'Step 1: Customer Information'}
              {step === 2 && 'Step 2: Shipping Address'}
              {step === 3 && 'Step 3: Payment Method'}
              {step === 4 && 'Step 4: Order Confirmed!'}
            </h2>
          </div>
          {step !== 4 && (
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Step Indicator */}
        {step !== 4 && (
          <div className="flex border-b border-slate-100 text-xs font-semibold text-center">
            <div className={`flex-1 py-2 border-b-2 ${step >= 1 ? 'border-indigo-600 text-indigo-600' : 'text-slate-400'}`}>
              1. Customer
            </div>
            <div className={`flex-1 py-2 border-b-2 ${step >= 2 ? 'border-indigo-600 text-indigo-600' : 'text-slate-400'}`}>
              2. Shipping
            </div>
            <div className={`flex-1 py-2 border-b-2 ${step >= 3 ? 'border-indigo-600 text-indigo-600' : 'text-slate-400'}`}>
              3. Payment
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* STEP 1: Customer Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Shipping Address */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Options */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">Select payment method for simulated checkout:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition ${
                    paymentMethod === 'UPI'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-6 h-6" />
                  <span className="text-xs font-bold">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Credit/Debit Card')}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition ${
                    paymentMethod === 'Credit/Debit Card'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-6 h-6" />
                  <span className="text-xs font-bold">Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash on Delivery')}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition ${
                    paymentMethod === 'Cash on Delivery'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Banknote className="w-6 h-6" />
                  <span className="text-xs font-bold">Cash on Delivery</span>
                </button>
              </div>

              {/* Order Total Preview */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Total Payable Amount</span>
                  <p className="text-lg font-extrabold text-slate-900">₹{finalTotal.toLocaleString('en-IN')}</p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Demo Payment
                </span>
              </div>
            </div>
          )}

          {/* STEP 4: Order Confirmation */}
          {step === 4 && createdOrder && (
            <div className="text-center py-4 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Order Placed Successfully!</h3>
                <p className="text-xs text-slate-500 mt-1">Thank you for your demo purchase with ShopPulse.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Order ID</span>
                  <span className="font-extrabold text-indigo-600">{createdOrder.order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer</span>
                  <span className="font-bold text-slate-800">{name} ({email})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Shipping To</span>
                  <span className="font-bold text-slate-800">{city}, {state} - {pincode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Method</span>
                  <span className="font-bold text-slate-800">{createdOrder.payment_method}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900">
                  <span>Total Amount Paid</span>
                  <span className="text-sm text-emerald-600">₹{createdOrder.total_amount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleDownloadInvoice}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-indigo-600" />
                  Download Invoice
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Controls */}
        {step !== 4 && (
          <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                onClick={() => setStep((s) => (s + 1) as 2 | 3)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-indigo-200"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleCreateOrder}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs transition shadow-lg shadow-emerald-200 flex items-center gap-2"
              >
                Place Order Now <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
