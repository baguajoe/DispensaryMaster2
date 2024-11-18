import React, { useState } from 'react';
import { Menu, X, Package, Users, ShoppingCart, ClipboardList, Settings, LogOut, Bell, Search, Plus } from 'lucide-react';

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState('Products');

  const navigationItems = [
    { name: 'Products', icon: Package },
    { name: 'Customers', icon: Users },
    { name: 'Orders', icon: ShoppingCart },
    { name: 'Compliance', icon: ClipboardList },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-blue-900 to-blue-800 shadow-xl transition-all duration-300 ease-in-out`}
      >
        <div className="h-full flex flex-col">
          {/* Logo area */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-blue-700">
            {isSidebarOpen && (
              <span className="text-white text-xl font-bold tracking-tight">Dispensary MS</span>
            )}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-blue-200 hover:text-white transition-colors duration-200"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-3 py-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => setActivePage(item.name)}
                  className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200
                    ${
                      activePage === item.name 
                        ? 'bg-blue-700 text-white shadow-lg' 
                        : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                    }`}
                >
                  <Icon className={`${isSidebarOpen ? 'mr-3' : 'mx-auto'} h-5 w-5`} />
                  {isSidebarOpen && <span>{item.name}</span>}
                </button>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-blue-700 p-4">
            <button className="w-full flex items-center text-blue-200 hover:text-white transition-colors duration-200">
              <LogOut className={`${isSidebarOpen ? 'mr-3' : 'mx-auto'} h-5 w-5`} />
              {isSidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm">
          <div className="h-16 flex items-center justify-between px-6">
            <h1 className="text-2xl font-bold text-gray-900">{activePage}</h1>
            <div className="flex items-center space-x-6">
              {/* Search Bar */}
              <div className="hidden md:flex items-center space-x-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <button className="relative text-gray-600 hover:text-gray-900 transition-colors duration-200">
                <Bell size={22} />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">2</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                  AU
                </div>
                {isSidebarOpen && (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">Admin User</span>
                    <span className="text-xs text-gray-500">admin@dispensary.com</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {activePage === 'Products' && (
              <div className="space-y-6">
                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Total Products', value: '234', change: '+12%' },
                    { label: 'Active Products', value: '186', change: '+8%' },
                    { label: 'Low Stock', value: '24', change: '-3%' }
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
                      <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                      <div className="mt-2 flex items-baseline justify-between">
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <span className={`text-sm font-medium ${
                          stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-bold text-gray-900">Product List</h2>
                      <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                        <Plus className="h-5 w-5 mr-2" />
                        Add Product
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {['Product', 'Category', 'Stock', 'Price', 'Status'].map((header) => (
                              <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-6 py-4 text-sm text-gray-500">Sample product data will appear here</td>
                            <td className="px-6 py-4 text-sm text-gray-500">Category</td>
                            <td className="px-6 py-4 text-sm text-gray-500">100</td>
                            <td className="px-6 py-4 text-sm text-gray-500">$99.99</td>
                            <td className="px-6 py-4 text-sm">
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                Active
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;