import React, { useState } from "react";
import { Menu, Search, Filter, Edit2, Trash2, UserPlus, MoreVertical, Briefcase, Mail } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { theme } from "../../components/theme";

/* ================================
   Mock Data
================================ */
const initialEmployees = [
  { id: 1, name: "Jonathan Smith", email: "j.smith@enterprise.com", role: "Senior Engineer", department: "Engineering", type: "Full-time", status: "Active", initials: "JS", color: "bg-blue-100 text-blue-700" },
  { id: 2, name: "Maria Garcia", email: "m.garcia@enterprise.com", role: "Product Manager", department: "Operations", type: "Full-time", status: "Active", initials: "MG", color: "bg-emerald-100 text-emerald-700" },
  { id: 3, name: "Robert Chen", email: "r.chen@enterprise.com", role: "UI/UX Designer", department: "Marketing", type: "Contract", status: "Inactive", initials: "RC", color: "bg-purple-100 text-purple-700" },
  { id: 4, name: "Emily Taylor", email: "e.taylor@enterprise.com", role: "HR Specialist", department: "Human Resources", type: "Part-time", status: "Active", initials: "ET", color: "bg-amber-100 text-amber-700" },
  { id: 5, name: "David Wilson", email: "d.wilson@enterprise.com", role: "Sales Lead", department: "Sales", type: "Full-time", status: "Active", initials: "DW", color: "bg-rose-100 text-rose-700" },
];

/* ================================
   Main Component
================================ */
const ViewEmployees = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");

  // Tailwind arbitrary variants for the custom scrollbar (no <style> tag needed)
  const customScrollbar = "[&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

  // Filter logic
  const filteredEmployees = initialEmployees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === "All" || emp.department === departmentFilter;
    return matchesSearch && matchesDept;
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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-8">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Directory</h1>
              <p className={`text-base ${theme.textMuted} mt-2`}>View, update, and manage your workforce.</p>
            </div>
            <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-black hover:bg-zinc-800 shadow-lg transition-colors w-full sm:w-auto">
              <UserPlus size={18} />
              Add Employee
            </button>
          </div>

          {/* Toolbar: Search & Filter */}
          <div className={`flex flex-col md:flex-row gap-4 mb-8 p-5 rounded-xl border ${theme.border} ${theme.cardBg} shadow-sm`}>
            {/* Search */}
            <div className="relative flex-1">
              <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted} pointer-events-none`} />
              <input 
                type="text" 
                placeholder="Search employees by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 bg-zinc-50 border ${theme.border} rounded-lg text-sm text-slate-900 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
              />
            </div>
            
            {/* Department Filter */}
            <div className="relative md:w-64">
              <Briefcase size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted} pointer-events-none`} />
              <select 
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className={`w-full pl-11 pr-10 py-3 bg-zinc-50 border ${theme.border} rounded-lg text-sm text-slate-900 outline-none focus:border-black focus:ring-1 focus:ring-black appearance-none cursor-pointer transition-all`}
              >
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operations</option>
                <option value="Sales">Sales</option>
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
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Employee</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Role & Dept</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Type</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Status</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-zinc-50/50 transition-colors group">
                      
                      {/* Employee Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${emp.color}`}>
                            {emp.initials}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm mb-0.5">{emp.name}</p>
                            <div className={`flex items-center gap-1.5 text-xs ${theme.textMuted}`}>
                              <Mail size={12} /> {emp.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Department */}
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 text-sm mb-0.5">{emp.role}</p>
                        <p className={`text-xs ${theme.textMuted}`}>{emp.department}</p>
                      </td>

                      {/* Employment Type Badge */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          emp.type === 'Full-time' ? 'bg-zinc-100 text-slate-800 border-zinc-200' : 
                          emp.type === 'Part-time' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                          'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {emp.type}
                        </span>
                      </td>

                      {/* Status Indicator */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${emp.status === 'Active' ? 'bg-emerald-500' : 'bg-zinc-300'}`}></div>
                          <span className={`text-xs font-bold ${emp.status === 'Active' ? 'text-slate-900' : theme.textMuted}`}>
                            {emp.status}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                          <button className={`p-2 rounded-lg hover:bg-zinc-100 text-slate-500 hover:text-black transition-colors tooltip-trigger`} title="Edit Employee">
                            <Edit2 size={18} />
                          </button>
                          <button className={`p-2 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors tooltip-trigger`} title="Delete Employee">
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
              {filteredEmployees.length === 0 && (
                <div className="p-16 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center mb-4">
                    <Search size={24} className={theme.textMuted} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">No employees found</h3>
                  <p className={`text-sm ${theme.textMuted} mt-1 max-w-sm`}>We couldn't find anyone matching your current search or filter criteria.</p>
                  <button 
                    onClick={() => { setSearchTerm(""); setDepartmentFilter("All"); }}
                    className="mt-6 px-4 py-2 text-sm font-bold text-black border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default ViewEmployees;