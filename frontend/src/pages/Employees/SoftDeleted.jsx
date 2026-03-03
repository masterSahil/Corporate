import React, { useState } from "react";
import { Menu, Search, Filter, Trash2, ArchiveRestore, Info, MoreVertical, UserX, ShieldAlert } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { theme } from "../../components/theme";

/* ================================
   Mock Data
================================ */
const initialDeletedRecords = [
  { id: 1, name: "Alex Morgan", email: "alex.m@enterprise.com", type: "Admin", deletedAt: "Oct 24, 2023", initials: "AM", color: "bg-purple-100 text-purple-700" },
  { id: 2, name: "Marcus Johnson", email: "m.johnson@enterprise.com", type: "Employee", deletedAt: "Nov 02, 2023", initials: "MJ", color: "bg-blue-100 text-blue-700" },
  { id: 3, name: "Elena Rostova", email: "elena.r@enterprise.com", type: "Superadmin", deletedAt: "Nov 15, 2023", initials: "ER", color: "bg-rose-100 text-rose-700" },
  { id: 4, name: "David Chen", email: "d.chen@enterprise.com", type: "Employee", deletedAt: "Nov 18, 2023", initials: "DC", color: "bg-emerald-100 text-emerald-700" },
];

/* ================================
   Main Component
================================ */
const SoftDeleted = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  // Tailwind arbitrary variants for the custom scrollbar
  const customScrollbar = "[&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

  // Filter logic
  const filteredRecords = initialDeletedRecords.filter(record => {
    const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase()) || record.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "All" || record.type.includes(typeFilter);
    return matchesSearch && matchesType;
  });

  return (
    <div className={`flex h-screen w-full ${theme.appBg} ${theme.textMain} font-sans overflow-hidden selection:bg-zinc-200 selection:text-zinc-900`}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className={`flex-1 bg-slate-50 overflow-y-auto ${customScrollbar} flex flex-col`}>
        
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
              <p className={`text-base ${theme.textMuted} mt-2`}>Review, restore, or permanently delete removed records.</p>
            </div>
            <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 shadow-sm transition-colors w-full sm:w-auto">
              <Trash2 size={18} />
              Empty Trash
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
                Items in the trash bin are kept securely and indefinitely until you choose to permanently delete them. Restoring a record will return it to active status with all previous permissions intact.
              </p>
            </div>
          </div>

          {/* Toolbar: Search & Filter */}
          <div className={`flex flex-col md:flex-row gap-4 mb-8 p-5 rounded-xl border ${theme.border} ${theme.cardBg} shadow-sm`}>
            {/* Search */}
            <div className="relative flex-1">
              <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted} pointer-events-none`} />
              <input 
                type="text" 
                placeholder="Search deleted records..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 bg-zinc-50 border ${theme.border} rounded-lg text-sm text-slate-900 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
              />
            </div>
            
            {/* Type Filter */}
            <div className="relative md:w-56">
              <Filter size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted} pointer-events-none`} />
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className={`w-full pl-11 pr-10 py-3 bg-zinc-50 border ${theme.border} rounded-lg text-sm text-slate-900 outline-none focus:border-black focus:ring-1 focus:ring-black appearance-none cursor-pointer transition-all`}
              >
                <option value="All">All Records</option>
                <option value="Employee">Employees</option>
                <option value="Admin">Admins</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Data Table Card */}
          <div className={`${theme.cardBg} border ${theme.border} rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col`}>
            <div className={`overflow-x-auto ${customScrollbar}`}>
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className={`bg-zinc-50/80 border-b ${theme.border}`}>
                  <tr>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Record Details</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Record Type</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Deleted On</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-zinc-50/50 transition-colors group">
                      
                      {/* Record Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold opacity-60 grayscale group-hover:grayscale-0 transition-all ${record.color}`}>
                            {record.initials}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm mb-0.5 line-through decoration-slate-300">{record.name}</p>
                            <p className={`text-xs ${theme.textMuted}`}>{record.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Record Type Badge */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-zinc-100 text-slate-600 ${theme.border}`}>
                          {record.type.includes("Admin") ? <ShieldAlert size={12} /> : <UserX size={12} />}
                          {record.type}
                        </span>
                      </td>

                      {/* Deleted Date */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-700">{record.deletedAt}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                          <button className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-sm`} title="Restore Record">
                            <ArchiveRestore size={14} /> Restore
                          </button>
                          <button className={`p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 hover:text-rose-700 transition-colors tooltip-trigger`} title="Permanently Delete">
                            <Trash2 size={18} />
                          </button>
                        </div>
                        {/* Mobile visible fallback */}
                        <button className="lg:hidden p-2 text-slate-400 hover:text-black transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Empty State */}
              {filteredRecords.length === 0 && (
                <div className="p-16 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center mb-4">
                    <Trash2 size={24} className={theme.textMuted} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Trash is empty</h3>
                  <p className={`text-sm ${theme.textMuted} mt-1 max-w-sm`}>No deleted records found matching your current criteria.</p>
                  {searchTerm && (
                    <button 
                      onClick={() => { setSearchTerm(""); setTypeFilter("All"); }}
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

export default SoftDeleted;