import React, { useEffect, useState } from "react";
import { Menu, Trophy, Search, Filter, Calendar, Award, CheckCircle2, Globe, RefreshCw, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar";
import axios from "axios";
import { toast } from "../ui/Toaster";

const EmployeeRewards = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [rewards, setRewards] = useState([]);
  const [myRewards, setMyRewards] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Filter");

  // --- LOGIC STATES ---
  const [userPoints, setUserPoints] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);

  // --- NEW: PAGINATION STATES FOR GLOBAL GALLERY ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const getRewards = async () => {
    try {
      setLoading(true);

      const token = sessionStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const res = await axios.get(
        `${import.meta.env.VITE_API_KEY}/reward?page=${currentPage}&limit=${itemsPerPage}`,
        config
      );

      const role_check = await axios.get(
        `${import.meta.env.VITE_API_KEY}/check-role`,
        config
      );

      const allRewards = res.data.reward || [];
      const user = role_check.data.user;

      setRewards(allRewards);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setMyRewards(allRewards.filter(r => r.email === user.email));
      setUserPoints(user.points || 0);
      setCurrentUserId(user._id);
    } catch (error) {
      if (error?.response?.status === 401) {
        sessionStorage.removeItem("token");
        navigate("/");
        return;
      }
      toast.error(error?.response?.data?.message || "Failed to Fetch Rewards Data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRewards();
  }, [currentPage, itemsPerPage]);

  // --- NEW: Reset page to 1 when search or category changes ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, itemsPerPage]);

  // --- ACTIONS LOGIC ---
  const handleAcceptReward = async (rewardId) => {
    const rewardToAccept = myRewards.find(r => r._id === rewardId);
    if (!rewardToAccept) return;

    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const res = await axios.put(
        `${import.meta.env.VITE_API_KEY}/reward/${rewardId}`,
        { status: "redeemed" },
        config
      );

      const rewardPoints = res.data.reward.points || 0;
      const newBalance = userPoints + rewardPoints;

      await axios.put(
        `${import.meta.env.VITE_API_KEY}/${currentUserId}`,
        { points: newBalance },
        config
      );

      setUserPoints(newBalance);

      setMyRewards(prev =>
        prev.map(r =>
          r._id === rewardId
            ? { ...r, isAccepted: true, status: 'redeemed' }
            : r
        )
      );
      toast.success("Rewards Accepted Successfully");
    } catch (error) {
      if (error?.response?.status === 401) {
        sessionStorage.removeItem("token");
        navigate("/");
        return;
      }
      toast.error(error?.response?.data?.message || "Failed to Accept Reward");
    } finally {
      setLoading(false);
    }
  };

  // --- FILTERING LOGIC ---
  const categories = ["Filter", ...new Set(rewards.map(r => r.category).filter(Boolean))];

  const filterLogic = (list) => {
    return list.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "Filter" || r.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const myPendingRewards = myRewards.filter(r => r.status !== 'redeemed'); 
  const myAcceptedRewards = myRewards.filter(r => r.status === 'redeemed');

  const filteredPendingRewards = filterLogic(myPendingRewards);
  const filteredAcceptedRewards = filterLogic(myAcceptedRewards);
  const filteredAllRewards = filterLogic(rewards);

  // Keep count logic for badges
  const myTotalCount = myAcceptedRewards.length;

  // --- NEW: PAGINATION LOGIC ---
  const currentGlobalRewards = filteredAllRewards;

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
    <div className={`flex h-dvh w-full bg-slate-50 font-sans selection:bg-slate-900 selection:text-white overflow-hidden`}>
      <EmployeeSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {loading && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-999">
          <div className="rounded-xl bg-white/70 shadow-xl px-6 py-5 flex items-center gap-3">
            <RefreshCw className="animate-spin text-slate-700" size={22} />
            <span className="text-sm font-semibold text-slate-800"> Loading... </span>
          </div>
        </div>
      )}
      <main className="flex-1 overflow-y-auto scroll-smooth">
        {/* Mobile Nav */}
        <div className="lg:hidden p-4 flex justify-between items-center bg-white border-b border-slate-200">
          <button onClick={() => setIsSidebarOpen(true)} className="flex items-center gap-2 text-slate-600 px-3 py-2 rounded-lg border border-slate-200 bg-white">
            <Menu size={18} /> <span className="text-sm font-medium">Menu</span>
          </button>
        </div>

        <div className="p-6 max-w-7xl w-full mx-auto">
          
          {/* 1. HEADER SECTION */}
          <header className="bg-black rounded-xl p-8 mb-8 relative overflow-hidden text-white">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-white/10 rounded-md">
                    <Trophy className="text-white" size={16} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Performance Dashboard</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Rewards & Recognition</h1>
                <p className="text-slate-400 text-sm max-w-md">Track your milestones and explore organizational rewards.</p>
              </div>

              <div className="flex gap-8 border-l border-white/10 pl-0 md:pl-8">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase mb-1">My Points</p>
                  <p className="text-3xl font-bold">{userPoints.toLocaleString()}<span className="text-sm ml-1 text-slate-500">pts</span></p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase mb-1">Badges Earned</p>
                  <p className="text-3xl font-bold text-center">{myTotalCount}</p>
                </div>
              </div>
            </div>
          </header>

          {/* 2. SEARCH & CONTROLS */}
          <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between">
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Find a reward by title..."
                className="w-full pl-10 py-3 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-sm shadow-sm"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-48">
                <select 
                  className="w-full appearance-none pl-4 py-3.5 bg-white border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider outline-none hover:bg-slate-50 cursor-pointer transition-all shadow-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
              </div>
            </div>
          </div>

          {/* 3. SECTION: PENDING REWARDS */}
          {filteredPendingRewards.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-6 w-1 bg-orange-400 rounded-full"></div>
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">Action Required: Accept Rewards</h2>
                <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-[11px] font-bold rounded-full">{filteredPendingRewards.length}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPendingRewards.map((reward) => (
                  <div key={reward._id} className="group bg-white border-2 border-orange-100 hover:border-orange-300 rounded-xl p-5 transition-all shadow-sm flex flex-col h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-linear-to-br from-orange-100 to-transparent rounded-bl-full opacity-50"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border bg-orange-50 border-orange-200 text-orange-700">
                        <CheckCircle2 size={13} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Pending</span>
                      </div>
                      <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                        <Calendar size={12} /> {new Date(reward.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mb-5 relative z-10">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{reward.category || 'General'}</p>
                      <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2">{reward.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2">{reward.description}</p>
                    </div>
                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between relative z-10">
                      <div>
                        <span className="text-[12px] font-bold text-slate-400 block">Value</span>
                        <span className="text-xl font-bold text-slate-900">+{reward.points || 0} <span className="text-xs font-bold text-slate-400">pts</span></span>
                      </div>
                      <button 
                        onClick={() => handleAcceptReward(reward._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-orange-600 transition-all shadow-md active:scale-95"
                      >
                        Accept <Award size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 4. SECTION: MY ACHIEVEMENTS */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-6 w-1 bg-slate-300 rounded-full"></div>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">My Achievements</h2>
              <span className="ml-2 px-2 py-0.5 bg-slate-200 text-slate-700 text-[11px] font-bold rounded-full">{filteredAcceptedRewards.length}</span>
            </div>

            {filteredAcceptedRewards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredAcceptedRewards.map((reward) => (
                  <div key={reward._id} className="group bg-white border-dashed border border-white hover:border-black rounded-xl p-5 transition-all flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border bg-blue-50 border-blue-100 text-blue-700">
                        <CheckCircle2 size={13} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Accepted</span>
                      </div>
                      <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                        <Calendar className="group-hover:text-black" size={12} /> 
                        <span className="group-hover:text-black">
                          {new Date(reward.createdAt).toLocaleDateString()}
                        </span>
                      </span>
                    </div>
                    <div className="mb-5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{reward.category || 'General'}</p>
                      <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2">{reward.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2">{reward.description}</p>
                    </div>
                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div>
                        <span className="text-[12px] font-bold text-slate-400 block">Value Awarded</span>
                        <span className="text-xl font-bold text-slate-900">+{reward.points || 0} <span className="text-xs font-bold text-slate-400">pts</span></span>
                      </div>
                      <div className="p-2.5 bg-slate-100 text-slate-400 rounded-lg">
                        <Award className="group-hover:text-black" size={18} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-white hover:border-dashed hover:border-black rounded-xl py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <Award size={24} />
                </div>
                <h3 className="font-bold text-xl text-slate-900">No accepted rewards yet</h3>
                <p className="text-slate-500 text-md">Rewards you accept will appear here.</p>
              </div>
            )}
          </section>

          <hr className="border-slate-200 mb-12" />

          {/* 5. SECTION: GLOBAL REWARDS GALLERY */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-6 w-1 bg-slate-800 rounded-full"></div>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">Global Rewards Gallery</h2>
              <span className="ml-2 px-2 py-0.5 bg-slate-200 text-slate-700 text-[11px] font-bold rounded-full">{filteredAllRewards.length}</span>
            </div>

            {/* CHANGED: map over currentGlobalRewards instead of filteredAllRewards */}
            {currentGlobalRewards.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                  {currentGlobalRewards.map((reward) => (
                    <div key={reward._id} className="group bg-white border hover:border-black border-dashed border-slate-200 rounded-xl p-5 transition-all hover:shadow-md flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border bg-slate-50 border-slate-100 text-slate-600">
                          <Globe className="group-hover:text-black" size={13} />
                          <span className="text-[10px] font-bold uppercase tracking-wider group-hover:text-black">Available</span>
                        </div>
                        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                          <Calendar className="group-hover:text-black" size={12} />
                          <span className="group-hover:text-black"> 
                            {new Date(reward.createdAt).toLocaleDateString()}
                          </span>
                        </span>
                      </div>
                      <div className="mb-5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{reward.category || 'General'}</p>
                        <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2">{reward.title}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2">{reward.description}</p>
                      </div>
                      <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div>
                          <span className="text-[12px] font-bold text-slate-400 block">Reward Value</span>
                          <span className="text-xl font-bold text-slate-900">{reward.points || 0} <span className="text-xs font-bold text-slate-400">pts</span></span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-lg text-slate-400">
                          <Trophy className="group-hover:text-black" size={18} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* NEW: Pagination Controls (Only show if multiple pages exist) */}
                {totalPages > 1 && (
                  <div className="flex flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Rows per page</span>
                      <div className="relative">
                        <select 
                          value={itemsPerPage} 
                          onChange={(e) => setItemsPerPage(Number(e.target.value))}
                          className="appearance-none bg-white border border-slate-200 text-sm font-bold rounded-lg pl-3 pr-8 py-2 outline-none focus:border-slate-900 transition-colors cursor-pointer shadow-sm"
                        >
                          <option value={20}>20</option>
                          <option value={30}>30</option>
                          <option value={40}>40</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-black hover:text-black disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-all shadow-sm">
                        <ChevronLeft size={16} />
                      </button>

                      <div className="flex items-center gap-1">
                        {getPageNumbers().map((page, index) => (
                          page === "..." ? (
                            <span key={index} className="w-6 flex justify-center text-slate-400 font-bold text-sm">...</span>
                          ) : (
                            <button
                              key={index}
                              onClick={() => setCurrentPage(page)}
                              className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-all shadow-sm
                                ${currentPage === page 
                                  ? "bg-black text-white border border-black" 
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
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-black hover:text-black disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-all shadow-sm"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-white border hover:border-black border-dashed border-slate-200 rounded-xl">
                <Globe className="mx-auto mb-4 text-slate-400" size={40} />
                <p className="text-md text-slate-600">No results found for this criteria.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default EmployeeRewards;