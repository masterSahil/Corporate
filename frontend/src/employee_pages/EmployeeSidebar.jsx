import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Store, ShoppingCart, History, 
  Users, Settings, Menu, X, Shield, Coins 
} from 'lucide-react';
import { theme } from '../components/theme'; 

const EmployeeSidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Simple, flat menu structure for employees
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/employee/dashboard' },
    { name: 'Product Store', icon: Store, path: '/employee/store' },
    { name: 'Rewards', icon: Coins, path: '/employee/rewards' },
    { name: 'My Cart', icon: ShoppingCart, path: '/employee/cart' },
    { name: 'Order History', icon: History, path: '/employee/orders' },
    { name: 'Directory', icon: Users, path: '/employee/directory' },
    { name: 'Profile Settings', icon: Settings, path: '/employee/settings' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Top Navbar */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 h-16 ${theme.cardBg} border-b ${theme.border} z-30 flex items-center justify-between px-4 shadow-sm`}>
        <div onClick={() => handleNavigation('/employee/dashboard')} className="flex items-center gap-3 cursor-pointer group">
          <div className="bg-black p-1.5 rounded-lg shadow-md transition-transform">
            <Shield size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className={`font-bold text-lg leading-tight ${theme.textMain}`}>Employee</h1>
          </div>
        </div>
        
        <button onClick={() => setIsOpen(true)} className="p-2 rounded-md hover:bg-black/5 transition-colors focus:outline-none">
          <Menu size={24} className={theme.textMain} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Sidebar Drawer */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 ${theme.cardBg} border-r ${theme.border} transition-transform duration-300 flex flex-col shadow-sm ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Logo Section */}
        <div className={`h-16 flex items-center justify-between px-6 border-b ${theme.border} shrink-0`}>
          <div onClick={() => handleNavigation('/employee/dashboard')} className="flex items-center gap-3 cursor-pointer group">
            <div className="bg-black p-1.5 rounded-lg shadow-md transition-transform group-hover:scale-105">
              <Shield size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className={`font-bold text-lg leading-tight ${theme.textMain}`}>Employee</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Portal</p>
            </div>
          </div>
          <button className="lg:hidden text-slate-400 p-1.5 hover:text-black transition-colors" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all font-medium group ${
                  isActive 
                    ? 'bg-black text-white shadow-md' 
                    : `${theme.textMuted} hover:bg-black hover:text-white`
                }`}
              >
                <item.icon size={18} className={isActive ? 'text-white' : 'opacity-70 group-hover:text-white transition-colors'} />
                <span className="text-sm">{item.name}</span>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
};

export default EmployeeSidebar;