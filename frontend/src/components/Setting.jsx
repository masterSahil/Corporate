import React, { useContext, useState } from 'react';
import { Menu, User, Lock, Mail, Eye, EyeOff, ShieldCheck, Save, LogOut } from 'lucide-react';
import Sidebar from './Sidebar';
import { theme } from './theme';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/ContextApi';

/* Reusable Components */
const Card = ({ title, icon: Icon, children, className = "" }) => (
  <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 lg:p-8 shadow-sm ${className}`}>
    {title && (
      <div className={`flex items-center gap-2 mb-6 pb-4 border-b ${theme.border}`}>
        {Icon && <Icon size={20} className="text-slate-900" />}
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>
    )}
    {children}
  </div>
);

const Input = ({ label, type = "text", icon: Icon, rightElement, ...props }) => (
  <div className="flex flex-col gap-2 mb-6">
    <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>
      {label}
    </label>
    <div className="relative flex items-center">
      {Icon && <Icon size={18} className={`absolute left-4 ${theme.textMuted} pointer-events-none`} />}
      <input
        type={type}
        className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg ${Icon ? 'pl-11' : 'pl-4'} ${rightElement ? 'pr-11' : 'pr-4'} py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
        {...props}
      />
      {rightElement && <div className="absolute right-4">{rightElement}</div>}
    </div>
  </div>
);

const PasswordInput = ({ label, ...props }) => {
  const [show, setShow] = useState(false);
  return (
    <Input
      label={label}
      type={show ? "text" : "password"}
      icon={Lock}
      rightElement={
        <button type="button" onClick={() => setShow(!show)} className={`${theme.textMuted} hover:text-black transition-colors`}>
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      }
      {...props}
    />
  );
};

/* Main Component */
const Settings = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "Sarah Jenkins",
    email: "sarah.j@enterprise.com",
    currentPassword: "",
    newPassword: ""
  });

  const loggedIn = useContext(AuthContext);

  const navigate = useNavigate();
  const handleChange = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  // Handle Logout Logic Here
  const handleLogout = async () => {
    try {
      await axios.get(`${import.meta.env.VITE_API_KEY}/remove-auth`, {withCredentials: true});
      navigate('/');
      loggedIn.setLoggedIn(false);
      alert("Logout successfully");
    } catch (error) {
      console.log(error);
      alert(error.message)
    }    
  };

  // Tailwind arbitrary variants for the custom scrollbar
  const customScrollbarClasses = "overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

  return (
    <div className={`flex h-screen w-full ${theme.appBg} ${theme.textMain} font-sans overflow-hidden selection:bg-zinc-200 selection:text-zinc-900`}>
      
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className={`flex-1 flex flex-col bg-slate-50 ${customScrollbarClasses}`}>
        
        {/* Mobile Header */}
        <div className="lg:hidden p-4 pb-0 flex justify-between items-center shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className={`flex items-center gap-2 ${theme.textMuted} hover:text-black hover:bg-zinc-100 ${theme.cardBg} border ${theme.border} px-3 py-2 rounded-lg shadow-sm transition-all`}
          >
            <Menu size={20} /> <span className="text-sm font-medium">Menu</span>
          </button>
        </div>

        {/* Settings Content Area */}
        <div className="p-6 max-w-7xl w-full mx-auto">
          
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Settings</h1>
            <p className={`text-base ${theme.textMuted} mt-2`}>Manage your personal profile and account security.</p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Profile Card */}
            <Card title="Profile Information" icon={User}>
              <p className={`text-sm ${theme.textMuted} mb-6`}>
                Update your identity details and primary contact information.
              </p>
              
              <Input 
                label="Full Name" 
                icon={User} 
                value={formData.fullName} 
                onChange={handleChange("fullName")} 
                placeholder="e.g. Sarah Jenkins" 
              />
              
              <Input 
                label="Email Address" 
                type="email" 
                icon={Mail} 
                value={formData.email} 
                onChange={handleChange("email")} 
                placeholder="name@company.com" 
              />
              
              <div className="pt-2">
                <button className="flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white text-sm font-bold py-3 px-6 rounded-xl shadow-md transition-colors w-full sm:w-auto">
                  <Save size={16} />
                  Save Profile
                </button>
              </div>
            </Card>

            {/* Password / Security Card */}
            <Card title="Security & Authentication" icon={ShieldCheck}>
              <p className={`text-sm ${theme.textMuted} mb-6`}>
                Ensure your account is using a long, random password to stay secure.
              </p>
              
              <PasswordInput 
                label="Current Password" 
                value={formData.currentPassword} 
                onChange={handleChange("currentPassword")} 
                placeholder="Enter current password" 
              />
              
              <PasswordInput 
                label="Change Password" 
                value={formData.newPassword} 
                onChange={handleChange("newPassword")} 
                placeholder="Enter new secure password" 
              />
              
              <div className="pt-2">
                <button className={`flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-slate-900 border ${theme.border} text-sm font-bold py-3 px-6 rounded-xl transition-colors w-full sm:w-auto`}>
                  <Lock size={16} />
                  Update Password
                </button>
              </div>
            </Card>

            {/* Account Actions / Logout Section (Spans Both Columns) */}
            <Card title="Account Actions" icon={LogOut} className="lg:col-span-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">End Current Session</h3>
                  <p className={`text-sm ${theme.textMuted}`}>
                    Securely log out of your account on this device. You will need your credentials to log back in.
                  </p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-bold py-3 px-8 rounded-xl transition-colors w-full sm:w-auto shrink-0"
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;