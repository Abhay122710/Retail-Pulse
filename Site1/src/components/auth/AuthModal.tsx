import React, { useState } from 'react';
import { X, UserCheck, Mail, Lock, User, Phone, MapPin, Sparkles } from 'lucide-react';
import { Customer } from '../../types';
import { api } from '../../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (customer: Customer) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Delhi');
  const [state, setState] = useState('Delhi');
  const [pincode, setPincode] = useState('110001');

  if (!isOpen) return null;

  const demoCustomers = api.getCustomers().slice(0, 3);

  const handleQuickLogin = (cust: Customer) => {
    onLoginSuccess(cust);
    onClose();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = api.getCustomers().find((c) => c.email.toLowerCase() === email.toLowerCase());
    if (found) {
      onLoginSuccess(found);
    } else {
      // Create on the fly
      const newC = api.addCustomer({
        name: email.split('@')[0],
        email,
        phone: '+91 98765 00000',
        password,
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
      });
      onLoginSuccess(newC);
    }
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCust = api.addCustomer({
      name,
      email,
      phone,
      password,
      city,
      state,
      pincode,
    });
    onLoginSuccess(newCust);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 relative my-8">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-900 to-purple-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="w-5 h-5 text-yellow-300" />
            <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">ShopPulse Account</span>
          </div>
          <h2 className="text-xl font-extrabold">{mode === 'login' ? 'Welcome Back!' : 'Create an Account'}</h2>
          <p className="text-xs text-indigo-100/80 mt-1">Sign in to track orders and manage customer details.</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 text-xs font-bold text-center bg-slate-50">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-3 transition border-b-2 ${
              mode === 'login' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-3 transition border-b-2 ${
              mode === 'register' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            New Register
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6">
          {mode === 'login' ? (
            <div className="space-y-6">
              {/* Quick Login Presets */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Demo Quick Sign In
                </p>
                <div className="space-y-1.5">
                  {demoCustomers.map((cust) => (
                    <button
                      key={cust.customer_id}
                      onClick={() => handleQuickLogin(cust)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-left transition flex items-center justify-between group"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">{cust.name}</p>
                        <p className="text-[11px] text-slate-500">{cust.email} • {cust.city}</p>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600 bg-white px-2 py-1 rounded-md border border-slate-200">
                        Login
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase">Or Custom Email</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition shadow-md shadow-indigo-200"
                >
                  Sign In to Account
                </button>
              </form>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="rahul@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">City</label>
                  <input
                    type="text"
                    placeholder="Delhi"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">State</label>
                  <input
                    type="text"
                    placeholder="Delhi"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Pincode</label>
                  <input
                    type="text"
                    placeholder="110001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs transition shadow-md shadow-indigo-200 mt-2"
              >
                Register Customer Account
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
