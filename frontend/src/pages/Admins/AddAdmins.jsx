import React, { useState } from "react";
import { Menu, ShieldCheck, User, UploadCloud, Eye, EyeOff, Lock, Mail, Phone, Key, Camera, Users } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { theme } from "../../components/theme";

/* ================================
   Reusable Components
================================ */

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
      {Icon && <Icon size={18} className={`absolute left-4 ${theme.textMuted}`} />}
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

const ImageDropzone = ({ onFileSelect }) => {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onFileSelect(file);
    }
  };

  return (
    <Card title="Profile Photo" icon={Camera}>
      <label className={`border-2 border-dashed ${preview ? 'border-black' : theme.border} rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-black hover:bg-zinc-50 transition-all cursor-pointer group relative overflow-hidden min-h-62.5`}>
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg absolute inset-0" />
        ) : (
          <>
            <div className="bg-slate-100 p-5 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud size={28} className="text-slate-600" />
            </div>
            <p className="text-base font-bold text-slate-900 mb-1">Click to upload photo</p>
            <p className={`text-sm ${theme.textMuted}`}>JPG, PNG up to 5MB</p>
          </>
        )}
        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </label>
    </Card>
  );
};

const Select = ({ label, icon: Icon, options, ...props }) => (
  <div className="flex flex-col gap-2 mb-6">
    <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>
      {label}
    </label>
    <div className="relative flex items-center">
      {Icon && <Icon size={18} className={`absolute left-4 ${theme.textMuted} pointer-events-none`} />}
      <select
        className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg ${Icon ? 'pl-11' : 'pl-4'} pr-10 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none cursor-pointer`}
        {...props}
      >
        <option value="" disabled hidden>Select an option</option>
        {options.map((opt, i) => (
          <option key={i} value={opt}>{opt}</option>
        ))}
      </select>
      <div className="absolute right-4 pointer-events-none text-slate-400">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  </div>
);

/* Main Component */
const AddAdmin = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    password: "",
    role: "Admin",
    profileImage: null,
  });

  const handleChange = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });
  const handleRoleSelect = (role) => setFormData({ ...formData, role });

  const handleSubmit = () => {
    console.log("Submitting admin:", formData);
    // TODO: connect to backend API
  };

  // Tailwind arbitrary variants to style the scrollbar
  const customScrollbarClasses = "overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

  return (
    <div className={`flex h-screen w-full ${theme.appBg} ${theme.textMain} font-sans overflow-hidden selection:bg-zinc-200 selection:text-zinc-900`}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className={`flex-1 bg-slate-50 ${customScrollbarClasses}`}>
        
        {/* Mobile Header */}
        <div className="lg:hidden p-4 pb-0 flex justify-between items-center shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className={`flex items-center gap-2 ${theme.textMuted} hover:text-black hover:bg-zinc-100 ${theme.cardBg} border ${theme.border} px-3 py-2 rounded-lg shadow-sm transition-all`}>
            <Menu size={20} /> <span className="text-sm font-medium">Menu</span>
          </button>
        </div>

        <div className="p-6 max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-10">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Add New Admin</h1>
              <p className={`text-base ${theme.textMuted} mt-2`}>Configure system access and profile settings.</p>
            </div>
            <div className="flex gap-4 w-full sm:w-auto">
              <button className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold border ${theme.border} bg-white hover:bg-zinc-50 transition-colors`}>
                Cancel
              </button>
              <button onClick={handleSubmit} className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold text-white bg-black hover:bg-zinc-800 shadow-lg transition-colors">
                Save Admin
              </button>
            </div>
          </div>

          {/* Grid Layout (Wider setup) */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Left Column: Form Fields & Roles */}
            <div className="xl:col-span-2 space-y-8">
              
              <Card title="Personal Information" icon={User}>
                <div className="grid md:grid-cols-2 gap-x-8">
                  <Input label="Full Name" icon={User} value={formData.fullName} onChange={handleChange("fullName")} placeholder="e.g. Alex Morgan" />
                  <Input label="Email Address" type="email" icon={Mail} value={formData.email} onChange={handleChange("email")} placeholder="alex@enterprise.com" />
                  <Input label="Phone Number" icon={Phone} value={formData.phone} onChange={handleChange("phone")} placeholder="+1 (555) 000-0000" />
                  <PasswordInput label="Secure Password" value={formData.password} onChange={handleChange("password")} placeholder="••••••••" />
                  <div className="md:col-span-1">
                    <Select 
                      label="Gender" 
                      icon={Users} 
                      value={formData.gender} 
                      onChange={handleChange("gender")} 
                      options={["Male", "Female", "Non-binary", "Prefer not to say"]} 
                    />
                  </div>
                </div>
              </Card>

              <Card title="Role & Permissions" icon={Key}>
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Role Card: Admin */}
                  <div 
                    onClick={() => handleRoleSelect("Admin")}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${formData.role === "Admin" ? 'border-black bg-zinc-50 shadow-md' : `${theme.border} hover:border-zinc-400`}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-base font-bold text-slate-900">Admin</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.role === "Admin" ? 'border-black' : theme.border}`}>
                        {formData.role === "Admin" && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                      </div>
                    </div>
                    <p className={`text-sm ${theme.textMuted} leading-relaxed`}>Standard access to manage users, view analytics, and update general content.</p>
                  </div>

                  {/* Role Card: Superadmin */}
                  <div 
                    onClick={() => handleRoleSelect("Superadmin")}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${formData.role === "Superadmin" ? 'border-black bg-zinc-50 shadow-md' : `${theme.border} hover:border-zinc-400`}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-base font-bold text-slate-900">Superadmin</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.role === "Superadmin" ? 'border-black' : theme.border}`}>
                        {formData.role === "Superadmin" && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                      </div>
                    </div>
                    <p className={`text-sm ${theme.textMuted} leading-relaxed`}>Unrestricted access. Can manage billing, security settings, and other admins.</p>
                  </div>
                </div>
              </Card>

            </div>

            {/* Right Column: Image & Security Info */}
            <div className="space-y-8">
              <ImageDropzone onFileSelect={(file) => setFormData({ ...formData, profileImage: file })} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddAdmin;