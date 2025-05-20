"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Topbar from '@/components/Topbar';

interface CustomerRow {
  id: string;
  name: string;
  phone_number: string | null;
  totalOrders: number;
  amountPaid: number;
  amountPending: number;
}

function AddCustomerCard({ onAdded }: { onAdded: () => void }) {
  const [form, setForm] = useState({ name: '', phone_number: '' });
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const { name, phone_number } = form;
    if (!name) return alert('Name is required');
    const { error } = await supabase.from('customers').insert([{ name, phone_number }]);
    if (error) return alert('Error adding customer');
    setForm({ name: '', phone_number: '' });
    onAdded();
  }
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8 max-w-md w-full">
      <h3 className="text-xl font-bold mb-6 text-black">Add Customer</h3>
      <form onSubmit={handleAdd} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-black mb-1">Name</label>
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full border border-black rounded-lg px-3 py-2 bg-white text-black focus:ring-2 focus:ring-black"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-1">Phone Number (optional)</label>
          <input
            type="tel"
            placeholder="Phone Number (optional)"
            value={form.phone_number}
            onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))}
            className="w-full border border-black rounded-lg px-3 py-2 bg-white text-black focus:ring-2 focus:ring-black"
          />
        </div>
        <Button type="submit" size="md" className="w-full">Add</Button>
      </form>
    </div>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', phone_number: '' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    const { data: customerList, error } = await supabase.from('customers').select('*');
    if (error) return setLoading(false);
    const rows: CustomerRow[] = [];
    for (const customer of customerList) {
      const { data: orders } = await supabase
        .from('orders')
        .select('amount, payment_status')
        .eq('customer_id', customer.id);
      const totalOrders = orders?.length || 0;
      let amountPaid = 0;
      let amountPending = 0;
      orders?.forEach((o) => {
        if (o.payment_status === 'Paid') amountPaid += Number(o.amount);
        else amountPending += Number(o.amount);
      });
      rows.push({
        id: customer.id,
        name: customer.name,
        phone_number: customer.phone_number,
        totalOrders,
        amountPaid,
        amountPending,
      });
    }
    setCustomers(rows);
    setLoading(false);
  }

  function startEdit(item: CustomerRow) {
    setEditingId(item.id);
    setEditForm({ name: item.name, phone_number: item.phone_number || '' });
  }

  async function handleEditSave(id: string) {
    const { name, phone_number } = editForm;
    if (!name) return alert('Name is required');
    const { error } = await supabase.from('customers').update({ name, phone_number }).eq('id', id);
    if (error) return alert('Error updating customer');
    setEditingId(null);
    fetchCustomers();
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) return alert('Error deleting customer');
    fetchCustomers();
  }

  return (
    <>
      <Topbar />
      <div className="max-w-7xl mx-auto py-8 px-2 sm:px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 items-start">
          <div className="lg:col-span-2 order-1 lg:order-2 mt-4 lg:mt-0">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow divide-y divide-gray-200 text-xs sm:text-sm">
                <thead className="bg-white">
                  <tr>
                    <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-black uppercase">Name</th>
                    <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-black uppercase">Phone</th>
                    <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-black uppercase">Total Orders</th>
                    <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-black uppercase">Amount Paid</th>
                    <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-black uppercase">Amount Pending</th>
                    <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-black uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((c) => (
                    <tr key={c.id}>
                      {editingId === c.id ? (
                        <>
                          <td className="px-2 sm:px-6 py-3 whitespace-nowrap"><input type="text" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="border border-black rounded px-2 py-1 text-black bg-white" required /></td>
                          <td className="px-2 sm:px-6 py-3 whitespace-nowrap"><input type="tel" value={editForm.phone_number} onChange={e => setEditForm(f => ({ ...f, phone_number: e.target.value }))} className="border border-black rounded px-2 py-1 text-black bg-white" /></td>
                          <td className="px-2 sm:px-6 py-3 whitespace-nowrap text-black">{c.totalOrders}</td>
                          <td className="px-2 sm:px-6 py-3 whitespace-nowrap text-black">₹{c.amountPaid.toLocaleString()}</td>
                          <td className="px-2 sm:px-6 py-3 whitespace-nowrap text-black">₹{c.amountPending.toLocaleString()}</td>
                          <td className="px-2 sm:px-6 py-3 whitespace-nowrap flex gap-2">
                            <Button size="sm" type="button" onClick={() => handleEditSave(c.id)}>Save</Button>
                            <Button size="sm" type="button" onClick={() => setEditingId(null)}>Cancel</Button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-2 sm:px-6 py-3 whitespace-nowrap font-medium text-black">{c.name}</td>
                          <td className="px-2 sm:px-6 py-3 whitespace-nowrap text-black">{c.phone_number || '-'}</td>
                          <td className="px-2 sm:px-6 py-3 whitespace-nowrap text-black">{c.totalOrders}</td>
                          <td className="px-2 sm:px-6 py-3 whitespace-nowrap text-black">₹{c.amountPaid.toLocaleString()}</td>
                          <td className="px-2 sm:px-6 py-3 whitespace-nowrap text-black">₹{c.amountPending.toLocaleString()}</td>
                          <td className="px-2 sm:px-6 py-3 whitespace-nowrap flex gap-2">
                            <Link href={`/customers/${c.id}`} className="underline text-black hover:text-black font-medium">View</Link>
                            <Button size="sm" type="button" onClick={() => startEdit(c)}>Edit</Button>
                            <Button size="sm" type="button" onClick={() => handleDelete(c.id)}>Delete</Button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="lg:col-span-1 order-2 lg:order-1">
            <AddCustomerCard onAdded={fetchCustomers} />
          </div>
        </div>
      </div>
    </>
  );
} 