'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import DashboardStats from '@/components/DashboardStats';

function AddOrderCard({ onAdded, customers, menuItems }: any) {
  const [form, setForm] = useState({ customer_id: '', order_details: '', amount: '', payment_status: 'Unpaid' });
  function handleMenuChange(menu_item_id: string) {
    const item = menuItems.find((m: any) => m.id === menu_item_id);
    setForm(f => ({
      ...f,
      order_details: item ? item.title : '',
      amount: item ? item.price.toString() : '',
    }));
  }
  async function handleAdd(e: any) {
    e.preventDefault();
    const { customer_id, order_details, amount, payment_status } = form;
    if (!customer_id || !order_details || !amount) return alert('Customer, menu item, and amount are required');
    const { error } = await supabase.from('orders').insert([{ customer_id, order_details, amount: parseFloat(amount), payment_status }]);
    if (error) return alert('Error adding order');
    setForm({ customer_id: '', order_details: '', amount: '', payment_status: 'Unpaid' });
    onAdded();
  }
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8 max-w-md w-full">
      <h3 className="text-xl font-bold mb-6 text-black">Add Order</h3>
      <form onSubmit={handleAdd} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-black mb-1">Customer</label>
          <select
            value={form.customer_id}
            onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))}
            className="w-full border border-black rounded-lg px-3 py-2 bg-white text-black focus:ring-2 focus:ring-black"
            required
          >
            <option value="">Select Customer</option>
            {customers.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-1">Menu Item</label>
          <select
            onChange={e => handleMenuChange(e.target.value)}
            className="w-full border border-black rounded-lg px-3 py-2 bg-white text-black focus:ring-2 focus:ring-black"
            required
          >
            <option value="">Select Menu Item</option>
            {menuItems.map((m: any) => (
              <option key={m.id} value={m.id}>{m.title} ({m.date}) - ₹{m.price}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-1">Order Details</label>
          <input
            type="text"
            placeholder="Order Details"
            value={form.order_details}
            onChange={e => setForm(f => ({ ...f, order_details: e.target.value }))}
            className="w-full border border-black rounded-lg px-3 py-2 bg-white text-black focus:ring-2 focus:ring-black"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-1">Amount</label>
          <input
            type="number"
            placeholder="Amount"
            value={form.amount}
            readOnly
            className="w-full border border-black rounded-lg px-3 py-2 bg-gray-100 text-black cursor-not-allowed"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-1">Payment Status</label>
          <select
            value={form.payment_status}
            onChange={e => setForm(f => ({ ...f, payment_status: e.target.value }))}
            className="w-full border border-black rounded-lg px-3 py-2 bg-white text-black focus:ring-2 focus:ring-black"
            required
          >
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Partial">Partial</option>
          </select>
        </div>
        <Button type="submit" size="md" className="w-full">Add</Button>
      </form>
    </div>
  );
}

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ customer_id: '', order_details: '', amount: '', payment_status: 'Unpaid', delivery_location: '' });
  const [filterDate, setFilterDate] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('');

  useEffect(() => {
    console.log('Fetching all data...');
    fetchAll();
  }, [refreshKey]);

  async function fetchAll() {
    console.log('Starting fetchAll...');
    setLoading(true);
    const { data: ordersData, error: ordersError } = await supabase.from('orders').select('*').order('order_date', { ascending: false });
    const { data: customersData, error: customersError } = await supabase.from('customers').select('*').order('name');
    const { data: menuData, error: menuError } = await supabase.from('menu_items').select('*').order('date', { ascending: false });

    if (ordersError) console.error('Error fetching orders:', ordersError);
    if (customersError) console.error('Error fetching customers:', customersError);
    if (menuError) console.error('Error fetching menu items:', menuError);

    setOrders(ordersData || []);
    setCustomers(customersData || []);
    setMenuItems(menuData || []);
    setLoading(false);
    console.log('fetchAll complete. Orders:', ordersData?.length, 'Customers:', customersData?.length, 'Menu Items:', menuData?.length);
  }

  function startEdit(order: any) {
    console.log('Edit button clicked for order ID:', order.id);
    setEditingId(order.id);
    console.log('editingId set to:', order.id);
    setEditForm({
      customer_id: order.customer_id,
      order_details: order.order_details,
      amount: order.amount.toString(),
      payment_status: order.payment_status,
      delivery_location: order.delivery_location || '',
    });
  }

  async function handleEditSave(id: string) {
    const { customer_id, order_details, amount, payment_status, delivery_location } = editForm;
    if (!customer_id || !amount) return alert('Customer and amount are required');
    const { error } = await supabase.from('orders').update({ customer_id, order_details, amount: parseFloat(amount), payment_status, delivery_location }).eq('id', id);
    if (error) return alert('Error updating order');
    setEditingId(null);
    setRefreshKey(k => k + 1);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this order?')) return;
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) return alert('Error deleting order');
    setRefreshKey(k => k + 1);
  }

  // Filtering logic
  const filteredOrders = orders.filter(order => {
    const matchesDate = filterDate ? order.order_date && order.order_date.slice(0, 10) === filterDate : true;
    const matchesCustomer = filterCustomer ? order.customer_id === filterCustomer : true;
    const matchesPayment = filterPaymentStatus ? order.payment_status === filterPaymentStatus : true;
    return matchesDate && matchesCustomer && matchesPayment;
  });

  console.log('Rendering Home component.');

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto py-6 px-2 sm:px-6 lg:px-8">
        <DashboardStats />
        <div className="py-2">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 items-start">
            <div className="lg:col-span-2 order-1 lg:order-2 mt-4 lg:mt-0">
              <div className="bg-card shadow rounded-lg p-2 sm:p-4 max-w-full overflow-x-auto">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 text-black">All Orders Table</h2>
                <div className="flex flex-row gap-2 sm:gap-4 mb-4 items-end">
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium text-black mb-1">Filter by Date</label>
                    <input
                      type="date"
                      value={filterDate}
                      onChange={e => setFilterDate(e.target.value)}
                      className="w-full border border-black rounded-lg px-3 py-2 bg-white text-black focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium text-black mb-1">Filter by Payment Status</label>
                    <select
                      value={filterPaymentStatus}
                      onChange={e => setFilterPaymentStatus(e.target.value)}
                      className="w-full border border-black rounded-lg px-3 py-2 bg-white text-black focus:ring-2 focus:ring-black"
                    >
                      <option value="">All Statuses</option>
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                      <option value="Partial">Partial</option>
                    </select>
                  </div>
                  {(filterDate || filterCustomer || filterPaymentStatus) && (
                    <Button type="button" size="sm" className="h-10" onClick={() => { setFilterDate(''); setFilterCustomer(''); setFilterPaymentStatus(''); }}>Clear Filters</Button>
                  )}
                </div>
                {loading ? (
                  <div>Loading...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full max-w-full bg-white rounded-lg shadow divide-y divide-gray-200 text-xs sm:text-sm">
                      <thead className="bg-white">
                        <tr>
                          <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-black uppercase">Order Date</th>
                          <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-black uppercase">Customer</th>
                          <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-black uppercase">Order Details</th>
                          <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-black uppercase">Amount</th>
                          <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-black uppercase">Delivery Location</th>
                          <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-black uppercase">Payment Status</th>
                          <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-black uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrders.map((order) => {
                          const customer = customers.find((c: any) => c.id === order.customer_id);
                          const isEditing = editingId === order.id;
                          return (
                            <tr key={order.id}>
                              <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-black">{order.order_date ? order.order_date.slice(0, 10) : '-'}</td>
                              <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                                {isEditing ? (
                                  <select
                                    value={editForm.customer_id}
                                    onChange={e => setEditForm(f => ({ ...f, customer_id: e.target.value }))}
                                    className="border border-black rounded px-2 py-1 text-black bg-white"
                                    required
                                  >
                                    <option value="">Select Customer</option>
                                    {customers.map((c: any) => (
                                      <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="text-black">{customer ? customer.name : '-'}</span>
                                )}
                              </td>
                              <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editForm.order_details}
                                    onChange={e => setEditForm(f => ({ ...f, order_details: e.target.value }))}
                                    className="border border-black rounded px-2 py-1 text-black bg-white"
                                    required
                                  />
                                ) : (
                                  <span className="text-black">{order.order_details}</span>
                                )}
                              </td>
                              <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={editForm.amount}
                                    onChange={e => setEditForm(f => ({ ...f, amount: e.target.value }))}
                                    className="border border-black rounded px-2 py-1 text-black bg-white"
                                    required
                                  />
                                ) : (<span className="text-black">₹{order.amount}</span>
                                )}
                              </td>
                              <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-black">
                                {isEditing ? (
                                  <select
                                    value={editForm.delivery_location}
                                    onChange={e => setEditForm(f => ({ ...f, delivery_location: e.target.value }))}
                                    className="border border-black rounded px-2 py-1 text-black bg-white"
                                    required
                                  >
                                    <option value="">Select Location</option>
                                    <option value="WeWork">WeWork</option>
                                    <option value="P1 Hostel">P1 Hostel</option>
                                    <option value="P2 Hostel">P2 Hostel</option>
                                  </select>
                                ) : (
                                  order.delivery_location || '-'
                                )}
                              </td>
                              <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                                {isEditing ? (
                                  <select
                                    value={editForm.payment_status}
                                    onChange={e => setEditForm(f => ({ ...f, payment_status: e.target.value }))}
                                    className="border border-black rounded px-2 py-1 text-black bg-white"
                                    required
                                  >
                                    <option value="Paid">Paid</option>
                                    <option value="Unpaid">Unpaid</option>
                                    <option value="Partial">Partial</option>
                                  </select>
                                ) : (
                                  <span className="text-black">{order.payment_status}</span>
                                )}
                              </td>
                              <td className="px-2 sm:px-6 py-4 whitespace-nowrap flex gap-2">
                                {isEditing ? (
                                  <>
                                    <Button size="sm" type="button" onClick={() => handleEditSave(order.id)}>Save</Button>
                                    <Button size="sm" type="button" onClick={() => setEditingId(null)}>Cancel</Button>
                                  </>
                                ) : (
                                  <>
                                    <Button size="sm" type="button" onClick={() => startEdit(order)}>Edit</Button>
                                    <Button size="sm" type="button" onClick={() => handleDelete(order.id)}>Delete</Button>
                                  </>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
            <div className="lg:col-span-1 order-2 lg:order-1">
              <AddOrderCard
                onAdded={() => setRefreshKey(k => k + 1)}
                customers={customers}
                menuItems={menuItems}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
