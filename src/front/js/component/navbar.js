import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Home, Package, Users, ShoppingCart, ClipboardList, Settings, LogOut } from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation items including Home and Invoices
  const navigationItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Orders', path: '/orders', icon: ShoppingCart },
    { name: 'Invoices', path: '/invoices', icon: ClipboardList },
    { name: 'Compliance', path: '/compliance', icon: ClipboardList },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <header className="bg-gray-800 text-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="text-lg font-semibold">
          Dispensary MS
        </Link>

        {/* Hamburger menu for mobile */}
        <button
          className="sm:hidden block text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex space-x-6">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-md ${
                  isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <nav className="sm:hidden bg-gray-800 border-t border-gray-700">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `block px-4 py-2 text-sm ${
                  isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
              onClick={() => setIsMobileMenuOpen(false)} // Close menu after selecting an item
            >
              <div className="flex items-center space-x-2">
                <item.icon size={18} />
                <span>{item.name}</span>
              </div>
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
