import React, { useEffect, useState } from "react";
import { Menu, Search, Mail, Shield, Filter, Users, Verified, ChevronDown } from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar"; 
import { theme } from "../components/Theme";
import axios from "axios";

const EmployeeDirectory = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // New Filter States
  const [selectedRole, setSelectedRole] = useState("All"); 
  const [selectedDept, setSelectedDept] = useState("All");
  
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getData = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_KEY}`, { withCredentials: true });
      setAllUsers(res.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  // 1. Dynamic Department List for Employees
  const departments = ["All", ...new Set(allUsers.filter(u => u.role === "employee").map(u => u.department).filter(Boolean))];

  // 2. Functional Filter Logic
  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = selectedRole === "All" || user.role === selectedRole;
    
    // Dept filter only applies if Role is Employee
    const matchesDept = (selectedRole === "employee" && selectedDept !== "All") 
      ? user.department === selectedDept 
      : true;

    return matchesSearch && matchesRole && matchesDept;
  });

  const superAdmins = filteredUsers.filter(u => u.role === "super_admin");
  const admins = filteredUsers.filter(u => u.role === "admin");
  const employees = filteredUsers.filter(u => u.role === "employee");

  const customScrollbarClasses = "overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

  return (
    <div className={`flex h-screen w-full ${theme.appBg} ${theme.textMain} font-sans overflow-hidden selection:bg-zinc-900 selection:text-white`}>
      <EmployeeSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className={`flex-1 bg-slate-50 ${customScrollbarClasses}`}>
        
        {/* Mobile Header */}
        <div className="lg:hidden p-4 pb-0 flex justify-between items-center shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="flex items-center gap-2 text-slate-500 hover:text-black hover:bg-white border border-slate-200 bg-white px-3 py-2 rounded-lg shadow-sm transition-all">
            <Menu size={20} /> <span className="text-sm font-medium">Menu</span>
          </button>
        </div>

        <div className="p-6 max-w-7xl mx-auto space-y-12">
          
          {/* 1. Header & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-10">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Talent Directory</h1>
              <p className="text-base text-slate-500 mt-2 font-medium">Browse and connect with the internal talent network.</p>
            </div>
            <div className="flex flex-wrap gap-4 w-full sm:w-auto">
               <div className="relative flex items-center flex-1 sm:w-72 group">
                <Search size={18} className="absolute left-4 text-slate-400 group-focus-within:text-black transition-colors" />
                <input
                  type="text"
                  placeholder="Search name or department..."
                  value={searchQuery}
                  className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl pl-11 pr-4 py-3.5 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Role Filter Dropdown */}
              <div className="relative flex items-center">
                <Filter size={16} className="absolute left-4 pointer-events-none z-10" />
                <select 
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    setSelectedDept("All"); // Reset dept when role changes
                  }}
                  className="appearance-none pl-10 pr-10 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg cursor-pointer outline-none border-none"
                >
                  <option value="All">All Roles</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="employee">Employee</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 pointer-events-none" />
              </div>

              {/* Dynamic Department Filter (Visible only if Employee selected) */}
              {selectedRole === "employee" && (
                <div className="relative flex items-center animate-in fade-in zoom-in duration-200">
                  <select 
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="appearance-none bg-white text-black border-2 border-black pl-5 pr-10 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 shadow-md cursor-pointer outline-none"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept === "All" ? "All Departments" : dept}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 text-black pointer-events-none" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-12">
            
            {/* 2. EXECUTIVE LEADERSHIP (Super Admins) */}
            {superAdmins.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Executive Leadership Super admin</h2>
                  <div className="h-px flex-1 bg-slate-200"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {superAdmins.map((user) => (
                    <div key={user._id} className="relative group overflow-hidden rounded-lg bg-black p-5 text-white flex flex-col lg:flex-row gap-8 items-center transition-all shadow-2xl">
                      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Shield size={120} strokeWidth={1} />
                      </div>

                      <div className="w-32 h-32 rounded-lg overflow-hidden transition-all duration-500 border border-white/10 shrink-0">
                        <img src={user?.profile?.imageUrl || "https://static.vecteezy.com/system/resources/thumbnails/032/176/191/small/business-avatar-profile-black-icon-man-of-user-symbol-in-trendy-flat-style-isolated-on-male-profile-people-diverse-face-for-social-network-or-web-vector.jpg"} 
                        className="w-full h-full object-cover" alt="profile" />
                      </div>

                      <div className="relative z-10 flex-1 text-center lg:text-left">
                        <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                          <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border border-white/10">System Owner</span>
                          <Verified size={14} className="text-white/50" />
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight capitalize">{user.username}</h3>
                        <p className="text-white/60 text-sm mb-6 font-medium italic">Chief Technology Officer</p>
                        
                        <div className="flex gap-3 justify-center lg:justify-start">
                          <a href={`mailto:${user.email}`} className="bg-white text-black px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors flex items-center gap-2">
                            <Mail size={14} /> Contact
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 3. ADMINS NETWORK*/}
            {admins.length > 0 && (
              <section className="space-y-8 pt-4">
                <div className="flex items-center gap-4 flex-1 mb-6">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Admins Network</h2>
                  <div className="h-1px flex-1 bg-slate-200"></div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {admins.map((user) => (
                    <div key={user._id} className="bg-white hover:shadow-2xl hover:shadow-black/5 transition-all p-6 rounded-xl group border-2 border-slate-100 hover:border-black flex flex-col items-center text-center">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-slate-100 mb-4 p-1 ring-2 ring-transparent group-hover:ring-black/5 transition-all overflow-hidden">
                          <img src={user?.profile?.imageUrl || "https://static.vecteezy.com/system/resources/thumbnails/032/176/191/small/business-avatar-profile-black-icon-man-of-user-symbol-in-trendy-flat-style-isolated-on-male-profile-people-diverse-face-for-social-network-or-web-vector.jpg"} 
                            className="w-full h-full object-cover rounded-full transition-all duration-700" 
                            alt={user.username} 
                          />
                        </div>
                        <div className="absolute top-0 right-0 p-1.5 bg-black rounded-full border-2 border-white text-white">
                          <Shield size={12} />
                        </div>
                      </div>

                      <h5 className="font-bold text-sm text-slate-900 capitalize truncate w-full">{user.username}</h5>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">
                        {user.department || 'Administration'}
                      </span>

                      <div className="mt-6 w-full pt-4 border-t border-slate-50">
                        <button className="w-full py-2.5 rounded-sm text-[11px] font-black uppercase tracking-widest text-black bg-slate-50 hover:bg-black hover:text-white transition-all">
                          View Profile
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="bg-slate-100/50 hover:border-black border-2 border-dashed border-slate-200 p-6 rounded-xl flex flex-col justify-center items-center text-center group">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                      <Users size={20} className="text-slate-400 group-hover:text-black" />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest group-hover:text-black text-slate-400">Active Admins</h4>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{admins.length}</div>
                    <p className="text-[9px] font-bold group-hover:text-black text-slate-400 mt-2 px-2 uppercase">Verified across Admins</p>
                  </div>
                </div>
              </section>
            )}

            {/* 4. EMPLOYEES NETWORK */}
            {employees.length > 0 && (
              <section className="space-y-8 pt-4">
                <div className="flex items-center gap-4 flex-1 mb-6">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Employees Network</h2>
                  <div className="h-px flex-1 bg-slate-200"></div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {employees.map((user) => (
                    <div key={user._id} className="bg-white hover:shadow-2xl hover:shadow-black/5 transition-all p-6 rounded-xl group border-2 border-slate-100 hover:border-black flex flex-col items-center text-center">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-slate-100 mb-4 p-1 ring-2 ring-transparent group-hover:ring-black/5 transition-all overflow-hidden">
                          <img src={user?.profile?.imageUrl || "https://static.vecteezy.com/system/resources/thumbnails/032/176/191/small/business-avatar-profile-black-icon-man-of-user-symbol-in-trendy-flat-style-isolated-on-male-profile-people-diverse-face-for-social-network-or-web-vector.jpg"} 
                            className="w-full h-full object-cover rounded-full transition-all duration-700" 
                            alt={user.username} 
                          />
                        </div>
                      </div>

                      <h5 className="font-bold text-sm text-slate-900 capitalize truncate w-full">{user.username}</h5>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">
                        {user.department || 'Member'}
                      </span>

                      <div className="mt-6 w-full pt-4 border-t border-slate-50">
                        <button className="w-full py-2.5 rounded-sm text-[11px] font-black uppercase tracking-widest text-black bg-slate-50 hover:bg-black hover:text-white transition-all">
                          View Profile
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="bg-slate-100/50 hover:border-black border-2 border-dashed border-slate-200 p-6 rounded-xl flex flex-col justify-center items-center text-center group">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                      <Users size={20} className="text-slate-400 group-hover:text-black" />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest group-hover:text-black text-slate-400">Active Employees</h4>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{employees.length}</div>
                    <p className="text-[9px] font-bold group-hover:text-black text-slate-400 mt-2 px-2 uppercase">Verified across departments</p>
                  </div>
                </div>
              </section>
            )}

            {/* Empty State */}
            {filteredUsers.length === 0 && !isLoading && (
              <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                <Search size={48} className="text-slate-200 mb-4" />
                <h3 className="text-lg font-bold text-slate-900">No results found</h3>
                <p className="text-sm text-slate-500">We couldn't find any team members matching your filters.</p>
                <button 
                  onClick={() => {setSearchQuery(""); setSelectedRole("All"); setSelectedDept("All");}} 
                  className="mt-4 text-xs font-bold underline text-black"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDirectory;