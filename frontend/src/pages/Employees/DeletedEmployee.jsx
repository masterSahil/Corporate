import React, { useEffect, useState } from "react";
import { Menu, Search, Filter, Trash2, ArchiveRestore, Info, Briefcase, RefreshCw, EyeOff, Eye, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { theme } from "../../components/Theme";
import axios from "axios";
import { toast } from "../../ui/Toaster";

const SoftDeletedEmployees = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [deletedEmployees, setDeletedEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [uiLoader, setUiLoader] = useState(false);

  // --- NEW: Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage, setEmployeesPerPage] = useState(10); // Default to 10

  const isRefreshing = false;

  const getDeletedData = async () => {
    const token = sessionStorage.getItem("token");

    try {
      setUiLoader(true);

      const res = await axios.get(
        `${import.meta.env.VITE_API_KEY}/fetch-deleted`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const filteredEmployee = res.data.users.filter(
        u => u.role === "employee"
      );

      setDeletedEmployees(filteredEmployee);

    } catch (error) {
      if (error?.response?.status === 401) {
        sessionStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      toast.error(error?.response?.data?.message || "Failed to Fetch Data");
      console.log(error);
    } finally {
      setUiLoader(false);
    }
  };

  useEffect(() => {
    getDeletedData();
  }, []);

  // --- NEW: Reset page to 1 when search or filter changes ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, departmentFilter, employeesPerPage]);

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
    const token = sessionStorage.getItem("token");

    try {
      setUiLoader(true);

      await axios.put(
        `${import.meta.env.VITE_API_KEY}/restore/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      getDeletedData();
      toast.success("Employee Restored Successfully");

    } catch (error) {
      if (error?.response?.status === 401) {
        sessionStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      toast.error(error?.response?.data?.message || "Employee Restore Failed");
      console.log(error);
    } finally {
      setUiLoader(false);
    }
  };

  const handlePermanentDelete = async (e) => {
    e.preventDefault();

    const token = sessionStorage.getItem("token");

    if (!deletePassword) return;

    try {
      setLoading(true);

      await axios.post(
        `${import.meta.env.VITE_API_KEY}/permanent-delete/${deleteId}`,
        { password: deletePassword },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      await getDeletedData();

      toast.success("Permanently Deleted Successfully");

      setShowDeleteModal(false);
      setDeleteId(null);
      setDeletePassword("");

    } catch (error) {
      if (error?.response?.status === 401) {
        sessionStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      toast.error(error?.response?.data?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  // Tailwind scrollbar
  const customScrollbar = "overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

  // Dynamically extract unique departments from the deleted data
  const uniqueDepartments = ["All", ...new Set(deletedEmployees.map(emp => emp.department).filter(Boolean))];

  // Filter Logic
  const filteredEmployees = deletedEmployees.filter((employee) => {
    const matchesSearch = 
      employee.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "All" || employee.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  // --- NEW: Pagination Logic ---
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / employeesPerPage));
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  
  // This is the array you will actually render in the table
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);

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

  return (
    <div className={`flex h-dvh w-full ${theme.appBg} ${theme.textMain} font-sans overflow-hidden selection:bg-zinc-200 selection:text-zinc-900`}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className={`flex-1 bg-slate-50 ${customScrollbar} flex flex-col`}>
        
        {uiLoader && (
          <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-999">
            <div className="rounded-xl bg-white/70 shadow-xl px-6 py-5 flex items-center gap-3">
              <RefreshCw className="animate-spin text-slate-700" size={22} />
              <span className="text-sm font-semibold text-slate-800"> Loading... </span>
            </div>
          </div>
        )}
        
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
              <p className={`text-base ${theme.textMuted} mt-2`}>Review, restore, or permanently delete removed employee records.</p>
            </div>
            <button onClick={getDeletedData} disabled={isRefreshing}
                className="group flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all w-full sm:w-auto disabled:opacity-70 disabled:cursor-not-allowed" >
                <RefreshCw size={18} className={`${isRefreshing ? 'animate-spin text-black' : 'group-hover:rotate-180 text-slate-500'} transition-all duration-500 ease-in-out`} />
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
                Employees in the trash bin lose access immediately but their data is kept securely until you permanently delete them. Restoring a record will return it to active status.
              </p>
            </div>
          </div>

          {/* Toolbar: Search & Filter */}
          <div className={`flex flex-col md:flex-row gap-4 mb-8 p-5 rounded-xl border ${theme.border} ${theme.cardBg} shadow-sm`}>
            <div className="relative flex-1">
              <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted} pointer-events-none`} />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search deleted employees by username or email..." 
                className={`w-full pl-11 pr-4 py-3 bg-zinc-50 border ${theme.border} rounded-lg text-sm text-slate-900 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}/>
            </div>
            
            <div className="relative md:w-56">
              <Filter size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted} pointer-events-none`} />
              <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}
                className={`w-full pl-11 pr-10 py-3 bg-zinc-50 border ${theme.border} rounded-lg text-sm text-slate-900 outline-none focus:border-black focus:ring-1 focus:ring-black appearance-none cursor-pointer transition-all`}>
                {uniqueDepartments.map((dept, idx) => (
                  <option key={idx} value={dept}>
                    {dept === "All" ? "All Departments" : dept}
                  </option>
                ))}
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
                  Permanently deleting employee...
                </span>
              </div>
            </div>
          )}

          {/* Data Table */}
          <div className={`${theme.cardBg} border ${theme.border} rounded-xl shadow-sm overflow-hidden flex flex-col`}>
            {/* Added flex-1 to push the footer down */}
            <div className={`overflow-x-auto ${customScrollbar} flex-1`}>
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className={`bg-zinc-50/80 border-b ${theme.border}`}>
                  <tr>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Employee Profile</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider hidden lg:block ${theme.textMuted}`}>Email</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Department</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Employment</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Gender</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Deleted On</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted} text-center`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {/* Changed from filteredEmployees to currentEmployees */}
                  {currentEmployees.map((employee) => {
                    const id = employee._id?.$oid || employee._id;

                    return (
                      <tr key={id} className="hover:bg-zinc-50/50 transition-colors group">
                        
                        {/* User Info (Profile Image & Username) */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {employee.profile?.imageUrl ? (
                              <img src={employee.profile.imageUrl} alt={employee.username} 
                                className="w-10 h-10 rounded-full object-cover border border-zinc-200 opacity-60 grayscale group-hover:grayscale-0 transition-all" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-zinc-600 opacity-60 grayscale group-hover:grayscale-0 transition-all">
                                {employee.username?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900 line-through decoration-slate-300">{employee.username}</p>
                              <p className={`text-xs ${theme.textMuted} lg:hidden`}>{employee.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className={`px-6 py-4 text-sm font-medium hidden lg:block ${theme.textMuted}`}>
                          {employee.email}
                        </td>

                        {/* Department Badge */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-zinc-100 text-slate-600 ${theme.border}`}>
                            <Briefcase size={12} />
                            {employee.department || "N/A"}
                          </span>
                        </td>

                        {/* Employment Badge */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-zinc-100 text-slate-600 ${theme.border}`}>
                            <Briefcase size={12} />
                            {employee.employment || "N/A"}
                          </span>
                        </td>
                        
                        {/* Gender */}
                        <td className={`px-6 py-4 text-sm font-medium ${theme.textMuted}`}> {employee.gender} </td>

                        {/* Deleted Date (Prefers deletedAt, falls back to createdAt) */}
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-slate-700">
                            {formatDate(employee.deletedAt || employee.createdAt)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3 ">
                            <button onClick={() => handleRestore(id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-sm`} title="Restore Employee">
                              <ArchiveRestore size={14} /> Restore
                            </button>
                            <button onClick={() => { setDeleteId(id); setShowDeleteModal(true); }} 
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-500 hover:bg-rose-100 hover:text-rose-700 border transition-colors shadow-sm`} title="Permanently Delete Employee" >
                              <Trash2 size={18} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Custom Prompt Modal */}
              {showDeleteModal && (
                <div className="fixed inset-0 z-100 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                  <form onSubmit={handlePermanentDelete} className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 border border-zinc-200">
                    <h2 className="text-lg font-bold text-rose-600 flex items-center gap-2 mb-2">
                      <Trash2 size={20} /> Confirm Deletion
                    </h2>
                    <p className="text-sm text-slate-600 mb-5"> Are you sure you want to permanently delete this employee? This cannot be undone. Enter your password to confirm: </p>

                    <div className="relative mb-6">
                      <input type={showPassword ? "text" : "password"} placeholder="Enter password..." value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)}
                        className="w-full p-3 pr-12 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none focus:border-black" autoFocus required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none" >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    <div className="flex justify-end gap-3">
                      <button type="button" onClick={() => { setShowDeleteModal(false); setDeletePassword(""); setDeleteId(null); setShowPassword(false); }}
                        className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50" >
                        Cancel
                      </button>
                      <button type="submit" disabled={!deletePassword || loading}
                        className="px-4 py-2 text-sm font-bold text-white bg-rose-600 rounded-lg hover:bg-rose-700 disabled:opacity-50" >
                        {loading ? "Deleting..." : "Delete Permanently"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              {/* Empty State */}
              {currentEmployees.length === 0 && (
                <div className="p-16 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center mb-4">
                    <Trash2 size={24} className={theme.textMuted} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Trash is empty</h3>
                  <p className={`text-sm ${theme.textMuted} mt-1 max-w-sm`}>No deleted records found matching your current criteria.</p>
                  {searchTerm && (
                    <button onClick={() => { setSearchTerm(""); setDepartmentFilter("All"); }}
                      className="mt-6 px-4 py-2 text-sm font-bold text-black border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* NEW: Pagination Controls Footer */}
            {filteredEmployees.length > 0 && totalPages > 1 && (
              <div className="mt-auto shrink-0 flex flex-row items-center justify-between gap-4 p-4 border-t border-zinc-100 bg-white">
                
                {/* Items per page selector */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Show</span>
                  <div className="relative">
                    <select 
                      value={employeesPerPage} 
                      onChange={(e) => setEmployeesPerPage(Number(e.target.value))}
                      className="appearance-none bg-white border border-slate-200 text-sm font-bold rounded-lg pl-3 pr-8 py-2 outline-none focus:border-slate-900 transition-colors cursor-pointer shadow-sm"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={30}>30</option>
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

export default SoftDeletedEmployees;