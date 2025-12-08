'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import Link from 'next/link';

export default function Header() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
      {!isAuthenticated ? (
        // Default Header (Not Logged In)
        <header className="w-full border-b bg-white">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            
            {/* Logo */}
            <Link href="/">
              <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">Coursera</h1>
            </Link>

            {/* Nav */}
            <nav className="hidden md:flex space-x-8 text-sm font-medium">
              <a href="#" className="hover:text-blue-600">Explore</a>
              <a href="/about" className="hover:text-blue-600">About</a>
              <a href="#" className="hover:text-blue-600">Certificates</a>
              <a href="#" className="hover:text-blue-600">For Enterprise</a>
            </nav>

            {/* Buttons */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowLogin(true)}
                className="text-sm font-medium hover:text-blue-600"
              >
                Log in
              </button>
              <button 
                onClick={() => setShowSignup(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Join for Free
              </button>
            </div>

          </div>
        </header>
      ) : (
        // Logged In Header
        <header className="w-full border-b bg-white sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            
            {/* Logo */}
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">Coursera</h1>
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 mx-8">
              <div className="w-full relative">
                <input
                  type="text"
                  placeholder="Search for anything"
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
                <svg className="w-5 h-5 absolute right-4 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
              <span className="text-sm text-gray-600 hidden sm:block">
                Welcome, {user?.name}
              </span>
              <button className="text-gray-600 hover:text-gray-900 hidden sm:block">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="relative group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold cursor-pointer hover:opacity-90">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                  <Link href="/account-profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Profile
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>

          </div>
        </header>
      )}

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onSignup={() => { setShowLogin(false); setShowSignup(true); }} />}
      {showSignup && <SignupModal onClose={() => setShowSignup(false)} onLogin={() => { setShowSignup(false); setShowLogin(true); }} />}
    </>
  );
}
