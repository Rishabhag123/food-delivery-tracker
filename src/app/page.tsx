'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Topbar from '@/components/Topbar';
import DashboardStats from '@/components/DashboardStats';

function AddOrderCard({ onAdded, customers, menuItems }: any) {
  const [form, setForm] = useState({ customer_id: '', menu_item_id: '', order_details: '', amount: '', payment_status: 'Unpaid' });
  function handleMenuChange(menu_item_id: string) {
    setForm(f => {
      const item = menuItems.find((m: any) => m.id === menu_item_id);
      return {
        ...f,
        menu_item_id,
        order_details: item ? item.title : '',
        amount: item ? item.price.toString() : '',
      };
    });
  }
  async function handleAdd(e: any) {
    e.preventDefault();
    const { customer_id, menu_item_id, order_details, amount, payment_status } = form;
    if (!customer_id || !menu_item_id || !amount) return alert('Customer, menu item, and amount are required');
    const { error } = await supabase.from('orders').insert([{ customer_id, order_details, amount: parseFloat(amount), payment_status }]);
    if (error) return alert('Error adding order');
    setForm({ customer_id: '', menu_item_id: '', order_details: '', amount: '', payment_status: 'Unpaid' });
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
            value={form.menu_item_id}
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
  const [editForm, setEditForm] = useState({ customer_id: '', menu_item_id: '', order_details: '', amount: '', payment_status: 'Unpaid' });

  useEffect(() => {
    fetchAll();
  }, [refreshKey]);

  async function fetchAll() {
    setLoading(true);
    const { data: ordersData } = await supabase.from('orders').select('*').order('order_date', { ascending: false });
    const { data: customersData } = await supabase.from('customers').select('*').order('name');
    const { data: menuData } = await supabase.from('menu_items').select('*').order('date', { ascending: false });
    setOrders(ordersData || []);
    setCustomers(customersData || []);
    setMenuItems(menuData || []);
    setLoading(false);
  }

  function startEdit(order: any) {
    setEditingId(order.id);
    setEditForm({
      customer_id: order.customer_id,
      menu_item_id: '',
      order_details: order.order_details,
      amount: order.amount.toString(),
      payment_status: order.payment_status,
    });
  }

  async function handleEditSave(id: string) {
    const { customer_id, order_details, amount, payment_status } = editForm;
    if (!customer_id || !amount) return alert('Customer and amount are required');
    const { error } = await supabase.from('orders').update({ customer_id, order_details, amount: parseFloat(amount), payment_status }).eq('id', id);
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

  return (
    <main className="min-h-screen bg-background">
      <Topbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <DashboardStats />
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1">
              <AddOrderCard
                onAdded={() => setRefreshKey(k => k + 1)}
                customers={customers}
                menuItems={menuItems}
              />
            </div>
            <div className="lg:col-span-2">
              <div className="bg-card shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-black">Orders</h2>
                {loading ? (
                  <div>Loading...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg shadow divide-y divide-gray-200">
                      <thead className="bg-white">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Order Details</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Payment Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr key={order.id}>
                            {editingId === order.id ? (
                              <>
                                <td className="px-6 py-4 whitespace-nowrap">
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
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <input
                                    type="text"
                                    value={editForm.order_details}
                                    onChange={e => setEditForm(f => ({ ...f, order_details: e.target.value }))}
                                    className="border border-black rounded px-2 py-1 text-black bg-white"
                                    required
                                  />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <input
                                    type="number"
                                    value={editForm.amount}
                                    onChange={e => setEditForm(f => ({ ...f, amount: e.target.value }))}
                                    className="border border-black rounded px-2 py-1 text-black bg-white"
                                    required
                                  />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
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
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                                  <Button size="sm" type="button" onClick={() => handleEditSave(order.id)}>Save</Button>
                                  <Button size="sm" type="button" onClick={() => setEditingId(null)}>Cancel</Button>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-6 py-4 whitespace-nowrap text-black">{customers.find((c: any) => c.id === order.customer_id)?.name || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-black">{order.order_details}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-black">₹{order.amount.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-black">{order.payment_status}</td>
                                <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                                  <Button size="sm" type="button" onClick={() => startEdit(order)}>Edit</Button>
                                  <Button size="sm" type="button" onClick={() => handleDelete(order.id)}>Delete</Button>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
