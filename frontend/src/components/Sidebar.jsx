import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Shield, Users, Box, Gift, Settings, 
  ChevronDown, ChevronRight, X, Menu 
} from 'lucide-react';
import { theme } from './theme'; 

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [activeMenu, setActiveMenu] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

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
      {/* --- NEW: MOBILE TOP NAVBAR --- */}
      {/* Visible only on mobile/tablet (hidden on lg screens). Stays fixed at the top. */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 h-16 ${theme.cardBg} border-b ${theme.border} z-30 flex items-center justify-between px-4 shadow-sm`}>
        {/* Corporate Branding */}
        <div className="flex items-center gap-3">
          <div className="bg-black p-1.5 rounded-lg shadow-md">
            <Shield size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className={`font-bold text-lg leading-tight ${theme.textMain}`}>Super Admin</h1>
          </div>
        </div>
        
        {/* Hamburger Menu Button */}
        <button 
          onClick={() => setIsOpen(true)}
          className={`p-2 rounded-md hover:bg-black/5 transition-colors focus:outline-none focus:ring-2 focus:ring-black/10`}
        >
          <Menu size={24} className={theme.textMain} />
        </button>
      </div>

      {/* Overlay for Mobile Sidebar */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Sidebar Aside */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 ${theme.cardBg} border-r ${theme.border} transition-transform duration-300 flex flex-col shadow-sm ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Sidebar Header (Hidden on mobile since we have the Top Navbar now, but you can keep it if you want branding inside the drawer too. I've left it visible so the drawer looks complete when opened.) */}
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
          {/* Close Button inside Sidebar */}
          <button className="ml-auto lg:hidden text-slate-400 p-1.5 hover:text-black transition-colors" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
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
                              ? 'border-l-2 border-black shadow-sm text-black' 
                              : `${theme.textMuted} hover:border-l-2 hover:shadow-sm hover:text-black hover:border-black `
                          }`}
                        >
                          <span>{sub.label}</span>
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