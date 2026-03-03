import React, { useState } from "react";
import { Menu, Search, Filter, Edit2, Trash2, UserPlus, Shield, ShieldCheck, MoreVertical } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { theme } from "../../components/theme";

/* ================================
   Mock Data
================================ */
const initialAdmins = [
  { id: 1, name: "Sarah Jenkins", email: "sarah.j@enterprise.com", role: "Superadmin", status: "Active", lastLogin: "2 mins ago", initials: "SJ", color: "bg-blue-100 text-blue-700" },
  { id: 2, name: "Michael Chen", email: "m.chen@enterprise.com", role: "Admin", status: "Active", lastLogin: "5 hours ago", initials: "MC", color: "bg-emerald-100 text-emerald-700" },
  { id: 3, name: "Alex Morgan", email: "alex.m@enterprise.com", role: "Admin", status: "Inactive", lastLogin: "2 days ago", initials: "AM", color: "bg-purple-100 text-purple-700" },
  { id: 4, name: "David Wilson", email: "david.w@enterprise.com", role: "Admin", status: "Active", lastLogin: "1 week ago", initials: "DW", color: "bg-amber-100 text-amber-700" },
  { id: 5, name: "Elena Rostova", email: "elena.r@enterprise.com", role: "Superadmin", status: "Active", lastLogin: "Just now", initials: "ER", color: "bg-rose-100 text-rose-700" },
];

/* ================================
   Main Component
================================ */
const ViewAdmins = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // Tailwind arbitrary variants for the custom scrollbar (no <style> tag needed)
  const customScrollbar = "overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

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
            <button className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-black hover:bg-zinc-800 shadow-md transition-colors w-full sm:w-auto">
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
                placeholder="Search by name or email..." 
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
                <option value="Superadmin">Superadmin</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Data Table */}
          <div className={`${theme.cardBg} border ${theme.border} rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col`}>
            <div className={`overflow-x-auto ${customScrollbar}`}>
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className={`bg-zinc-50/50 border-b ${theme.border}`}>
                  <tr>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Admin User</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Role</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Status</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Last Login</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {initialAdmins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-zinc-50/80 transition-colors group">
                      
                      {/* User Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${admin.color}`}>
                            {admin.initials}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{admin.name}</p>
                            <p className={`text-xs ${theme.textMuted}`}>{admin.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          admin.role === 'Superadmin' 
                            ? 'bg-black text-white border-black' 
                            : `bg-zinc-100 text-slate-700 ${theme.border}`
                        }`}>
                          {admin.role === 'Superadmin' ? <ShieldCheck size={12} /> : <Shield size={12} />}
                          {admin.role}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${admin.status === 'Active' ? 'bg-emerald-500' : 'bg-zinc-400'}`}></div>
                          <span className={`text-xs font-bold ${admin.status === 'Active' ? 'text-slate-900' : theme.textMuted}`}>
                            {admin.status}
                          </span>
                        </div>
                      </td>

                      {/* Last Login */}
                      <td className={`px-6 py-4 text-xs font-medium ${theme.textMuted}`}>
                        {admin.lastLogin}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                          <button className={`p-2 rounded-md hover:bg-zinc-200 text-slate-600 hover:text-black transition-colors tooltip-trigger`} title="Edit Admin">
                            <Edit2 size={16} />
                          </button>
                          <button className={`p-2 rounded-md hover:bg-rose-100 text-slate-600 hover:text-rose-600 transition-colors tooltip-trigger`} title="Delete Admin">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        {/* Mobile visible fallback */}
                        <button className="lg:hidden p-2 text-slate-400 hover:text-black">
                          <MoreVertical size={16} />
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Empty State (Optional: shown if filtered out) */}
              {initialAdmins.length === 0 && (
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