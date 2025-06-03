'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Hardcoded admin credentials (for demonstration ONLY)
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'password123';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Simulate successful login - In a real app, use secure session management (e.g., cookies, JWT)
      Cookies.set('isAdminAuthenticated', 'true', { expires: 7 }); // Set a cookie that expires in 7 days
      router.push('/'); // Redirect to dashboard after login
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center sm:py-12">
      <div className="p-10 xs:p-0 mx-auto md:w-full md:max-w-md">
        <h1 className="font-bold text-center text-2xl mb-5 text-black">Admin Login</h1>
        <div className="bg-white shadow w-full rounded-lg divide-y divide-gray-200 p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-blue-500 focus:border-blue-500 text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-blue-500 focus:border-blue-500 text-black"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" size="md" className="w-full">Login</Button>
          </form>
        </div>
      </div>
    </div>
  );
} 