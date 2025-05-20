import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Customer, MenuItem } from '@/lib/supabase';
import Button from './ui/Button';

export default function AddOrderForm({ onOrderAdded }: { onOrderAdded: () => void }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [selectedMenuItemId, setSelectedMenuItemId] = useState('');
  const [orderDetails, setOrderDetails] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Unpaid' | 'Partial'>('Unpaid');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchMenuItems();
  }, []);

  async function fetchCustomers() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name');
    if (error) {
      console.error('Error fetching customers:', error);
      return;
    }
    setCustomers(data || []);
  }

  async function fetchMenuItems() {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('date', { ascending: false });
    if (error) {
      console.error('Error fetching menu items:', error);
      return;
    }
    setMenuItems(data || []);
  }

  function handleMenuItemChange(id: string) {
    setSelectedMenuItemId(id);
    const item = menuItems.find((m) => m.id === id);
    if (item) {
      setAmount(item.price.toString());
      setOrderDetails(item.title);
    } else {
      setAmount('');
      setOrderDetails('');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      let customerId = selectedCustomerId;
      if (!customerId && newCustomerName) {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert([{ name: newCustomerName, phone_number: newCustomerPhone }])
          .select()
          .single();
        if (customerError) throw customerError;
        customerId = newCustomer.id;
      }
      const { error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_id: customerId,
          order_details: orderDetails,
          amount: parseFloat(amount),
          payment_status: paymentStatus,
        }]);
      if (orderError) throw orderError;
      setSelectedCustomerId('');
      setNewCustomerName('');
      setNewCustomerPhone('');
      setSelectedMenuItemId('');
      setOrderDetails('');
      setAmount('');
      setPaymentStatus('Unpaid');
      onOrderAdded();
    } catch (error) {
      console.error('Error adding order:', error);
      alert('Failed to add order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium text-black">Select Customer</label>
        <select
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black text-black"
        >
          <option value="">Select a customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-black">Or Add New Customer</label>
        <input
          type="text"
          placeholder="Customer Name"
          value={newCustomerName}
          onChange={(e) => setNewCustomerName(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black text-black"
        />
        <input
          type="tel"
          placeholder="Phone Number (optional)"
          value={newCustomerPhone}
          onChange={(e) => setNewCustomerPhone(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black text-black"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-black">Select Menu Item</label>
        <select
          value={selectedMenuItemId}
          onChange={(e) => handleMenuItemChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black text-black"
        >
          <option value="">Select a menu item</option>
          {menuItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title} ({item.date}) - ₹{item.price}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-black">Order Details</label>
        <textarea
          value={orderDetails}
          onChange={(e) => setOrderDetails(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black text-black"
          rows={2}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-black">Amount</label>
        <input
          type="number"
          step="0.01"
          value={amount}
          readOnly
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black text-black bg-gray-100 cursor-not-allowed"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-black">Payment Status</label>
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value as 'Paid' | 'Unpaid' | 'Partial')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black text-black"
        >
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Partial">Partial</option>
        </select>
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Adding Order...' : 'Add Order'}
      </Button>
    </form>
  );
} 