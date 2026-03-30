import React, { useEffect, useState } from "react";
import { Menu, Search, Filter, Edit2, Trash2, UserPlus, Shield, ShieldCheck, RefreshCw, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { theme } from "../../components/Theme";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "../../ui/Toaster";

const ViewAdmins = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [initialAdmins, setInitialAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [adminsPerPage, setAdminsPerPage] = useState(10); 

  const navigate = useNavigate();

  const getData = async() => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_KEY}`, {withCredentials: true});
      const filteredAdmins = res.data.users.filter(u => u.role !== "employee")
      setInitialAdmins(filteredAdmins);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getData();
  }, [])

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, adminsPerPage]);

  // 1. FILTER LOGIC FIRST: Apply both search term and role dropdown
  const filteredAdmins = initialAdmins.filter((admin) => {
    const username = admin.username?.toLowerCase() || "";
    const email = admin.email?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    const matchesSearch = username.includes(search) || email.includes(search);
    const matchesRole = roleFilter === "All" || admin.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // 2. PAGINATION LOGIC SECOND: Slice the filtered array
  const totalPages = Math.max(1, Math.ceil(filteredAdmins.length / adminsPerPage));
  const indexOfLastAdmin = currentPage * adminsPerPage;
  const indexOfFirstAdmin = indexOfLastAdmin - adminsPerPage;

  // This is the array you will actually render in the table
  const currentAdmins = filteredAdmins.slice(indexOfFirstAdmin, indexOfLastAdmin);
  
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

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
      setLoading(true);
      await axios.put(`${import.meta.env.VITE_API_KEY}/delete/${id}`, {isDeleted: true, deletedAt: new Date()});
      toast.success("Admin Deleted Successfully");
      getData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete");
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`flex h-dvh w-full ${theme.appBg} ${theme.textMain} font-sans overflow-hidden selection:bg-zinc-200 selection:text-zinc-900`}>

      {loading && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-999">
          <div className="rounded-xl bg-white/70 shadow-xl px-6 py-5 flex items-center gap-3">
            <RefreshCw className="animate-spin text-slate-700" size={22} />
            <span className="text-sm font-semibold text-slate-800">
              Loading...
            </span>
          </div>
        </div>
      )}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className={`flex-1 bg-slate-50 ${customScrollbar} flex flex-col`}>
        
        {/* Mobile Header */}
        <div className="lg:hidden p-4 pb-0 flex justify-between items-center shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className={`flex items-center gap-2 ${theme.textMuted} hover:text-black hover:bg-zinc-100 ${theme.cardBg} border ${theme.border} px-3 py-2 rounded-lg shadow-sm transition-all`}>
            <Menu size={20} /> <span className="text-sm font-medium">Menu</span>
          </button>
        </div>

        <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full flex-1 flex flex-col">
          
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
              <input type="text" placeholder="Search by username or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full pl-10 pr-4 py-2.5 bg-zinc-50 border ${theme.border} rounded-lg text-sm text-slate-900 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`} />
            </div>
            <div className="relative sm:w-48">
              <Filter size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 bg-zinc-50 border ${theme.border} rounded-lg text-sm text-slate-900 outline-none focus:border-black appearance-none cursor-pointer transition-all`}>
                <option value="All">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Data Table Container */}
          <div className={`${theme.cardBg} border ${theme.border} rounded-xl shadow-sm overflow-hidden flex flex-col`}>
            
            {/* ADDED flex-1 here to push the pagination footer to the bottom */}
            <div className={`overflow-x-auto ${customScrollbar} flex-1`}>
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className={`bg-zinc-50/50 border-b ${theme.border}`}>
                  <tr>
                    <th className={`px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>User Profile</th>
                    <th className={`px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider hidden lg:table-cell ${theme.textMuted}`}>Email</th>
                    <th className={`px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Phone Number</th>
                    <th className={`px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Gender</th>
                    <th className={`px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Role</th>
                    <th className={`px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Created At</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted} text-center`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {currentAdmins.map((admin) => (
                    <tr key={admin._id} className="hover:bg-zinc-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {admin.profile?.imageUrl ? (
                            <img src={admin.profile.imageUrl || "https://static.vecteezy.com/system/resources/thumbnails/032/176/191/small/business-avatar-profile-black-icon-man-of-user-symbol-in-trendy-flat-style-isolated-on-male-profile-people-diverse-face-for-social-network-or-web-vector.jpg"} 
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
                      <td className={`px-6 py-4 text-sm font-medium hidden lg:table-cell ${theme.textMuted}`}>
                        {admin.email}
                      </td>
                      <td className={`px-6 py-4 text-sm font-medium ${theme.textMuted}`}>
                        {admin.phoneNumber || "N/A"}
                      </td>
                      <td className={`px-6 py-4 text-sm font-medium ${theme.textMuted}`}>
                        {admin.gender || "N/A"}
                      </td>
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
                      <td className={`px-6 py-4 text-sm font-medium ${theme.textMuted}`}>
                        {formatDate(admin.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={()=>navigate(`/admins/update/${admin._id}`)} className={`p-2 rounded-md hover:bg-zinc-200 text-slate-600 hover:text-black transition-colors tooltip-trigger`} title="Update Admin">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={()=>deleteAdmin(admin._id)} className={`p-2 rounded-md hover:bg-rose-100 text-slate-600 hover:text-rose-600 transition-colors tooltip-trigger`} title="Delete Admin">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {currentAdmins.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-12">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-3">
                            <Search size={20} className={theme.textMuted} />
                          </div>
                          <h3 className="text-sm font-bold text-slate-900">No admins found</h3>
                          <p className={`text-xs ${theme.textMuted} mt-1`}>
                            Try adjusting your search or filters.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredAdmins.length > 0 && totalPages > 1 && (
              <div className="mt-auto shrink-0 flex flex-row items-center justify-between gap-4 p-4 border-t border-zinc-100 bg-white">
                
                {/* Items per page selector */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Show</span>
                  <div className="relative">
                    <select value={adminsPerPage} 
                      onChange={(e) => setAdminsPerPage(Number(e.target.value))}
                      className="appearance-none bg-white border border-slate-200 text-sm font-bold rounded-lg pl-3 pr-8 py-2 outline-none focus:border-slate-900 transition-colors cursor-pointer shadow-sm">
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                  </div>
                </div>

                {/* Page Navigation */}
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-900 hover:text-slate-900 disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-all shadow-sm"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div className="items-center gap-1 hidden sm:flex">
                    {getPageNumbers().map((page, index) => (
                      page === "..." ? (
                        <span key={index} className="w-6 flex justify-center text-slate-400 font-bold text-sm">...</span>
                      ) : (
                        <button
                          key={index}
                          onClick={() => setCurrentPage(page)}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-all shadow-sm
                            ${currentPage === page 
                              ? "bg-black text-white border-2 border-black" 
                              : "bg-white border border-slate-200 text-slate-600 hover:border-black hover:text-black"}`}
                        >
                          {page}
                        </button>
                      )
                    ))}
                  </div>

                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-900 hover:text-slate-900 disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-all shadow-sm"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViewAdmins;