import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Customer = {
  id: string;
  name: string;
  phone_number: string | null;
  created_at: string;
};

export type Order = {
  id: string;
  customer_id: string;
  order_date: string;
  order_details: string;
  amount: number;
  payment_status: 'Paid' | 'Unpaid' | 'Partial';
  created_at: string;
};

export type MenuItem = {
  id: string;
  date: string;
  title: string;
  price: number;
  description: string | null;
  created_at: string;
}; 