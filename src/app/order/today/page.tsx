"use client";
import { useEffect, useState } from 'react';
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

  async function handleSubmit(e: any) {
    e.preventDefault();
    setSubmitting(true);
    let customerId = selectedCustomerId;
    if (showNewCustomer) {
      if (!newCustomer.name || !newCustomer.phone_number) {
        alert('Please enter your name and phone number.');
        setSubmitting(false);
        return;
      }
      const { data: newCust, error } = await supabase.from('customers').insert([newCustomer]).select().single();
      if (error) {
        alert('Error creating customer.');
        setSubmitting(false);
        return;
      }
      customerId = newCust.id;
    }
    if (!customerId || !selectedMenuItemId) {
      alert('Please select your name and a menu item.');
      setSubmitting(false);
      return;
    }
    const menuItem = menuItems.find((m: any) => m.id === selectedMenuItemId);
    await supabase.from('orders').insert([{
      customer_id: customerId,
      order_details: menuItem.title,
      amount: menuItem.price,
      payment_status: 'Unpaid',
    }]);
    setSuccess(true);
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-8 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-black">JMD Tiffins</h1>
        <p className="text-center text-black mb-6">Specialized Home Cooked Food</p>
        {success ? (
          <div className="text-center text-green-700 font-semibold text-lg">Order placed successfully! Thank you.</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Your Name</label>
              <select
                value={selectedCustomerId}
                onChange={e => {
                  if (e.target.value === 'new') {
                    setShowNewCustomer(true);
                    setSelectedCustomerId('');
                  } else {
                    setShowNewCustomer(false);
                    setSelectedCustomerId(e.target.value);
                  }
                }}
                className="w-full border border-black rounded-lg px-3 py-2 bg-white text-black focus:ring-2 focus:ring-black"
                required={!showNewCustomer}
              >
                <option value="">Select your name</option>
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone_number})</option>
                ))}
                <option value="new">+ I am a new customer</option>
              </select>
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
            <Button type="submit" size="md" className="w-full" disabled={submitting}>{submitting ? 'Placing Order...' : 'Place Order'}</Button>
          </form>
        )}
      </div>
    </div>
  );
} 