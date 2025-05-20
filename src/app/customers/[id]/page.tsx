"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = params?.id as string;
  const [customer, setCustomer] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customerId) fetchData();
    // eslint-disable-next-line
  }, [customerId]);

  async function fetchData() {
    setLoading(true);
    const { data: customerData } = await supabase.from('customers').select('*').eq('id', customerId).single();
    const { data: orderList } = await supabase.from('orders').select('*').eq('customer_id', customerId).order('order_date', { ascending: false });
    setCustomer(customerData);
    setOrders(orderList || []);
    setLoading(false);
  }

  const totalPaid = orders.filter(o => o.payment_status === 'Paid').reduce((sum, o) => sum + Number(o.amount), 0);
  const totalUnpaid = orders.filter(o => o.payment_status !== 'Paid').reduce((sum, o) => sum + Number(o.amount), 0);

  return (
    <div className="max-w-3xl mx-auto py-8">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-2 text-black">{customer?.name}</h2>
          <div className="mb-4 text-black">Phone: {customer?.phone_number || '-'}</div>
          <div className="mb-6 flex gap-8">
            <div className="text-black">Total Paid: <span className="font-bold">₹{totalPaid.toLocaleString()}</span></div>
            <div className="text-black">Total Unpaid: <span className="font-bold">₹{totalUnpaid.toLocaleString()}</span></div>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-black">Order History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Payment Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-black">{order.order_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-black">{order.order_details}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-black">₹{order.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-black">{order.payment_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
} 