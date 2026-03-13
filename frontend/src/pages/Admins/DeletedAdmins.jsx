import React, { useEffect, useState } from "react";
import { Menu, Search, Filter, Trash2, ArchiveRestore, Info, MoreVertical, ShieldAlert, Shield, RefreshCw } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { theme } from "../../components/theme";
import axios from "axios";
import { toast } from "../../ui/Toaster";

const SoftDeletedAdmins = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [deletedAdmins, setDeletedAdmins] = useState([]);
  const [loading, setLoading] = useState(false);

  const isRefreshing = false;
  // Fetch soft-deleted data
  const getDeletedData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_KEY}/fetch-deleted`, { withCredentials: true });
      const filtered = res.data.users.filter(u => u.role !== "employee");
      setDeletedAdmins(filtered);
    } catch (error) {
      toast.error(error);
      console.log(error);
    }
  };

  useEffect(() => {
    getDeletedData();
  }, []);

  // Date Formatter
  const formatDate = (dateInput) => {
    if (!dateInput) return "N/A";
    const dateString = typeof dateInput === 'object' && dateInput.$date ? dateInput.$date : dateInput;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  const handleRestore = async (id) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_KEY}/restore/${id}`, {}, { withCredentials: true });
      getDeletedData();
      toast.success("Admin Restored Successfully");
    } catch (error) {
      toast.error(error);
      console.log(error);
    }
  };

  // Permanent Deletion
  const handlePermanentDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this admin? This cannot be undone.")) 
    {
      const password = window.prompt("Enter your password to confirm deletion:");
      if (!password) return;

      try {
          setLoading(true);
          await axios.post(`${import.meta.env.VITE_API_KEY}/permanent-delete/${id}`, {password}, {withCredentials: true});

          getDeletedData();
          toast.success("Permanently Deleted Successfully");
      } catch (error) {
          toast.error(error.response?.data?.message || "Delete failed");
      } finally {
        setLoading(false);
      }
    }
  };

  // Tailwind scrollbar
  const customScrollbar = "overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

  // Filter Logic
  const filteredAdmins = deletedAdmins.filter((admin) => {
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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Trash Bin</h1>
              <p className={`text-base ${theme.textMuted} mt-2`}>Review, restore, or permanently delete removed admin records.</p>
            </div>
            <button onClick={getDeletedData}
                className="group flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all w-full sm:w-auto disabled:opacity-70 disabled:cursor-not-allowed"
                >
                <RefreshCw 
                    size={18} 
                    className={`${isRefreshing ? 'animate-spin text-black' : 'group-hover:rotate-180 text-slate-500'} transition-all duration-500 ease-in-out`} 
                />
                Refresh
            </button>
          </div>

          {/* Retention Policy Banner */}
          <div className="mb-8 p-4 rounded-xl border border-blue-200 bg-blue-50/50 flex items-start sm:items-center gap-4 shadow-sm">
            <div className="bg-blue-100 p-2.5 rounded-full text-blue-600 shrink-0">
              <Info size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Manual Retention Policy</h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Admins in the trash bin lose access immediately but their data is kept securely until you permanently delete them. Restoring a record will return it to active status with all previous permissions intact.
              </p>
            </div>
          </div>

          {/* Toolbar: Search & Filter */}
          <div className={`flex flex-col md:flex-row gap-4 mb-8 p-5 rounded-xl border ${theme.border} ${theme.cardBg} shadow-sm`}>
            <div className="relative flex-1">
              <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted} pointer-events-none`} />
              <input 
                type="text" 
                placeholder="Search deleted admins by username or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 bg-zinc-50 border ${theme.border} rounded-lg text-sm text-slate-900 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
              />
            </div>
            
            <div className="relative md:w-56">
              <Filter size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted} pointer-events-none`} />
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className={`w-full pl-11 pr-10 py-3 bg-zinc-50 border ${theme.border} rounded-lg text-sm text-slate-900 outline-none focus:border-black focus:ring-1 focus:ring-black appearance-none cursor-pointer transition-all`}
              >
                <option value="All">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {loading && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl px-6 py-5 flex items-center gap-3">
                <RefreshCw className="animate-spin text-slate-700" size={22} />
                <span className="text-sm font-semibold text-slate-800">
                  Permanently deleting admin / super admin...
                </span>
              </div>
            </div>
          )}

          {/* Data Table */}
          <div className={`${theme.cardBg} border ${theme.border} rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col`}>
            <div className={`overflow-x-auto ${customScrollbar}`}>
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className={`bg-zinc-50/80 border-b ${theme.border}`}>
                  <tr>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Admin Profile</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Email</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Role</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Deleted On</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredAdmins.map((admin) => (
                    <tr key={admin._id} className="hover:bg-zinc-50/50 transition-colors group">
                      
                      {/* User Info (Profile Image & Username) */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {admin.profile?.imageUrl ? (
                            <img 
                              src={admin.profile.imageUrl} 
                              alt={admin.username} 
                              className="w-10 h-10 rounded-full object-cover border border-zinc-200 opacity-60 grayscale group-hover:grayscale-0 transition-all"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-zinc-600 opacity-60 grayscale group-hover:grayscale-0 transition-all">
                              {admin.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <p className="font-bold text-slate-900 line-through decoration-slate-300">{admin.username}</p>
                        </div>
                      </td>

                      {/* Email */}
                      <td className={`px-6 py-4 text-sm font-medium ${theme.textMuted}`}>
                        {admin.email}
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-zinc-100 text-slate-600 ${theme.border}`}>
                          {admin.role === 'super_admin' ? <ShieldAlert size={12} /> : <Shield size={12} />}
                          {admin.role.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Deleted Date */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-700">{formatDate(admin.deletedAt)}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3 ">
                          <button onClick={()=>handleRestore(admin._id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-sm`} title="Restore Admin">
                            <ArchiveRestore size={14} /> Restore
                          </button>
                          <button onClick={()=>handlePermanentDelete(admin._id)} className={`p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 hover:text-rose-700 transition-colors tooltip-trigger`} title="Permanently Delete">
                            <Trash2 size={18} />
                          </button>
                        </div>
                        {/* Mobile visible fallback */}
                        <button className="sm:hidden p-2 text-slate-400 hover:text-black transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Empty State */}
              {filteredAdmins.length === 0 && (
                <div className="p-16 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center mb-4">
                    <Trash2 size={24} className={theme.textMuted} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Trash is empty</h3>
                  <p className={`text-sm ${theme.textMuted} mt-1 max-w-sm`}>No deleted records found matching your current criteria.</p>
                  {searchTerm && (
                    <button 
                      onClick={() => { setSearchTerm(""); setRoleFilter("All"); }}
                      className="mt-6 px-4 py-2 text-sm font-bold text-black border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default SoftDeletedAdmins;