import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Shield, Users, Box, Gift, Settings, 
  ChevronDown, ChevronRight, X, MoreVertical 
} from 'lucide-react';
import { theme } from './theme'; // Assuming your theme file is configured

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [activeMenu, setActiveMenu] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Updated array with paths for React Router Dom
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, isLink: true, path: '/' },
    { name: 'Admins', icon: Shield, subs: [
      { label: '1. Add Admins', path: '/admins/add' },
      { label: '2. View, Update & Delete', path: '/admins/manage' },
      { label: '3. Soft Deleted', path: '/admins/deleted' }
    ]},
    { name: 'Employees', icon: Users, subs: [
      { label: '1. Add Employees', path: '/employees/add' },
      { label: '2. View, Update & Delete', path: '/employees/manage' },
      { label: '3. Soft Deleted', path: '/employees/deleted' }
    ]},
    { name: 'Products', icon: Box, subs: [
      { label: '1. Add Products', path: '/products/add' },
      { label: '2. View, Update & Delete', path: '/products/manage' },
      { label: '3. Soft Deleted', path: '/products/deleted' }
    ]},
    { name: 'Rewards', icon: Gift, subs: [
      { label: '1. Add Rewards', path: '/rewards/add' },
      { label: '2. View, Update & Delete', path: '/rewards/manage' },
      { label: '3. Soft Deleted', path: '/rewards/deleted' }
    ]},
    { name: 'Settings', icon: Settings, isLink: true, path: '/settings' }
  ];

  // Auto-expand the correct accordion based on the current URL
  useEffect(() => {
    const currentMainPath = menuItems.find(item => 
      !item.isLink && item.subs.some(sub => location.pathname.includes(sub.path.split('/')[1]))
    );
    if (currentMainPath) setActiveMenu(currentMainPath.name);
  }, [location.pathname]);

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) setIsOpen(false); // Auto-close sidebar on mobile after clicking
  };

  return (
    <>
      {/* BUG FIXED: Mobile Overlay now shows when sidebar IS open, and clicking it CLOSES the sidebar */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 ${theme.cardBg} border-r ${theme.border} transition-transform duration-300 flex flex-col shadow-sm ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Header */}
        <div className={`h-16 flex items-center px-6 border-b ${theme.border} shrink-0`}>
          <div className="flex items-center gap-3">
            <div className={`bg-black p-1.5 rounded-lg shadow-md`}>
              <Shield size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className={`font-bold text-lg leading-tight ${theme.textMain}`}>Super Admin</h1>
              <p className={`text-[10px] text-zinc-500 uppercase tracking-widest font-bold`}>Portal</p>
            </div>
          </div>
          <button className="ml-auto lg:hidden text-slate-400 p-1.5 hover:text-black transition-colors" onClick={() => setIsOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          {menuItems.map((item) => {
            const isMainActive = item.isLink ? location.pathname === item.path : activeMenu === item.name;

            return (
              <div key={item.name}>
                <button
                  onClick={() => item.isLink ? handleNavigation(item.path) : setActiveMenu(activeMenu === item.name ? '' : item.name)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all font-medium group ${
                    isMainActive 
                      ? `bg-black text-white shadow-md` 
                      : `${theme.textMuted} hover:bg-black hover:text-white`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} className={isMainActive ? 'text-white' : 'opacity-70 group-hover:text-white transition-colors'} />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  {!item.isLink && (isMainActive ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                </button>

                {/* Sub-menu */}
                {activeMenu === item.name && !item.isLink && (
                  <div className={`mt-1 mb-3 ml-4 pl-4 border-l-2 ${theme.border} space-y-1`}>
                    {item.subs.map((sub, idx) => {
                      const isSubActive = location.pathname === sub.path;
                      
                      return (
                        <button 
                          key={idx} 
                          onClick={() => handleNavigation(sub.path)}
                          className={`w-full flex items-center justify-between text-left px-3 py-2 text-[13px] rounded-md group font-medium transition ${
                            isSubActive 
                              ? 'border-l-2 shadow-md' 
                              : `${theme.textMuted} hover:border-l-2 hover:shadow-md`
                          }`}
                        >
                          <span>{sub.label}</span>
                          <MoreVertical size={14} className={`transition-opacity ${isSubActive ? 'opacity-100 text-zinc-400' : 'opacity-0 group-hover:opacity-100 text-zinc-400'}`} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;