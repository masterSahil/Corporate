import React, { useState, useEffect } from "react";
import { Menu, Users, Package, Gift, Trash2, ShieldAlert, Clock, Download } from "lucide-react";
import Sidebar from "./Sidebar";
import { theme } from "./Theme";
import axios from "axios";
import { toast } from "../ui/Toaster";

const SystemLogs = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const logsPerPage = 8;
  const filterOptions = ["All", "User Onboarded", "Record Deleted", "Inventory Added", "Reward Issued"];

  // --- DATA FETCHING ---
  const getLogData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all data concurrently
      const [usersRes, deletedRes, productsRes, rewardsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_KEY}/fetch-all-user`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_KEY}/fetch-deleted`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_KEY}/product-all`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_KEY}/reward-all`, { withCredentials: true })
      ]);

      const compiledLogs = [];

      // 1. Process Users
      if (usersRes.data?.success) {
        usersRes.data.users?.forEach(u => compiledLogs.push({
          id: `usr-${u._id}`,
          type: "User Onboarded",
          entity: u.email,
          description: `Assigned role: ${u.role || "employee"}`,
          timestamp: u.createdAt || new Date().toISOString(),
          icon: Users,
          colorClass: "text-emerald-600 bg-emerald-50 border-emerald-100"
        }));
      }

      // 2. Process Deleted Records
      if (deletedRes.data?.success) {
        deletedRes.data.users?.forEach(u => compiledLogs.push({
          id: `del-${u._id}`,
          type: "Record Deleted",
          entity: u.email,
          description: "User account was soft-deleted from the system.",
          timestamp: u.deletedAt || u.updatedAt || new Date().toISOString(),
          icon: Trash2,
          colorClass: "text-red-600 bg-red-50 border-red-100"
        }));
      }

      // 3. Process Products
      if (productsRes.data?.success) {
        productsRes.data.product?.forEach(p => compiledLogs.push({
          id: `prod-${p._id}`,
          type: "Inventory Added",
          entity: p.name,
          description: `Brand: ${p.brand} | Category: ${p.category}`,
          timestamp: p.createdAt || new Date().toISOString(),
          icon: Package,
          colorClass: "text-blue-600 bg-blue-50 border-blue-100"
        }));
      }

      // 4. Process Rewards
      if (rewardsRes.data?.success) {
        rewardsRes.data.reward?.forEach(r => compiledLogs.push({
          id: `rew-${r._id}`,
          type: "Reward Issued",
          entity: r.title,
          description: `Issued to: ${r.email}`,
          timestamp: r.createdAt || new Date().toISOString(),
          icon: Gift,
          colorClass: "text-amber-600 bg-amber-50 border-amber-100"
        }));
      }

      // Sort chronological (newest first) and update state
      compiledLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setLogs(compiledLogs);

    } catch (error) {
      toast.error(error.message);
      console.error("Error fetching logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getLogData();
  }, []);

  // --- FILTERING & PAGINATION ---
  const filteredLogs = filterType === "All" ? logs : logs.filter(log => log.type === filterType);
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / logsPerPage));
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage);

  // --- CSV EXPORT FUNCTIONALITY ---
  const exportToCSV = () => {
    if (filteredLogs.length === 0) return;

    // CSV Headers
    const headers = ["Action Type", "Entity/User", "Details", "Date & Time"];
    
    // Map data to CSV format (escaping quotes and commas)
    const csvRows = filteredLogs.map(log => {
      const safeDetails = `"${log.description.replace(/"/g, '""')}"`; // Escape quotes
      const formattedDate = new Date(log.timestamp).toLocaleString().replace(/,/g, ''); // Remove commas from date
      
      return `${log.type},${log.entity},${safeDetails},${formattedDate}`;
    });

    // Combine headers and rows
    const csvContent = [headers.join(","), ...csvRows].join("\n");
    
    // Create downloadable blob
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `system_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Common scrollbar styling
  const customScrollbarClasses = "overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

  return (
    <div className={`flex h-screen w-full ${theme.appBg} ${theme.textMain} font-sans overflow-hidden`}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className={`flex-1 bg-slate-50 ${customScrollbarClasses} flex flex-col`}>
        
        {/* Mobile Header */}
        <div className="lg:hidden p-4 pb-0 flex justify-between items-center shrink-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`flex items-center gap-2 ${theme.textMuted} hover:text-black hover:bg-zinc-100 ${theme.cardBg} border ${theme.border} px-3 py-2 rounded-lg shadow-sm transition-all`}
          >
            <Menu size={20} />
            <span className="text-sm font-medium">Menu</span>
          </button>
        </div>

        {/* Main Content Container */}
        <div className="p-6 max-w-7xl mx-auto w-full space-y-6 pb-12 flex-1 flex flex-col">
          
          {/* Top Bar: Title & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 shrink-0">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">System Logs</h1>
              <p className="text-zinc-500 text-sm mt-1">Comprehensive audit trail of all enterprise activities.</p>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl text-sm font-semibold text-zinc-700 outline-none cursor-pointer shadow-sm"
              >
                {filterOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>

              <button 
                onClick={exportToCSV}
                disabled={filteredLogs.length === 0}
                className="flex-1 sm:flex-none px-4 py-2 bg-black hover:bg-zinc-800 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={16} /> Export CSV
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className={`${theme.cardBg} rounded-2xl border ${theme.border} shadow-sm overflow-hidden flex flex-col flex-1`}>
            <div className={`overflow-x-auto ${customScrollbarClasses} flex-1`}>
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-zinc-50/80 border-b border-zinc-100 sticky top-0 backdrop-blur-sm z-10">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase text-zinc-500 w-16">Event</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase text-zinc-500">Action Type</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase text-zinc-500">Entity / User</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase text-zinc-500 hidden md:table-cell">Details</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase text-zinc-500 text-right">Date & Time</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {isLoading ? (
                    <tr>
                      <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-999">
                        <div className="rounded-xl bg-white/70 shadow-xl px-6 py-5 flex items-center gap-3">
                          <RefreshCw className="animate-spin text-slate-700" size={22} />
                          <span className="text-sm font-semibold text-slate-800"> Loading... </span>
                        </div>
                      </div>
                    </tr>
                  ) : paginatedLogs.length > 0 ? (
                    paginatedLogs.map((log) => {
                      const LogIcon = log.icon;
                      return (
                        <tr key={log.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${log.colorClass}`}>
                              <LogIcon size={18} />
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-zinc-900">{log.type}</td>
                          <td className="px-6 py-4 text-sm text-zinc-700">{log.entity}</td>
                          <td className="px-6 py-4 hidden md:table-cell text-xs text-zinc-500 max-w-xs truncate">{log.description}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 text-zinc-500">
                              <Clock size={14} />
                              <span className="text-xs font-semibold">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-sm text-zinc-500 font-medium">
                        No system logs match the current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center p-4 border-t border-zinc-100 bg-white">
              <span className="text-xs text-zinc-500 font-medium">
                Page {currentPage} of {totalPages}
              </span>

              <div className="flex gap-2">
                <button disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-4 py-1.5 border border-zinc-200 hover:bg-zinc-50 rounded-lg text-sm font-medium disabled:opacity-40 disabled:hover:bg-transparent transition-colors" >
                  Previous
                </button>
                <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-4 py-1.5 border border-zinc-200 hover:bg-zinc-50 rounded-lg text-sm font-medium disabled:opacity-40 disabled:hover:bg-transparent transition-colors" >
                  Next
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default SystemLogs;