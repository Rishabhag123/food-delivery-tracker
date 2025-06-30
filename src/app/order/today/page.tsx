"use client";
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';

export default function PublicOrderPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone_number: '' });
  const [selectedMenuItemId, setSelectedMenuItemId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [today, setToday] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [lastOrderAmount, setLastOrderAmount] = useState<number | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const razorpayLoaded = useRef(false);

  useEffect(() => {
    // Set today's date on client side only
    setToday(new Date().toISOString().slice(0, 10));
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (today) {
      fetchMenu();
    }
  }, [today]);

  async function fetchCustomers() {
    const { data } = await supabase.from('customers').select('*').order('name');
    setCustomers(data || []);
  }

  async function fetchMenu() {
    const { data: todayRows } = await supabase.from('todays_menu_items').select('menu_item_id').eq('date', today);
    const ids = (todayRows || []).map((row: any) => row.menu_item_id);
    if (ids.length === 0) {
      setMenuItems([]);
      return;
    }
    const { data: items } = await supabase.from('menu_items').select('*').in('id', ids);
    setMenuItems(items || []);
  }

  // Helper to validate form
  function isFormValid() {
    if (showNewCustomer) {
      return newCustomer.name && newCustomer.phone_number && selectedMenuItemId && selectedLocation;
    } else {
      return selectedCustomerId && selectedMenuItemId && selectedLocation;
    }
  }

  // Helper to get or create customer
  async function getOrCreateCustomer() {
    let customerId = selectedCustomerId;
    if (!customerId && showNewCustomer) {
      if (!newCustomer.name || !newCustomer.phone_number) {
        alert('Please enter your name and phone number for the new customer.');
        return null;
      }
      const { data: newCust, error } = await supabase.from('customers').insert([newCustomer]).select().single();
      if (error) {
        alert('Error creating new customer.');
        return null;
      }
      customerId = newCust.id;
    }
    return customerId;
  }

  async function handlePayLater(e: any) {
    e.preventDefault();
    if (!isFormValid()) return;
    setSubmitting(true);
    const customerId = await getOrCreateCustomer();
    if (!customerId) { setSubmitting(false); return; }
    const menuItem = menuItems.find((m: any) => m.id === selectedMenuItemId);
    const { data: orderData, error: orderError } = await supabase.from('orders').insert([
      {
        customer_id: customerId,
        order_details: menuItem.title,
        amount: menuItem.price,
        payment_status: 'Unpaid',
        delivery_location: selectedLocation,
      },
    ]).select().single();
    setSubmitting(false);
    if (orderError) {
      alert('Error placing order.');
      return;
    }
    setLastOrderId(orderData.id);
    setLastOrderAmount(orderData.amount);
    setSuccess(true);
  }

  async function handlePayNow(e: any) {
    e.preventDefault();
    if (!isFormValid()) return;
    setSubmitting(true);
    const customerId = await getOrCreateCustomer();
    if (!customerId) { setSubmitting(false); return; }
    const menuItem = menuItems.find((m: any) => m.id === selectedMenuItemId);
    const { data: orderData, error: orderError } = await supabase.from('orders').insert([
      {
        customer_id: customerId,
        order_details: menuItem.title,
        amount: menuItem.price,
        payment_status: 'Unpaid',
        delivery_location: selectedLocation,
      },
    ]).select().single();
    setSubmitting(false);
    if (orderError) {
      alert('Error placing order.');
      return;
    }
    setLastOrderId(orderData.id);
    setLastOrderAmount(orderData.amount);
    await loadRazorpayScript();
    let prefillName = '';
    let prefillPhone = '';
    if (showNewCustomer) {
      prefillName = newCustomer.name;
      prefillPhone = newCustomer.phone_number;
    } else {
      const cust = customers.find((c: any) => c.id === customerId);
      if (cust) {
        prefillName = cust.name;
        prefillPhone = cust.phone_number || '';
      }
    }
    const res = await fetch('/api/razorpay-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: orderData.amount, orderId: orderData.id }),
    });
    const data = await res.json();
    if (!data.orderId) {
      alert('Failed to initiate payment.');
      return;
    }
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderData.amount * 100,
      currency: 'INR',
      name: 'JMD Tiffins',
      description: 'Order Payment',
      order_id: data.orderId,
      handler: async function (response: any) {
        // Mark order as paid in Supabase
        await supabase.from('orders').update({ payment_status: 'Paid' }).eq('id', orderData.id);
        setPaymentSuccess(true);
      },
      prefill: {
        name: prefillName,
        contact: prefillPhone,
      },
      theme: { color: '#000' },
      modal: {
        ondismiss: async function () {
          // If payment modal is closed, show unpaid message
          setSuccess(true);
        },
      },
    };
    // @ts-ignore
    const rzp = new window.Razorpay(options);
    rzp.open();
    // If payment fails, show unpaid message
    rzp.on('payment.failed', function () {
      setSuccess(true);
    });
  }

  async function loadRazorpayScript() {
    if (razorpayLoaded.current) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        razorpayLoaded.current = true;
        resolve(true);
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-8 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-black">JMD Tiffins</h1>
        <p className="text-center text-black mb-6">Specialized Home Cooked Food</p>
        {success ? (
          paymentSuccess ? (
            <div className="text-center text-green-700 font-semibold text-lg">Payment successful! Thank you for your order.</div>
          ) : (
            <div className="text-center text-green-700 font-semibold text-lg mb-4">Order placed successfully! You can pay later or pay now from your dashboard.</div>
          )
        ) : (
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Your Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={customerSearchTerm}
                  onChange={(e) => {
                    setCustomerSearchTerm(e.target.value);
                    setSelectedCustomerId('');
                    setShowNewCustomer(false);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                  placeholder="Search or type your name"
                  className="w-full border border-black rounded-lg px-3 py-2 bg-white text-black focus:ring-2 focus:ring-black"
                  required
                />
                {showSuggestions && customerSearchTerm && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg text-black">
                    {customers
                      .filter(c =>
                        c.name.toLowerCase().includes(customerSearchTerm.toLowerCase())
                      )
                      .map((c: any) => (
                        <li
                          key={c.id}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                          onMouseDown={() => {
                            setCustomerSearchTerm(c.name);
                            setSelectedCustomerId(c.id);
                            setShowSuggestions(false);
                            setShowNewCustomer(false);
                          }}
                        >
                          {c.name} ({c.phone_number})
                        </li>
                      ))}
                    {!customers.some(c => c.name.toLowerCase() === customerSearchTerm.toLowerCase()) && customerSearchTerm && (
                      <li
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 font-semibold text-blue-600"
                        onMouseDown={() => {
                          setNewCustomer(n => ({ ...n, name: customerSearchTerm }));
                          setShowNewCustomer(true);
                          setSelectedCustomerId('');
                          setShowSuggestions(false);
                        }}
                      >
                        + Add "{customerSearchTerm}" as a new customer
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>
            {showNewCustomer && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Name</label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={e => setNewCustomer(n => ({ ...n, name: e.target.value }))}
                    className="w-full border border-black rounded-lg px-3 py-2 bg-white text-black focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={newCustomer.phone_number}
                    onChange={e => setNewCustomer(n => ({ ...n, phone_number: e.target.value }))}
                    className="w-full border border-black rounded-lg px-3 py-2 bg-white text-black focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-black mb-1">Today's Menu</label>
              <select
                value={selectedMenuItemId}
                onChange={e => setSelectedMenuItemId(e.target.value)}
                className="w-full border border-black rounded-lg px-3 py-2 bg-white text-black focus:ring-2 focus:ring-black"
                required
              >
                <option value="">Select a menu item</option>
                {['Breakfast', 'Lunch', 'Dinner'].map(category => {
                  const categoryItems = menuItems.filter(item => item.category === category);
                  if (categoryItems.length === 0) return null;
                  return (
                    <optgroup key={category} label={category}>
                      {categoryItems.map((item: any) => (
                        <option key={item.id} value={item.id}>
                          {item.title} - ₹{item.price}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Delivery Location</label>
              <select
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                className="w-full border border-black rounded-lg px-3 py-2 bg-white text-black focus:ring-2 focus:ring-black"
                required
              >
                <option value="">Select Location</option>
                <option value="WeWork">WeWork</option>
                <option value="P1 Hostel">P1 Hostel</option>
                <option value="P2 Hostel">P2 Hostel</option>
              </select>
            </div>
            <div className="flex gap-4">
              <Button type="button" size="md" className="w-full" onClick={handlePayNow} disabled={submitting || !isFormValid()}>Pay Now</Button>
              <Button type="button" size="md" className="w-full" onClick={handlePayLater} disabled={submitting || !isFormValid()}>Pay Later</Button>
            </div>
          </form>
        )}
      </div>

      {/* Photo Carousel Section */}
      <div className="w-full max-w-md mt-8">
        <h3 className="text-lg font-semibold mb-4 text-black">Explore our Home Cooked Dishes!</h3>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {/* Replace with your actual image paths */}
          {[ '/carousel-images/1.jpeg', '/carousel-images/2.jpeg', '/carousel-images/3.jpeg', '/carousel-images/4.jpeg', '/carousel-images/5.jpeg', '/carousel-images/6.jpeg', '/carousel-images/7.jpeg' ].map((imageUrl, index) => (
            <div key={index} className="flex-shrink-0 w-40 h-40 bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={imageUrl}
                alt={`Dish photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 