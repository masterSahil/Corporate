import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, Plus, Minus, Package, ChevronDown, Filter, Check, Eye, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar";
import { theme } from "../components/Theme";
import axios from "axios";
import { toast } from "../ui/Toaster";

const EmployeeStore = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [currentUserId, setCurrentUserId] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(false);

  // --- NEW: Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const getData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_KEY}/product`, { withCredentials: true });
      const res2 = await axios.get(`${import.meta.env.VITE_API_KEY}/check-role`, { withCredentials: true });
      
      setProducts(res.data.product);
      const user = res2.data.user;
      setCurrentUserId(user._id);
      setUserPoints(user.points || 0); 

      const cartRes = await axios.get(`${import.meta.env.VITE_API_KEY}/cart-all`, { withCredentials: true });
      const userCart = cartRes.data.cart.filter(item => item.buyerId === user._id);
      setCartItems(userCart);
    } catch (error) {
      toast.error("Failed to Fetch Data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- NEW: Reset page to 1 when filters change ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, itemsPerPage]);

  const addToCart = async (id) => {
    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_API_KEY}/cart`, { buyerId: currentUserId, productId: id, quantity: 1 }, { withCredentials: true });
      
      setCartItems([...cartItems, res.data.cart]);
      toast.success("Product Added to Cart");
    } catch (error) {
      toast.error(error.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, productId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        // Remove from cart database if quantity is 0 or less
        await axios.delete(`${import.meta.env.VITE_API_KEY}/cart/${cartItemId}`, { withCredentials: true });
        setCartItems(cartItems.filter(item => item._id !== cartItemId));
        toast.success("Removed from cart");
      } else {
        // Update quantity in database
        const res = await axios.put(`${import.meta.env.VITE_API_KEY}/cart/${cartItemId}`, {
          buyerId: currentUserId,
          productId: productId,
          quantity: newQuantity
        }, { withCredentials: true });

        // Update local state
        setCartItems(cartItems.map(item => item._id === cartItemId ? res.data.cart : item));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update quantity");
      console.log(error);
    } 
  };

  const categories = ["All", ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // --- NEW: Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

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

  const customScrollbarClasses = "overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

  return (
    <div className={`flex h-dvh w-full overflow-hidden selection:bg-zinc-200 selection:text-black`}>
      <EmployeeSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {loading && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-999">
          <div className="rounded-xl bg-white/70 shadow-xl px-6 py-5 flex items-center gap-3">
            <RefreshCw className="animate-spin text-slate-700" size={22} />
            <span className="text-sm font-semibold text-slate-800"> Loading... </span>
          </div>
        </div>
      )}
      <main className={`flex-1 bg-slate-50 ${customScrollbarClasses}`}>
        {/* Mobile Header Toggle */}
        <div className="lg:hidden p-4 pb-0 flex justify-between items-center shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className={`flex items-center gap-2 ${theme.textMuted} hover:text-black hover:bg-zinc-100 ${theme.cardBg} border ${theme.border} px-3 py-2 rounded-xl shadow-sm transition-all`}>
            <Menu size={20} /> <span className="text-sm font-medium">Menu</span>
          </button>
        </div>

        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8 md:space-y-10">
          
          {/* Store Header / Points Banner */}
          <section className="relative rounded-lg overflow-hidden bg-black p-6 md:p-8 lg:p-9 text-white shadow-2xl border border-zinc-800">
            <div className="absolute top-[-20%] right-[-5%] w-64 h-64 bg-zinc-500/10 blur-[80px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-[42px] font-black tracking-tighter mb-2">THE PRODUCT STORE</h1>
                <p className="text-zinc-400 font-medium text-sm md:text-lg">Turn your hard-earned points into premium benefites.</p>
              </div>

              <div className="bg-white/10 border border-white/10 rounded-md p-4 md:p-5 flex flex-col items-center w-full md:w-auto md:min-w-45">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Your Balance</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl font-black text-white">{userPoints.toLocaleString()}</span>
                  <span className="text-sm font-bold text-zinc-500 uppercase">pts</span>
                </div>
              </div>
            </div>
          </section>

          {/* Search & Dynamic Dropdown Filter */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between relative z-30">
            <div className="relative w-full sm:w-1/2 md:w-1/3 group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-black transition-colors" />
              <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border-2 border-slate-200 text-slate-900 text-sm rounded-lg pl-12 pr-4 py-3.5 outline-none focus:border-black transition-all shadow-sm font-medium" />
            </div>

            {/* Category Dropdown */}
            <div className="relative w-full sm:w-64 md:w-72" ref={dropdownRef}>
              <button onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`w-full flex items-center justify-between px-5 py-3.5 bg-white border-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-sm
                  ${isFilterOpen ? "border-black ring-4 ring-slate-100" : "border-slate-200 hover:border-black"}`}>
                <div className="flex items-center gap-3">
                  <Filter size={14} />
                  <span className="truncate">{selectedCategory === "All" ? "Filter Category" : selectedCategory}</span>
                </div>
                <ChevronDown size={16} className={`transition-transform duration-300 shrink-0 ${isFilterOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {isFilterOpen && (
                <div className="absolute top-full mt-2 w-full bg-white border-2 border-black rounded-lg shadow-2xl overflow-hidden z-50">
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {categories.map((cat) => (
                      <button key={cat} onClick={() => {setSelectedCategory(cat); setIsFilterOpen(false) }}
                        className={`w-full flex items-center justify-between px-5 py-4 text-[10px] font-black uppercase tracking-widest transition-colors border-b border-slate-50 last:border-0 text-left ${selectedCategory === cat ? "bg-black text-white" : "text-slate-600 hover:bg-slate-200"}`}>
                        <span className="truncate pr-2">{cat}</span>
                        {selectedCategory === cat && <Check size={14} className="shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Grid - CHANGED filteredProducts to currentProducts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            {currentProducts.map((product) => {
              const cartItem = cartItems.find((c) => c.productId === product._id);

              const getFinalPrice = (product) => {
                if (!product.discount || product.discount <= 0) return product.price;
                if (product.discountType === "percentage") {
                  return Math.round(product.price - (product.price * product.discount) / 100);
                }
                if (product.discountType === "fixed" || product.discountType === "flat") {
                  return Math.max(0, product.price - product.discount);
                }
                return product.price;
              };
              return (
                <div 
                  key={product._id} 
                  onClick={() => navigate(`/employee/store/${product._id}`)}
                  className="group relative bg-white border-2 border-slate-200 rounded-lg p-4 transition-all duration-300 hover:border-black hover:shadow-2xl cursor-pointer flex flex-col h-full">
                  {/* Image Container with Sleek Hover Overlay */}
                  <div className="aspect-4/3 rounded-lg bg-slate-100 mb-4 overflow-hidden relative flex items-center justify-center border border-slate-100 group-hover:border-slate-200 transition-colors">
                    {product.gallery && product.gallery.length > 0 ? (
                      <img src={product.gallery[0].fileUrl} alt={product.name} 
                        className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-700 ease-out"/>
                    ) : (
                      <Package size={40} className="text-slate-300" />
                    )}
                    
                    {/* Dark Glass Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] px-5 py-3 rounded-md flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-2xl">
                        <Eye size={14} /> View
                      </div>
                    </div>
                    
                    {/* Top Left Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="bg-black/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg shadow-sm">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="flex-1 flex flex-col px-1">
                    <h4 className="text-lg font-black text-slate-900 mb-1.5 line-clamp-1 leading-tight uppercase tracking-tight group-hover:text-zinc-600 transition-colors">
                      {product.name}
                    </h4>
                    
                    <p className="text-xs md:text-sm text-slate-400 line-clamp-2 mb-4 font-medium leading-relaxed">
                      {product.description || "Premium employee reward item."}
                    </p>
                    
                    {/* Pricing & Cart Controls */}
                    <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-4 border-t border-slate-100">
                      
                      {/* Pricing Section */}
                      <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-2">

                        {/* Discount Badge */}
                        {product.discount > 0 && (
                          <div className="inline-block bg-red-600 text-white text-xs font-bold uppercase px-2 py-1 rounded-md tracking-widest w-max select-none">
                            {product.discountType === "percentage"
                              ? `${product.discount}% OFF`
                              : `₹${product.discount} OFF`}
                          </div>
                        )}

                        {/* Price Row */}
                        <div className="flex items-baseline gap-3">
                          {/* Final Price */}
                          <span className="text-2xl font-extrabold text-black tracking-tight">
                            ₹{getFinalPrice(product).toLocaleString()}
                          </span>
                          {/* Original Price Strikethrough (Only shows if there is a discount) */}
                          {product.discount > 0 && (
                            <span className="text-sm text-gray-400 line-through select-none">
                              ₹{product.price.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* You Save Text (Only shows if there is a discount) */}
                        {product.discount > 0 && (
                          <span className="text-sm text-green-600 font-semibold select-none">
                            You Save ₹{(product.price - getFinalPrice(product)).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls OR Add to Cart Button */}
                      {cartItem ? (
                        <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1 border-2 border-slate-200 shrink-0">
                          <button onClick={(e) => { e.stopPropagation(); updateQuantity(cartItem._id, product._id, cartItem.quantity - 1); }} 
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-slate-600 hover:text-black hover:shadow-md transition-all border border-slate-200">
                            <Minus size={14} />
                          </button>
                          <span className="font-black text-xs w-5 text-center">{cartItem.quantity}</span>
                          <button onClick={(e) => { e.stopPropagation(); updateQuantity(cartItem._id, product._id, cartItem.quantity + 1); }} 
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-black text-white hover:bg-zinc-800 hover:shadow-md transition-all">
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); addToCart(product._id); }} 
                          className="flex items-center justify-center w-10 h-10 md:w-11 rounded-xl bg-slate-50 border-2 border-slate-200 group-hover:bg-black group-hover:border-black group-hover:text-white transition-all duration-300 shadow-sm text-slate-600 shrink-0">
                          <Plus size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* NEW: Pagination Controls */}
          {filteredProducts.length > 0 && totalPages > 1 && (
            <div className="flex flex-row items-center justify-between gap-4 pt-8 pb-4 border-t-2 border-slate-100">
              {/* Items per page selector */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Show</span>
                <div className="relative">
                  <select 
                    value={itemsPerPage} 
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="appearance-none bg-white border-2 border-slate-200 text-sm font-black rounded-lg pl-4 pr-8 py-2 outline-none focus:border-black transition-colors cursor-pointer shadow-sm"
                  >
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={40}>40</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                </div>
              </div>

              {/* Page Numbers & Navigation */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-slate-200 bg-white text-slate-600 hover:border-black hover:text-black disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-all shadow-sm"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) => (
                    page === "..." ? (
                      <span key={index} className="w-8 flex justify-center text-slate-400 font-black">...</span>
                    ) : (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black transition-all shadow-sm
                          ${currentPage === page 
                            ? "bg-black text-white border-2 border-black" 
                            : "bg-white border-2 border-slate-200 text-slate-600 hover:border-black hover:text-black"}`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>

                <button disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-slate-200 bg-white text-slate-600 hover:border-black hover:text-black disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-all shadow-sm">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-lg border-2 border-dashed border-slate-200 mx-4 md:mx-0">
              <Package size={60} className="text-slate-200 mb-5" />
              <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest text-center">No products found</h3>
              <button onClick={() => {setSearchQuery(""); setSelectedCategory("All"); setCurrentPage(1);}} className="mt-4 text-black text-sm font-bold tracking-wider hover:underline transition-all">
                CLEAR FILTERS
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmployeeStore;