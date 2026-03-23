import React, { useEffect, useState } from "react";
import { Menu, Search, LayoutGrid, Trash2, ArchiveRestore, Info, RefreshCw, Gift, Loader2, EyeOff, Eye } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { theme } from "../../components/Theme";
import axios from "axios";
import { toast } from "../../ui/Toaster";

const SoftDeletedRewards = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [deletedRewards, setDeletedRewards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uiLoader, setUiLoader] = useState(false);
  // --- Modal States ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const getDeletedData = async () => {
    try {
      setUiLoader(true);
      const res = await axios.get(`${import.meta.env.VITE_API_KEY}/reward-deleted`, { withCredentials: true });
      setDeletedRewards(res.data.reward);
    } catch (error) {
      toast.error(error);
      console.log(error);
    } finally {
      setLoading(false); setUiLoader(false);
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

  // Restoring a Reward
  const handleRestore = async (id) => {
    try {
      setUiLoader(true);
      await axios.put(`${import.meta.env.VITE_API_KEY}/reward-restore/${id}`, {isDeleted: false, deletedAt: Date.now()}, { withCredentials: true });
      getDeletedData();
      toast.success("Rewards Restored Successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to Restore Reward");
    } finally {
      setUiLoader(false);
    }
  };

  // Permanent Deletion
  const handlePermanentDelete = async (e) => {
    e.preventDefault(); 
    if (!deletePassword) return;

    try {
      setLoading(true);
      await axios.post(`${import.meta.env.VITE_API_KEY}/hard-delete-reward/${deleteId}`, { password: deletePassword }, { withCredentials: true });
      getDeletedData();
      toast.success("Permanently Deleted Successfully");
      
      setShowDeleteModal(false);
      setDeleteId(null);
      setDeletePassword("");
      setShowPassword(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Tailwind scrollbar
  const customScrollbar = "overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

  // Dynamically extract unique categories
  const uniqueCategories = ["All", ...new Set(deletedRewards.map(r => r.category).filter(Boolean))];

  // Filter Logic
  const filteredRewards = deletedRewards.filter((reward) => {
    const matchesSearch = 
      reward.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      reward.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || reward.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`flex h-screen w-full ${theme.appBg} ${theme.textMain} font-sans overflow-hidden selection:bg-zinc-200 selection:text-zinc-900`}>
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
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Reward Trash Bin</h1>
              <p className={`text-base ${theme.textMuted} mt-2`}>Review, restore, or permanently delete removed employee rewards.</p>
            </div>
            <button onClick={getDeletedData} className="group flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all w-full sm:w-auto disabled:opacity-70 disabled:cursor-not-allowed" >
                <RefreshCw size={18} className="group-hover:rotate-180 text-slate-500 transition-all duration-500 ease-in-out" />
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
                Rewards in the trash bin are hidden from employee profiles but data is kept securely until permanently deleted. Restoring a record will return it to active status.
              </p>
            </div>
          </div>

          {/* Toolbar: Search & Filter */}
          <div className={`flex flex-col md:flex-row gap-4 mb-8 p-5 rounded-xl border ${theme.border} ${theme.cardBg} shadow-sm`}>
            <div className="relative flex-1">
              <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted} pointer-events-none`} />
              <input 
                type="text" 
                placeholder="Search deleted rewards by title or assigned email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 bg-zinc-50 border ${theme.border} rounded-lg text-sm text-slate-900 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
              />
            </div>
            
            <div className="relative md:w-64">
              <LayoutGrid size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted} pointer-events-none`} />
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`w-full pl-11 pr-10 py-3 bg-zinc-50 border ${theme.border} rounded-lg text-sm text-slate-900 outline-none focus:border-black focus:ring-1 focus:ring-black appearance-none cursor-pointer transition-all`}
              >
                {uniqueCategories.map((category, idx) => (
                  <option key={idx} value={category}>
                    {category === "All" ? "All Categories" : category}
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
              <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-2xl ring-1 ring-black/5">
                <Loader2 className="animate-spin text-slate-900" size={20} />
                <span className="text-sm font-medium text-slate-700">
                  Permanently deleting...
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
                    <th className={`px-6 py-4 text-[11px] text-center font-bold uppercase tracking-wider ${theme.textMuted}`}>Reward Info</th>
                    <th className={`px-6 py-4 text-[11px] text-center font-bold uppercase tracking-wider ${theme.textMuted}`}>Category & Assignee</th>
                    <th className={`px-6 py-4 text-[11px] text-center font-bold uppercase tracking-wider ${theme.textMuted}`}>Description</th>
                    <th className={`px-6 py-4 text-[11px] text-center font-bold uppercase tracking-wider ${theme.textMuted}`}>Deleted On</th>
                    <th className={`px-6 py-4 text-[11px] text-center font-bold uppercase tracking-wider ${theme.textMuted}`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredRewards.map((reward) => {
                    const id = reward._id?.$oid || reward._id;
                    
                    return (
                      <tr key={id} className="hover:bg-zinc-50/50 transition-colors group">
                        
                        {/* Reward Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 shrink-0">
                                <Gift size={20} className="opacity-50 group-hover:opacity-100 group-hover:text-black transition-all" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm mb-0.5 capitalize line-through decoration-slate-300">{reward.title}</p>
                              <p className={`text-xs ${theme.textMuted}`}>ID: #{id.slice(-6).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>

                        {/* Category & Email */}
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 text-sm mb-0.5">{reward.category}</p>
                          <p className={`text-xs ${theme.textMuted}`}>{reward.email || "Unassigned"}</p>
                        </td>

                        {/* Description */}
                        <td className="px-6 py-4">
                          <p className={`text-sm ${theme.textMuted} truncate max-w-50`} title={reward.description}>
                            {reward.description || "No description provided."}
                          </p>
                        </td>

                        {/* Deleted Date */}
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-slate-700">
                            {formatDate(reward.deletedAt)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3 ">
                            <button onClick={() => handleRestore(id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-sm`} title="Restore Reward">
                              <ArchiveRestore size={14} /> Restore
                            </button>
                            <button onClick={() => { setDeleteId(id); setShowDeleteModal(true); }}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-500 hover:bg-rose-100 hover:text-rose-700 border transition-colors shadow-sm`} title="Permanently Delete Reward" >
                              <Trash2 size={18} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Custom Prompt Modal with Eye Icon */}
              {showDeleteModal && (
                <div className="fixed inset-0 z-100 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                  <form onSubmit={handlePermanentDelete} className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 border border-zinc-200">
                    <h2 className="text-lg font-bold text-rose-600 flex items-center gap-2 mb-2">
                      <Trash2 size={20} /> Confirm Deletion
                    </h2>
                    <p className="text-sm text-slate-600 mb-5">
                      Are you sure you want to permanently delete this reward? This cannot be undone. Enter your password to confirm:
                    </p>

                    <div className="relative mb-6">
                      <input type={showPassword ? "text" : "password"} placeholder="Enter password..." 
                        value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)}
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
                        {loading ? "Deleting ..." : "Delete Permanently"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              {/* Empty State */}
              {filteredRewards.length === 0 && (
                <div className="p-16 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center mb-4">
                    <Trash2 size={24} className={theme.textMuted} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Trash is empty</h3>
                  <p className={`text-sm ${theme.textMuted} mt-1 max-w-sm`}>No deleted rewards found matching your current criteria.</p>
                  {searchTerm && (
                    <button 
                      onClick={() => { setSearchTerm(""); setCategoryFilter("All"); }}
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

export default SoftDeletedRewards;