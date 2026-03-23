import React, { useEffect, useState } from "react";
import { Menu, Search, Edit2, Trash2, Plus, Gift, Tag, Award, Mail, RefreshCw } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { theme } from "../../components/Theme";
import axios from "axios"
import { useNavigate } from "react-router-dom";
import { toast } from "../../ui/Toaster";

const rewardColors = [
  "bg-amber-100 text-amber-700",
  "bg-purple-100 text-purple-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
];

const ViewRewards = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [initialRewards, setInitialRewards] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  
  const getData = async() => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_KEY}/reward`, {withCredentials: true});
      setInitialRewards(res.data.reward)
    } catch (error) {
      toast.error(error)
      console.log(error)
    } finally {
      setLoading(false);
    }
  }

  const softDelete = async(id) => {
    try {
      setLoading(true);
      await axios.put(`${import.meta.env.VITE_API_KEY}/reward-soft-delete/${id}`, {isDeleted: true, deletedAt: new Date()}, {withCredentials: true})

      getData();
      toast.success("Reward Deleted Successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to Delete Reward");
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getData();
  }, [])

  // Tailwind arbitrary variants for the custom scrollbar
  const customScrollbar = "[&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

  // Filter logic
  const filteredRewards = initialRewards.filter(reward => {
    const matchesSearch = reward.title.toLowerCase().includes(searchTerm.toLowerCase()) || reward.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || reward.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`flex h-screen w-full ${theme.appBg} ${theme.textMain} font-sans overflow-hidden selection:bg-zinc-200 selection:text-zinc-900`}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className={`flex-1 bg-slate-50 overflow-y-auto ${customScrollbar} flex flex-col`}>
        
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

        <div className="p-6 max-w-7xl mx-auto w-full flex-1 flex flex-col">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-8">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Issued Rewards</h1>
              <p className={`text-base ${theme.textMuted} mt-2`}>Manage, update, and track employee incentives.</p>
            </div>
            <button onClick={()=>navigate('/rewards/add')} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-black hover:bg-zinc-800 shadow-lg transition-colors w-full sm:w-auto">
              <Plus size={18} />
              Issue Reward
            </button>
          </div>

          {/* Toolbar: Search & Filter */}
          <div className={`flex flex-col md:flex-row gap-4 mb-8 p-5 rounded-xl border ${theme.border} ${theme.cardBg} shadow-sm`}>
            {/* Search */}
            <div className="relative flex-1">
              <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted} pointer-events-none`} />
              <input 
                type="text" 
                placeholder="Search by reward title or User ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 bg-zinc-50 border ${theme.border} rounded-lg text-sm text-slate-900 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
              />
            </div>
            
            {/* Category Filter */}
            <div className="relative md:w-64">
              <Tag size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted} pointer-events-none`} />
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`w-full pl-11 pr-10 py-3 bg-zinc-50 border ${theme.border} rounded-lg text-sm text-slate-900 outline-none focus:border-black focus:ring-1 focus:ring-black appearance-none cursor-pointer transition-all`}
              >
                <option value="All">All Categories</option>
                <option value="Gift Card">Gift Card</option>
                <option value="Merchandise">Merchandise</option>
                <option value="Experience">Experience</option>
                <option value="Digital">Digital</option>
                <option value="Travel">Travel</option>
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
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Reward Details</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Category</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Recipient (Email ID)</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Status</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredRewards.map((reward, index) => (
                    <tr key={index} className="hover:bg-zinc-50/50 transition-colors group">
                      
                      {/* Reward Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${rewardColors[index % rewardColors.length]}`}>
                            <Gift size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm mb-0.5">{reward.title}</p>
                            <p className={`text-xs ${theme.textMuted} truncate max-w-50`}>{reward.description}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-zinc-50 text-slate-700 ${theme.border}`}>
                          {reward.category}
                        </span>
                      </td>

                      {/* Recipient / User ID */}
                      <td className="px-6 py-4">
                        {reward.email ? (
                          <div className="flex items-center gap-2">
                            <Mail size={16} />
                            <span className="font-bold text-slate-900 tracking-wide">{reward.email}</span>
                          </div>
                        ) : (
                          <span className={`text-xs font-semibold ${theme.textMuted} italic`}>
                            Not Assigned
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600">
                              <Award size={14} /> {reward.status}
                            </span>
                          {reward.date !== "-" && (
                            <span className={`text-[10px] ${theme.textMuted}`}>{reward.date}</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={()=>navigate(`/rewards/update/${reward._id}`)} className={`p-2 rounded-lg hover:bg-zinc-100 text-slate-500 hover:text-black transition-colors tooltip-trigger`} title="Edit Reward">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={()=>softDelete(reward._id)} className={`p-2 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors tooltip-trigger`} title="Delete Reward">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Empty State */}
              {filteredRewards.length === 0 && (
                <div className="p-16 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center mb-4">
                    <Search size={24} className={theme.textMuted} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">No rewards found</h3>
                  <p className={`text-sm ${theme.textMuted} mt-1 max-w-sm`}>We couldn't find any rewards matching your current search or filter criteria.</p>
                  <button 
                    onClick={() => { setSearchTerm(""); setCategoryFilter("All"); }}
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

export default ViewRewards;