import React, { useEffect, useState } from "react";
import { Menu, Search, Filter, Edit2, Trash2, UserPlus, Briefcase, RefreshCw, ChevronLeft, ChevronRight, ChevronDown, LayoutGrid, List, Mail, Phone, User } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { theme } from "../../components/Theme";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "../../ui/Toaster";

const ViewEmployees = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [initialEmployees, setInitialEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage, setEmployeesPerPage] = useState(10);
  // --- NEW: View Mode State ---
  const [viewMode, setViewMode] = useState("table"); // "table" or "card"

  const navigate = useNavigate();

  const getData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");

      const res = await axios.get(`${import.meta.env.VITE_API_KEY}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const fetchedUsers = res.data.users;
      const filtered = fetchedUsers.filter(u => u.role === "employee");
      setInitialEmployees(filtered);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch data");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  // Reset page to 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, departmentFilter, employeesPerPage]);
  
  // Tailwind arbitrary variants for the custom scrollbar
  const customScrollbar = "overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

  // Utility function to format the date
  const formatDate = (dateInput) => {
    if (!dateInput) return "N/A";
    const dateString = typeof dateInput === 'object' && dateInput.$date ? dateInput.$date : dateInput;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const updateEmployee = (id) => {
    navigate(`/employees/update/${id}`);
  };

  const deleteEmployee = async (id) => {
    try {
      setLoading(true);
      await axios.put(`${import.meta.env.VITE_API_KEY}/delete/${id}`, { isDeleted: true, deletedAt: new Date() });
      toast.success("Employee Successfully Deleted");
      getData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  
  // Dynamically extract unique departments
  const uniqueDepartments = ["All", ...new Set(initialEmployees.map(emp => emp.department).filter(Boolean))];

  // Filter Logic
  const filteredEmployees = initialEmployees.filter((employee) => {
    const matchesSearch = 
      employee.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === "All" || employee.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / employeesPerPage));
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
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
        {loading && (
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

        <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full flex-1 flex flex-col">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">Manage Employees</h1>
              <p className={`text-sm ${theme.textMuted} mt-1`}>View, update, and manage your organization's employees.</p>
            </div>
            <button onClick={() => navigate('/employees/add')} className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-black hover:bg-zinc-800 shadow-md transition-colors w-full sm:w-auto">
              <UserPlus size={16} />
              Add Employee
            </button>
          </div>

          {/* Toolbar: Search, Filter & View Toggle */}
          <div className={`flex flex-col lg:flex-row gap-4 mb-6 p-4 rounded-xl border ${theme.border} ${theme.cardBg} shadow-sm`}>
            
            <div className="relative flex-1 w-full">
              <Search size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
              <input 
                type="text" 
                placeholder="Search by username or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 bg-zinc-50 border ${theme.border} rounded-lg text-sm text-slate-900 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
              />
            </div>
            
            <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-auto items-start lg:items-center">
              <div className="relative w-full lg:w-48 shrink-0">
                <Filter size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
                <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 bg-zinc-50 border ${theme.border} rounded-lg text-sm text-slate-900 outline-none focus:border-black appearance-none cursor-pointer transition-all`}>
                  {uniqueDepartments.map((dept, index) => (
                    <option key={index} value={dept}>
                      {dept === "All" ? "All Departments" : dept}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* View Toggle */}
              <div className={`flex w-full lg:w-auto bg-zinc-50 p-1.5 rounded-md border ${theme.border} shrink-0`}>
                <button onClick={() => setViewMode("table")}
                  className={`flex-1 lg:flex-none px-4 py-2 sm:px-3 sm:py-1.5 rounded-md flex items-center justify-center transition-all ${viewMode === "table" ? "bg-white shadow-sm text-black" : "text-slate-500 hover:text-slate-900"}`}
                  title="Table View" >
                  <List size={18} />
                </button>
                <button onClick={() => setViewMode("card")}
                  className={`flex-1 lg:flex-none px-4 py-2 sm:px-3 sm:py-1.5 rounded-md flex items-center justify-center transition-all ${viewMode === "card" ? "bg-white shadow-sm text-black" : "text-slate-500 hover:text-slate-900"}`}
                  title="Card View" >
                  <LayoutGrid size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Data Container */}
          <div className={`${theme.cardBg} border ${theme.border} rounded-xl shadow-sm overflow-hidden flex flex-col`}>
            
            {viewMode === "table" ? (
              <div className={`overflow-x-auto ${customScrollbar} flex-1`}>
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className={`bg-zinc-50/50 border-b ${theme.border}`}>
                    <tr>
                      <th className={`p-4 text-center text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Employee</th>
                      <th className={`p-4 text-center text-[11px] font-bold uppercase tracking-wider hidden lg:table-cell ${theme.textMuted}`}>Email</th>
                      <th className={`p-4 text-center text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Department</th>
                      <th className={`p-4 text-center text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Type</th>
                      <th className={`p-4 text-center text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Phone Number</th>
                      <th className={`p-4 text-center text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Created At</th>
                      <th className={`p-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted} text-center`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {currentEmployees.map((employee) => {
                      const id = employee._id?.$oid || employee._id;

                      return (
                        <tr key={id} className="hover:bg-zinc-50/80 transition-colors group">
                          
                          {/* Employee Info (Profile Image & Username) */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <img src={employee?.profile?.imageUrl || "https://static.vecteezy.com/system/resources/thumbnails/032/176/191/small/business-avatar-profile-black-icon-man-of-user-symbol-in-trendy-flat-style-isolated-on-male-profile-people-diverse-face-for-social-network-or-web-vector.jpg"} 
                                  alt={employee.username} className="w-10 h-10 rounded-full object-cover border border-zinc-200"/>
                                <div>
                                <p className="font-bold text-slate-900">{employee.username || "N/A"}</p>
                                <p className={`text-xs ${theme.textMuted} lg:hidden`}>{employee.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Email */}
                          <td className={`px-6 py-4 text-sm hidden lg:table-cell font-medium ${theme.textMuted}`}>
                            {employee.email || "N/A"}
                          </td>

                          {/* Department Badge */}
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-zinc-100 text-slate-700 ${theme.border}`}>
                              <Briefcase size={12} />
                              {employee.department || "N/A"}
                            </span>
                          </td>

                          {/* Employment Type */}
                          <td className={`px-6 py-4 text-sm font-medium ${theme.textMuted}`}>
                            {employee.employment || "N/A"}
                          </td>

                          {/* Phone Number */}
                          <td className={`px-6 py-4 text-sm font-medium ${theme.textMuted}`}>
                            {employee.phoneNumber || "N/A"}
                          </td>

                          {/* Created At */}
                          <td className={`px-6 py-4 text-sm font-medium ${theme.textMuted}`}>
                            {formatDate(employee.createdAt)}
                          </td>

                          {/* Actions (Update & Delete) */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 ">
                              <button onClick={() => updateEmployee(id)} className={`p-2 rounded-md hover:bg-zinc-200 text-slate-600 hover:text-black transition-colors tooltip-trigger`} title="Update Employee">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => deleteEmployee(id)} className={`p-2 rounded-md hover:bg-rose-100 text-slate-600 hover:text-rose-600 transition-colors tooltip-trigger`} title="Delete Employee">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              // Card View Layout
              <div className={`overflow-y-auto ${customScrollbar} flex-1 p-3 sm:p-5 bg-slate-50/50`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                  {currentEmployees.map((employee) => {
                    const id = employee._id?.$oid || employee._id;
                    
                    return (
                      <div key={id} className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                        
                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-4 gap-3">
                          <div className="flex items-center gap-3">
                            <img src={employee?.profile?.imageUrl || "https://static.vecteezy.com/system/resources/thumbnails/032/176/191/small/business-avatar-profile-black-icon-man-of-user-symbol-in-trendy-flat-style-isolated-on-male-profile-people-diverse-face-for-social-network-or-web-vector.jpg"} 
                              alt={employee.username} 
                              className="w-12 h-12 rounded-full object-cover border border-zinc-200 shrink-0"
                            />
                            <div>
                              <h3 className="font-bold text-slate-900 text-base leading-tight mb-0.5 line-clamp-1" title={employee.username}>
                                {employee.username || "N/A"}
                              </h3>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border bg-zinc-100 text-slate-700 ${theme.border}`}>
                                <Briefcase size={10} />
                                {employee.department || "No Dept"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Body - Contact Info & Details */}
                        <div className="flex-1 space-y-2.5 mb-5 mt-2">
                          <div className="flex items-center gap-2.5 text-sm">
                            <Mail size={15} className="text-slate-400 shrink-0" />
                            <span className="text-slate-700 truncate" title={employee.email}>{employee.email || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-sm">
                            <Phone size={15} className="text-slate-400 shrink-0" />
                            <span className="text-slate-700">{employee.phoneNumber || <span className="italic text-slate-400 text-xs">No Phone</span>}</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-sm">
                            <User size={15} className="text-slate-400 shrink-0" />
                            <span className="text-slate-700 capitalize">{employee.employment || <span className="italic text-slate-400 text-xs">Unspecified Type</span>}</span>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="pt-4 border-t border-zinc-100 flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-medium ${theme.textMuted}`}>
                              Joined {formatDate(employee.createdAt).replace(',', ' •')}
                            </span>
                          </div>
                        </div>

                        {/* Always-Visible Action Buttons */}
                        <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                          <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">Manage</p>
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateEmployee(id)} className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-50 border border-zinc-200 text-slate-600 hover:bg-zinc-100 hover:text-slate-900 hover:border-zinc-300 active:scale-95 transition-all duration-150" >
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => deleteEmployee(id)} className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 hover:text-rose-700 hover:border-rose-200 active:scale-95 transition-all duration-150" >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State properly placed outside the conditional view logic so it shows in both modes */}
            {currentEmployees.length === 0 && (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-3">
                  <Search size={20} className={theme.textMuted} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">No employees found</h3>
                <p className={`text-xs ${theme.textMuted} mt-1`}>Try adjusting your search or filters.</p>
              </div>
            )}

            {/* Pagination Footer */}
            {filteredEmployees.length > 0 && totalPages > 1 && (
              <div className="mt-auto shrink-0 flex flex-row items-center justify-between gap-4 p-4 border-t border-zinc-100 bg-white">
                
                {/* Items per page selector */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Show</span>
                  <div className="relative">
                    <select value={employeesPerPage} 
                      onChange={(e) => setEmployeesPerPage(Number(e.target.value))}
                      className="appearance-none bg-white border border-slate-200 text-sm font-bold rounded-lg pl-3 pr-8 py-2 outline-none focus:border-slate-900 transition-colors cursor-pointer shadow-sm">
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
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-900 hover:text-slate-900 disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-all shadow-sm">
                    <ChevronLeft size={16} />
                  </button>

                  <div className="items-center gap-1 hidden sm:flex">
                    {getPageNumbers().map((page, index) => (
                      page === "..." ? (
                        <span key={index} className="w-6 flex justify-center text-slate-400 font-bold text-sm">...</span>
                      ) : (
                        <button key={index}
                          onClick={() => setCurrentPage(page)}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-all shadow-sm
                            ${currentPage === page ? "bg-black text-white border-2 border-black" 
                              : "bg-white border border-slate-200 text-slate-600 hover:border-black hover:text-black"}`}>
                          {page}
                        </button>
                      )
                    ))}
                  </div>

                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-900 hover:text-slate-900 disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-all shadow-sm">
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

export default ViewEmployees;