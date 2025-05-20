"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Topbar from '@/components/Topbar';

export default function MenuSharePage() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [orderLink, setOrderLink] = useState('');

  useEffect(() => {
    fetchMenu();
    fetchToday();
    if (typeof window !== 'undefined') {
      setOrderLink(`${window.location.origin}/order/today`);
    }
  }, []);

  async function fetchMenu() {
    const { data } = await supabase.from('menu_items').select('*').order('date', { ascending: false });
    setMenuItems(data || []);
  }

  async function fetchToday() {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase.from('todays_menu_items').select('menu_item_id').eq('date', today);
    setSelectedIds((data || []).map((row: any) => row.menu_item_id));
  }

  function toggleMenuItem(id: string) {
    setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  }

  async function saveTodayMenu() {
    setSaving(true);
    const today = new Date().toISOString().slice(0, 10);
    // Remove all for today, then insert selected
    await supabase.from('todays_menu_items').delete().eq('date', today);
    if (selectedIds.length > 0) {
      await supabase.from('todays_menu_items').insert(selectedIds.map(id => ({ menu_item_id: id, date: today })));
    }
    setSaving(false);
    setCopied(false);
    alert('Today\'s menu updated!');
  }

  function copyLink() {
    if (!orderLink) return;
    navigator.clipboard.writeText(orderLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <Topbar />
      <div className="max-w-2xl mx-auto py-8">
        <h2 className="text-2xl font-bold mb-6 text-black">Menu Share (Today's Menu)</h2>
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-black">Select Menu Items for Today</h3>
          <div className="space-y-6 mb-6">
            {['Breakfast', 'Lunch', 'Dinner'].map(category => {
              const categoryItems = menuItems.filter(item => item.category === category);
              if (categoryItems.length === 0) return null;
              return (
                <div key={category} className="space-y-3">
                  <h4 className="text-md font-semibold text-black border-b border-gray-200 pb-2">{category}</h4>
                  {categoryItems.map(item => (
                    <label key={item.id} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleMenuItem(item.id)}
                        className="accent-black w-5 h-5"
                      />
                      <span className="text-black font-medium">{item.title} <span className="text-xs text-gray-500">({item.date})</span> <span className="text-black">₹{item.price}</span></span>
                    </label>
                  ))}
                </div>
              );
            })}
          </div>
          <Button onClick={saveTodayMenu} size="md" className="w-full" disabled={saving}>{saving ? 'Saving...' : 'Save Today\'s Menu'}</Button>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-lg font-semibold mb-4 text-black">Share Link with Customers</h3>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={orderLink}
              readOnly
              className="w-full border border-black rounded-lg px-3 py-2 bg-gray-100 text-black"
            />
            <Button onClick={copyLink} size="sm">{copied ? 'Copied!' : 'Copy Link'}</Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Send this link to customers. They can place orders for today only.</p>
        </div>
      </div>
    </>
  );
} 