"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';

type MenuItem = {
  id: string;
  date: string;
  title: string;
  price: number;
  description?: string;
  category: string;
};

function AddMenuItemCard({ onAdded }: { onAdded: () => void }) {
  const [form, setForm] = useState({ date: '', title: '', price: '', description: '', category: '' });
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const { date, title, price, description, category } = form;
    if (!date || !title || !price || !category) return alert('Date, title, price, and category are required');
    const { error } = await supabase.from('menu_items').insert([{ date, title, price: parseFloat(price), description, category }]);
    if (error) return alert('Error adding menu item');
    setForm({ date: '', title: '', price: '', description: '', category: '' });
    onAdded();
  }
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8 max-w-md w-full">
      <h3 className="text-xl font-bold mb-6 text-black">Add Menu Item</h3>
      <form onSubmit={handleAdd} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-black mb-1">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="w-full border border-black rounded-lg px-3 py-2 bg-white text-black focus:ring-2 focus:ring-black"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-1">Title</label>
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full border border-black rounded-lg px-3 py-2 bg-white text-black focus:ring-2 focus:ring-black"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-1">Category</label>
          <select
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full border border-black rounded-lg px-3 py-2 bg-white text-black focus:ring-2 focus:ring-black"
            required
          >
            <option value="">Select category</option>
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-1">Price</label>
          <input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            className="w-full border border-black rounded-lg px-3 py-2 bg-white text-black focus:ring-2 focus:ring-black"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-1">Description</label>
          <input
            type="text"
            placeholder="Description"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full border border-black rounded-lg px-3 py-2 bg-white text-black focus:ring-2 focus:ring-black"
          />
        </div>
        <Button type="submit" size="md" className="w-full">Add</Button>
      </form>
    </div>
  );
}

export default function MenuPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ date: '', title: '', price: '', description: '', category: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const MENU_PER_PAGE = 20;

  useEffect(() => {
    fetchMenu();
  }, []);

  async function fetchMenu() {
    const { data, error } = await supabase.from('menu_items').select('*').order('date', { ascending: false });
    if (!error) setMenu((data as MenuItem[]) || []);
  }

  function startEdit(item: MenuItem) {
    setEditingId(item.id);
    setEditForm({ date: item.date, title: item.title, price: item.price.toString(), description: item.description || '', category: item.category || '' });
  }

  async function handleEditSave(id: string) {
    const { date, title, price, description, category } = editForm;
    if (!date || !title || !price || !category) return alert('Date, title, price, and category are required');
    const { error } = await supabase.from('menu_items').update({ date, title, price: parseFloat(price), description, category }).eq('id', id);
    if (error) return alert('Error updating menu item');
    setEditingId(null);
    fetchMenu();
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) return alert('Error deleting menu item');
    fetchMenu();
  }

  const totalPages = Math.ceil(menu.length / MENU_PER_PAGE);
  const paginatedMenu = menu.slice((currentPage - 1) * MENU_PER_PAGE, currentPage * MENU_PER_PAGE);

  return (
    <>
      <div className="max-w-7xl mx-auto py-8 px-2 sm:px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 items-start">
          <div className="lg:col-span-2 order-1 lg:order-2 mt-4 lg:mt-0">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow divide-y divide-gray-200 text-xs sm:text-sm">
                <thead className="bg-white">
                  <tr>
                    <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-black uppercase">Date</th>
                    <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-black uppercase">Title</th>
                    <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-black uppercase">Category</th>
                    <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-black uppercase">Price</th>
                    <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-black uppercase">Description</th>
                    <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-black uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedMenu.map((item) => (
                    <tr key={item.id}>
                      {editingId === item.id ? (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap"><input type="date" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} className="border border-black rounded px-2 py-1 text-black bg-white" /></td>
                          <td className="px-6 py-4 whitespace-nowrap"><input type="text" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} className="border border-black rounded px-2 py-1 text-black bg-white" /></td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))} className="border border-black rounded px-2 py-1 text-black bg-white">
                              <option value="">Select category</option>
                              <option value="Breakfast">Breakfast</option>
                              <option value="Lunch">Lunch</option>
                              <option value="Dinner">Dinner</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap"><input type="number" value={editForm.price} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} className="border border-black rounded px-2 py-1 text-black bg-white" /></td>
                          <td className="px-6 py-4 whitespace-nowrap"><input type="text" value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} className="border border-black rounded px-2 py-1 text-black bg-white" /></td>
                          <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                            <Button size="sm" type="button" onClick={() => handleEditSave(item.id)}>Save</Button>
                            <Button size="sm" type="button" onClick={() => setEditingId(null)}>Cancel</Button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-black">{item.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.category}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-black">₹{item.price.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-black">{item.description || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                            <Button size="sm" type="button" onClick={() => startEdit(item)}>Edit</Button>
                            <Button size="sm" type="button" onClick={() => handleDelete(item.id)}>Delete</Button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination Controls */}
              <div className="bg-white p-2 flex justify-center items-center gap-2">
                <Button size="sm" type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>&lt; Prev</Button>
                <span className="text-black">Page {currentPage} of {totalPages}</span>
                <Button size="sm" type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>Next &gt;</Button>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1 order-2 lg:order-1">
            <AddMenuItemCard onAdded={fetchMenu} />
          </div>
        </div>
      </div>
    </>
  );
} 