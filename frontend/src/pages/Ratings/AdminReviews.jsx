import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Menu, RefreshCw, MessageSquare, Star, Search, Filter, Calendar, User, Package, X, Quote, ChevronDown, Check, ChevronLeft, ChevronRight, LayoutGrid, List } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { theme } from "../../components/Theme";
import { toast } from "../../ui/Toaster";

const AdminReview = () => {
  // --- STATE ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filtering & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRating, setSelectedRating] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Modal State
  const [selectedReview, setSelectedReview] = useState(null);

  // --- NEW: Pagination & View States ---
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage, setReviewsPerPage] = useState(10); // Default to 10
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState("table"); // "table" or "card"

  // --- DATA FETCHING ---
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");

      const res = await axios.get(`${import.meta.env.VITE_API_KEY}/rating-all?page=${currentPage}&limit=${reviewsPerPage}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setReviews(res.data.rating || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to Fetch Reviews");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [currentPage, reviewsPerPage]);

  // --- Reset page to 1 when search or filter changes ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedRating, reviewsPerPage]);

  // --- DERIVED DATA (SEARCH & FILTER) ---
  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) => {
      // 1. Search Logic (Checks review text, username, and product ID)
      const searchLower = searchQuery.toLowerCase();
      const reviewText = rev.review?.toLowerCase() || "";
      const username = rev.buyerId?.username?.toLowerCase() || "";
      const prodId = typeof rev.productId === 'string' ? rev.productId.toLowerCase() : (rev.productId?._id?.toLowerCase() || "");
      
      const matchesSearch = reviewText.includes(searchLower) || username.includes(searchLower) || prodId.includes(searchLower);

      // 2. Rating Filter Logic
      const matchesRating = selectedRating === "All" ? true : rev.rate === parseInt(selectedRating);

      return matchesSearch && matchesRating;
    });
  }, [reviews, searchQuery, selectedRating]);

  // --- Pagination Logic ---
  const currentReviews = filteredReviews;

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

  // --- HELPERS ---
  const formatDateTimeParts = (dateString) => {
    if (!dateString) return { formattedDate: "N/A", formattedTime: "" };
    const dateVal = typeof dateString === 'object' && dateString.$date ? dateString.$date : dateString;
    const date = new Date(dateVal);
    const formattedDate = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const formattedTime = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    return { formattedDate, formattedTime };
  };

  const renderStars = (rate) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} size={14} className={star <= rate ? "fill-black text-black" : "fill-zinc-200 text-zinc-200"} />
        ))}
      </div>
    );
  };

  // Stats
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? (reviews.reduce((acc, curr) => acc + curr.rate, 0) / totalReviews).toFixed(1) : 0;
  const fiveStarReviews = reviews.filter(r => r.rate === 5).length;

  const customScrollbarClasses = "overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

  // --- RENDER ---
  return (
    <div className={`flex h-dvh w-full ${theme.appBg} ${theme.textMain} font-sans overflow-hidden selection:bg-zinc-200 selection:text-zinc-900`}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className={`flex-1 bg-slate-50 ${customScrollbarClasses} flex flex-col relative`}>
        
        {/* Loader */}
        {loading && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-999">
            <div className="rounded-xl bg-white shadow-xl px-6 py-5 flex items-center gap-3 border border-zinc-100">
              <RefreshCw className="animate-spin text-slate-700" size={22} />
              <span className="text-sm font-semibold text-slate-800"> Loading Reviews... </span>
            </div>
          </div>
        )}

        {/* Mobile Header */}
        <div className="lg:hidden p-4 pb-0 flex justify-between items-center shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className={`flex items-center gap-2 ${theme.textMuted} hover:text-black hover:bg-zinc-100 ${theme.cardBg} border ${theme.border} px-3 py-2 rounded-lg shadow-sm transition-all`}>
            <Menu size={20} /> <span className="text-sm font-medium">Menu</span>
          </button>
        </div>

        <div className="p-6 max-w-7xl mx-auto w-full space-y-8 pb-12 flex-1 flex flex-col">
          
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Product Reviews</h1>
              <p className="text-zinc-500 text-sm mt-1">Monitor and manage customer feedback across the catalog.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto relative items-start sm:items-center">
              {/* Search */}
              <div className="relative flex-1 w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search reviews, product ID, user..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-72 pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all shadow-sm"
                />
              </div>

              {/* Filter Dropdown */}
              <div className="relative w-full sm:w-auto">
                <button onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`w-full sm:w-auto px-4 py-2.5 bg-white border ${isFilterOpen ? 'border-zinc-900 ring-1 ring-zinc-900' : 'border-zinc-200'} hover:border-zinc-300 rounded-md text-sm font-semibold text-zinc-700 flex items-center justify-between sm:justify-center gap-2 transition-all shadow-sm`}>
                  <div className="flex items-center gap-2">
                    <Filter size={18} /> 
                    <span>
                      {selectedRating === "All" ? "Filter" : `${selectedRating} Stars`}
                    </span>
                  </div>
                  <ChevronDown size={14} className="text-zinc-400" />
                </button>

                {isFilterOpen && (
                  <div className="absolute right-0 mt-2 w-full sm:w-40 bg-white border border-zinc-100 rounded-md shadow-lg z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
                    {["All", "5", "4", "3", "2", "1"].map((rating) => (
                      <button key={rating} onClick={() => { setSelectedRating(rating); setIsFilterOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-50 flex items-center justify-between">
                        <span className="font-medium text-zinc-700">
                          {rating === "All" ? "All Ratings" : `${rating} Stars`}
                        </span>
                        {selectedRating === rating && <Check size={14} className="text-zinc-900" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Toggle View Mode */}
              <div className={`flex w-full sm:w-auto bg-zinc-50 p-1 rounded-md border border-zinc-200 shrink-0`}>
                <button onClick={() => setViewMode("table")}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md flex items-center justify-center transition-all ${viewMode === "table" ? "bg-white shadow-sm text-black" : "text-zinc-500 hover:text-zinc-900"}`}
                  title="Table View" >
                  <List size={18} />
                </button>
                <button onClick={() => setViewMode("card")}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md flex items-center justify-center transition-all ${viewMode === "card" ? "bg-white shadow-sm text-black" : "text-zinc-500 hover:text-zinc-900"}`}
                  title="Card View" >
                  <LayoutGrid size={18} />
                </button>
              </div>

            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 shrink-0">
            <div className={`${theme.cardBg} p-6 rounded-lg border ${theme.border} shadow-sm flex items-center gap-4`}>
              <div className="p-3 bg-zinc-100 text-zinc-900 rounded-xl">
                <MessageSquare size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider uppercase text-zinc-500">Total Reviews</p>
                <p className="text-2xl font-bold text-zinc-900 mt-1 tracking-tight">{totalReviews}</p>
              </div>
            </div>
            
            <div className={`${theme.cardBg} p-6 rounded-lg border ${theme.border} shadow-sm flex items-center gap-4`}>
              <div className="p-3 bg-zinc-100 rounded-xl">
                <Star size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider uppercase text-zinc-500">Average Rating</p>
                <p className="text-2xl font-bold text-zinc-900 mt-1 tracking-tight">{averageRating} / 5.0</p>
              </div>
            </div>

            <div className={`${theme.cardBg} p-6 rounded-lg border ${theme.border} shadow-sm flex items-center gap-4`}>
              <div className="p-3 bg-zinc-100 rounded-xl">
                <Star size={24} className="fill-black text-black" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider uppercase text-zinc-500">5-Star Reviews</p>
                <p className="text-2xl font-bold text-zinc-900 mt-1 tracking-tight">{fiveStarReviews}</p>
              </div>
            </div>
          </div>

          {/* Reviews Area */}
          <div className={`${theme.cardBg} rounded-lg border ${theme.border} shadow-sm overflow-hidden flex flex-col `}>
            <div className="p-6 flex items-center justify-between border-b border-zinc-100 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">Recent Feedback</h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Showing {filteredReviews.length} {filteredReviews.length === 1 ? 'review' : 'reviews'}.
                </p>
              </div>
            </div>
            
            {viewMode === "table" ? (
              <div className={`overflow-x-auto ${customScrollbarClasses} flex-1`}>
                <table className="w-full text-left">
                  <thead className="bg-zinc-50/50 border-b border-zinc-100 whitespace-nowrap">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold tracking-wider uppercase text-zinc-500">Product</th>
                      <th className="px-6 py-4 text-[10px] font-bold tracking-wider uppercase text-zinc-500">Rating</th>
                      <th className="px-6 py-4 text-[10px] font-bold tracking-wider uppercase text-zinc-500">Review Note</th>
                      <th className="px-6 py-4 text-[10px] font-bold tracking-wider uppercase text-zinc-500">Buyer</th>
                      <th className="px-6 py-4 text-[10px] font-bold tracking-wider uppercase text-zinc-500">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {currentReviews.length > 0 ? currentReviews.map((rev) => {
                      const reviewId = rev._id?.$oid || rev._id || Math.random().toString();
                      const { formattedDate, formattedTime } = formatDateTimeParts(rev.createdAt);
                      
                      return (
                        <tr key={reviewId} className="hover:bg-zinc-50 transition-colors group">
                          
                          {/* Product Column */}
                          <td className="px-6 py-5 align-top">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-zinc-100 rounded-lg text-zinc-500 border border-zinc-200">
                                <Package size={16} />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-zinc-900 line-clamp-1">
                                  {rev.productId?.name || "Product Item"}
                                </p>
                                <p className="text-xs font-mono text-zinc-500 mt-0.5">
                                  ID: {typeof rev.productId === 'string' ? rev.productId : (rev.productId?._id || "N/A")}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Rating Column */}
                          <td className="px-6 py-5 align-top whitespace-nowrap">
                            {renderStars(rev.rate)}
                            <span className="block mt-1.5 text-xs font-bold text-zinc-700">{rev.rate}.0</span>
                          </td>
                          
                          {/* Review Column */}
                          <td className="px-6 py-5 min-w-75 max-w-md align-top">
                            <p className="text-sm text-zinc-700 leading-relaxed font-medium line-clamp-2">
                              "{rev.review}"
                            </p>
                            {rev.review.length > 70 && (
                              <button onClick={() => setSelectedReview(rev)} 
                                className="text-xs text-blue-600 font-semibold mt-1 hover:underline flex items-center gap-1">
                                Read Full Review
                              </button>
                            )}
                          </td>
                          
                          {/* Buyer Column */}
                          <td className="px-6 py-5 align-top whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600">
                                {(rev.buyerId?.username?.[0] || "U").toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-zinc-900">{rev.buyerId?.username || "Unknown"}</p>
                              </div>
                            </div>
                          </td>
                          
                          {/* Date Column */}
                          <td className="px-6 py-5 align-top whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-zinc-600">
                              <Calendar size={14} className="text-zinc-400" />
                              <span className="text-sm font-semibold">{formattedDate}</span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-1 ml-5">{formattedTime}</p>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <MessageSquare size={32} className="mx-auto text-zinc-300 mb-3" />
                          <p className="text-sm font-medium text-zinc-900">No reviews found</p>
                          <p className="text-xs text-zinc-500 mt-1">
                            {searchQuery || selectedRating !== "All" 
                              ? "Try adjusting your search or filters." 
                              : "When users review products, they will appear here."}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              // --- CARD VIEW MODE ---
              <div className={`overflow-y-auto ${customScrollbarClasses} flex-1 p-4 sm:p-6 bg-slate-50/50`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                  {currentReviews.length > 0 ? currentReviews.map((rev) => {
                    const reviewId = rev._id?.$oid || rev._id || Math.random().toString();
                    const { formattedDate, formattedTime } = formatDateTimeParts(rev.createdAt);

                    return (
                      <div key={reviewId} className="bg-white rounded-lg border border-zinc-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                        
                        {/* Card Header */}
                        <div className="flex justify-between items-start mb-4 gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 shrink-0">
                              {(rev.buyerId?.username?.[0] || "U").toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-zinc-900 line-clamp-1">{rev.buyerId?.username || "Unknown"}</p>
                              <p className="text-[10px] text-zinc-500 mt-0.5">{formattedDate}</p>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1">
                            {renderStars(rev.rate)}
                            <span className="text-xs font-bold text-zinc-700">{rev.rate}.0</span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="flex-1 mb-2">
                          <div className="flex items-center gap-1.5 mb-2.5">
                            <Package size={14} className="text-zinc-400 shrink-0" />
                            <span className="text-xs font-semibold text-zinc-900 line-clamp-1" title={rev.productId?.name || "Product Item"}>
                              {rev.productId?.name || "Product Item"}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-700 leading-relaxed font-medium line-clamp-3">
                            "{rev.review}"
                          </p>
                        </div>

                        {/* Card Footer (Action) */}
                        {rev.review.length > 70 && (
                          <div className="mt-auto pt-3 flex justify-start">
                            <button onClick={() => setSelectedReview(rev)} 
                              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
                              Read Full Review
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  }) : (
                    <div className="col-span-full p-16 text-center flex flex-col items-center justify-center">
                      <MessageSquare size={32} className="mx-auto text-zinc-300 mb-3" />
                      <p className="text-sm font-medium text-zinc-900">No reviews found</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {searchQuery || selectedRating !== "All" 
                          ? "Try adjusting your search or filters." 
                          : "When users review products, they will appear here."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pagination Footer */}
            {filteredReviews.length > 0 && totalPages > 1 && (
              <div className="mt-auto shrink-0 flex flex-col sm:flex-row gap-4 justify-between items-center p-4 border-t border-zinc-100 bg-white">
                
                {/* Items per page selector */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Show</span>
                  <div className="relative">
                    <select 
                      value={reviewsPerPage} 
                      onChange={(e) => setReviewsPerPage(Number(e.target.value))}
                      className="appearance-none bg-white border border-zinc-200 text-sm font-bold rounded-lg pl-3 pr-8 py-2 outline-none focus:border-zinc-900 transition-colors cursor-pointer shadow-sm">
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={30}>30</option>
                      <option value={50}>50</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" />
                  </div>
                </div>

                {/* Page Navigation */}
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 disabled:opacity-50 disabled:hover:border-zinc-200 disabled:hover:text-zinc-600 transition-all shadow-sm">
                    <ChevronLeft size={16} />
                  </button>

                  <div className="items-center gap-1 hidden sm:flex">
                    {getPageNumbers().map((page, index) => (
                      page === "..." ? (
                        <span key={index} className="w-6 flex justify-center text-zinc-400 font-bold text-sm">...</span>
                      ) : (
                        <button key={index} onClick={() => setCurrentPage(page)}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-all shadow-sm
                            ${currentPage === page ? "bg-zinc-900 text-white border-2 border-zinc-900" 
                              : "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-900 hover:text-zinc-900"}`}>
                          {page}
                        </button>
                      )
                    ))}
                  </div>

                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 disabled:opacity-50 disabled:hover:border-zinc-200 disabled:hover:text-zinc-600 transition-all shadow-sm">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- GLOBAL MODAL --- */}
        {selectedReview && (
          <div className="fixed inset-0 z-999 flex items-center justify-center p-4 sm:p-6" onClick={() => setSelectedReview(null)}>

            {/* Glassmorphism Backdrop */}
            <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" />
            
            {/* Modal Content Container */}
            <div className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl border border-zinc-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100/80 bg-zinc-50/50">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Review Details</h3>
                  <div className="mt-1.5"> {renderStars(selectedReview.rate)} </div>
                </div>
                <button onClick={() => setSelectedReview(null)} className="p-2 bg-white border border-zinc-200 rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-all shadow-sm">
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                {/* Highlighted Review Quote */}
                <div className="relative bg-zinc-50 rounded-2xl p-6 border mb-6">
                  <Quote size={28} className="absolute -top-4 -left-2 bg-white rounded-full p-1" />
                  <p className="text-sm font-medium leading-relaxed relative z-10 italic">
                    "{selectedReview.review}"
                  </p>
                </div>

                {/* Meta Information Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-zinc-50/80 border">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                      <User size={14} /> Reviewed By
                    </span>
                    <span className="text-sm font-semibold truncate">
                      {selectedReview.buyerId?.username || "Unknown User"}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-zinc-50/80 border">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                    <Package size={14} /> Product
                  </span>
                  <span className="text-xs font-semibold truncate" 
                    title={typeof selectedReview.productId === 'object' ? selectedReview.productId.name : selectedReview.productId}>
                    {typeof selectedReview.productId === 'object' 
                      ? (selectedReview.productId.name || selectedReview.productId._id) 
                      : selectedReview.productId}
                  </span>
                </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminReview;