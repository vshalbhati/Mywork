'use client'
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const pathname = usePathname();

  const isActive = (path) => {
    return pathname === path ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white';
  };

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="text-white font-bold text-xl">
                Your Logo
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link 
                  href="/" 
                  className={`${isActive('/')} px-3 py-2 rounded-md text-sm font-medium`}
                >
                  Home
                </Link>
                <Link 
                  href="/about" 
                  className={`${isActive('/about')} px-3 py-2 rounded-md text-sm font-medium`}
                >
                  About
                </Link>
                <Link 
                  href="/services" 
                  className={`${isActive('/services')} px-3 py-2 rounded-md text-sm font-medium`}
                >
                  Services
                </Link>
                <Link 
                  href="/contact" 
                  className={`${isActive('/contact')} px-3 py-2 rounded-md text-sm font-medium`}
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden" id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            href="/"
            className={`${isActive('/')} block px-3 py-2 rounded-md text-base font-medium`}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={`${isActive('/about')} block px-3 py-2 rounded-md text-base font-medium`}
          >
            About
          </Link>
          <Link
            href="/services"
            className={`${isActive('/services')} block px-3 py-2 rounded-md text-base font-medium`}
          >
            Services
          </Link>
          <Link
            href="/contact"
            className={`${isActive('/contact')} block px-3 py-2 rounded-md text-base font-medium`}
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;