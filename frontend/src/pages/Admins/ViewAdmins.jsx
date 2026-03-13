import React, { useEffect, useState } from "react";
import { Menu, Search, Filter, Edit2, Trash2, UserPlus, Shield, ShieldCheck, MoreVertical } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { theme } from "../../components/theme";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "../../ui/Toaster";

const ViewAdmins = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [initialAdmins, setInitialAdmins] = useState([]);

  const navigate = useNavigate();

  const getData = async() => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_KEY}`, {withCredentials: true});
      const filteredAdmins = res.data.users.filter(u => u.role !== "employee")
      setInitialAdmins(filteredAdmins);
    } catch (error) {
      toast.error(error);
      console.log(error);
    }
  }

  useEffect(() => {
    getData();
  }, [])
  
  // Tailwind arbitrary variants for the custom scrollbar
  const customScrollbar = "overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

  // Utility function to format the date
  const formatDate = (dateInput) => {
    if (!dateInput) return "N/A";
    
    // Extract string if it comes as { $date: "..." } from MongoDB, otherwise use as is
    const dateString = typeof dateInput === 'object' && dateInput.$date ? dateInput.$date : dateInput;
    const date = new Date(dateString);
    
    // Format: "Mar 2, 2026, 05:20 AM"
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const deleteAdmin = async(id) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_KEY}/delete/${id}`, {isDeleted: true, deletedAt: new Date()});
      toast.success("Admin Deleted Successfully");
      getData();
    } catch (error) {
      toast.error(error);
      console.log(error);
    }
  }
  
  // Filter Logic: Applies both search term and role dropdown
  const filteredAdmins = initialAdmins.filter((admin) => {
    const matchesSearch = 
      admin.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
      admin.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "All" || admin.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className={`flex h-screen w-full ${theme.appBg} ${theme.textMain} font-sans overflow-hidden selection:bg-zinc-200 selection:text-zinc-900`}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className={`flex-1 bg-slate-50 ${customScrollbar} flex flex-col`}>
        
        {/* Mobile Header */}
        <div className="lg:hidden p-4 pb-0 flex justify-between items-center shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className={`flex items-center gap-2 ${theme.textMuted} hover:text-black hover:bg-zinc-100 ${theme.cardBg} border ${theme.border} px-3 py-2 rounded-lg shadow-sm transition-all`}>
            <Menu size={20} /> <span className="text-sm font-medium">Menu</span>
          </button>
        </div>

        <div className="p-6 max-w-7xl mx-auto w-full flex-1 flex flex-col">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">Manage Admins</h1>
              <p className={`text-sm ${theme.textMuted} mt-1`}>View, update, and manage system administrators.</p>
            </div>
            <button onClick={()=>navigate('/admins/add')} className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-black hover:bg-zinc-800 shadow-md transition-colors w-full sm:w-auto">
              <UserPlus size={16} />
              Add Admin
            </button>
          </div>

          {/* Toolbar: Search & Filter */}
          <div className={`flex flex-col sm:flex-row gap-4 mb-6 p-4 rounded-xl border ${theme.border} ${theme.cardBg} shadow-sm`}>
            <div className="relative flex-1">
              <Search size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
              <input 
                type="text" 
                placeholder="Search by username or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 bg-zinc-50 border ${theme.border} rounded-lg text-sm text-slate-900 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
              />
            </div>
            <div className="relative sm:w-48">
              <Filter size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 bg-zinc-50 border ${theme.border} rounded-lg text-sm text-slate-900 outline-none focus:border-black appearance-none cursor-pointer transition-all`}
              >
                <option value="All">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Data Table */}
          <div className={`${theme.cardBg} border ${theme.border} rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col`}>
            <div className={`overflow-x-auto ${customScrollbar}`}>
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className={`bg-zinc-50/50 border-b ${theme.border}`}>
                  <tr>
                    <th className={`px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>User Profile</th>
                    <th className={`px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider hidden lg:block ${theme.textMuted}`}>Email</th>
                    <th className={`px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Phone Number</th>
                    <th className={`px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Gender</th>
                    <th className={`px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Role</th>
                    <th className={`px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Created At</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted} text-center`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {/* Now mapping over filteredAdmins instead of initialAdmins */}
                  {filteredAdmins.map((admin) => (
                    <tr key={admin._id} className="hover:bg-zinc-50/80 transition-colors group">
                      
                      {/* User Info (Profile Image & Username) */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {admin.profile?.imageUrl ? (
                            <img 
                              src={admin.profile.imageUrl} 
                              alt={admin.username} 
                              className="w-10 h-10 rounded-full object-cover border border-zinc-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-zinc-600">
                              {admin.username?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900">{admin.username}</p>
                            <p className={`text-xs ${theme.textMuted} lg:hidden`}>{admin.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className={`px-6 py-4 text-sm font-medium hidden lg:block ${theme.textMuted}`}>
                        {admin.email}
                      </td>

                      {/* Phone Number */}
                      <td className={`px-6 py-4 text-sm font-medium ${theme.textMuted}`}>
                        {admin.phoneNumber || "N/A"}
                      </td>

                      {/* Gender */}
                      <td className={`px-6 py-4 text-sm font-medium ${theme.textMuted}`}>
                        {admin.gender || "N/A"}
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          admin.role === 'super_admin' 
                            ? 'bg-black text-white border-black' 
                            : `bg-zinc-100 text-slate-700 ${theme.border}`
                        }`}>
                          {admin.role === 'super_admin' ? <ShieldCheck size={13} /> : <Shield size={13} />}
                          {admin.role.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Created At */}
                      <td className={`px-6 py-4 text-sm font-medium ${theme.textMuted}`}>
                        {formatDate(admin.createdAt)}
                      </td>

                      {/* Actions (Update & Delete) */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 ">
                          <button onClick={()=>navigate(`/admins/update/${admin._id}`)} className={`p-2 rounded-md hover:bg-zinc-200 text-slate-600 hover:text-black transition-colors tooltip-trigger`} title="Update Admin">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={()=>deleteAdmin(admin._id)} className={`p-2 rounded-md hover:bg-rose-100 text-slate-600 hover:text-rose-600 transition-colors tooltip-trigger`} title="Delete Admin">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        {/* Mobile visible fallback */}
                        <button className="hidden p-2 text-slate-400 hover:text-black">
                          <MoreVertical size={16} />
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Empty State */}
              {filteredAdmins.length === 0 && (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-3">
                    <Search size={20} className={theme.textMuted} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">No admins found</h3>
                  <p className={`text-xs ${theme.textMuted} mt-1`}>Try adjusting your search or filters.</p>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default ViewAdmins;