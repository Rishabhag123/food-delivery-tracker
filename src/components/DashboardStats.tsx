import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { FaMoneyBillWave, FaShoppingCart, FaChartLine, FaCalendarDay } from 'react-icons/fa';
import StatCard from './ui/StatCard';

export default function DashboardStats() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalRevenue: 0,
    todaysEarnings: 0,
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    fetchStats();
    setIsClient(true);
  }, []);

  async function fetchStats() {
    // Total Sales = sum of all paid + partial orders
    // Total Orders = count of all orders
    // Total Revenue = sum of all orders
    // Today's Earnings = sum of today's paid orders
    const today = new Date().toISOString().slice(0, 10);
    const { data: allOrders, error } = await supabase
      .from('orders')
      .select('*');
    if (error) return;
    const totalSales = allOrders.filter((o: any) => o.payment_status === 'Paid' || o.payment_status === 'Partial').reduce((sum: number, o: any) => sum + Number(o.amount), 0);
    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce((sum: number, o: any) => sum + Number(o.amount), 0);
    const todaysEarnings = allOrders.filter((o: any) => o.payment_status === 'Paid' && o.order_date === today).reduce((sum: number, o: any) => sum + Number(o.amount), 0);
    setStats({ totalSales, totalOrders, totalRevenue, todaysEarnings });
  }

  return (
    <>
      {isClient ? (
        <div className="flex flex-wrap gap-6 mb-8">
          <StatCard
            title="Total Sales"
            value={`₹${stats.totalSales.toLocaleString()}`}
            icon={<FaMoneyBillWave className="text-black" />}
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<FaShoppingCart className="text-black" />}
          />
          <StatCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon={<FaChartLine className="text-black" />}
          />
          <StatCard
            title="Today's Earnings"
            value={`₹${stats.todaysEarnings.toLocaleString()}`}
            icon={<FaCalendarDay className="text-black" />}
          />
        </div>
      ) : (
        <div className="flex flex-wrap gap-6 mb-8 animate-pulse">
          <div className="bg-gray-200 rounded-lg p-4 h-24 w-48"></div>
          <div className="bg-gray-200 rounded-lg p-4 h-24 w-48"></div>
          <div className="bg-gray-200 rounded-lg p-4 h-24 w-48"></div>
          <div className="bg-gray-200 rounded-lg p-4 h-24 w-48"></div>
        </div>
      )}
    </>
  );
} 