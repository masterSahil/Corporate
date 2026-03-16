import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Menu, Search, ShoppingBag, Star, Plus, 
  Package, ChevronDown, Filter, Check 
} from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar";
import { theme } from "../components/theme";
import axios from "axios";

const EmployeeStore = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const userPoints = 0; 

  const getData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_KEY}/product`, { withCredentials: true });
      setProducts(res.data.product);
    } catch (error) {
      console.log(error);
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

  const categories = ["All", ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const customScrollbarClasses = "overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

  return (
    <div className={`flex h-screen w-full overflow-hidden selection:bg-zinc-200 selection:text-black`}>
      <EmployeeSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className={`flex-1 bg-slate-50 ${customScrollbarClasses}`}>
        {/* Mobile Header Toggle */}
        <div className="lg:hidden p-4 pb-0 flex justify-between items-center shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className={`flex items-center gap-2 ${theme.textMuted} hover:text-black hover:bg-zinc-100 ${theme.cardBg} border ${theme.border} px-3 py-2 rounded-xl shadow-sm transition-all`}>
            <Menu size={20} /> <span className="text-sm font-medium">Menu</span>
          </button>
        </div>

        <div className="max-w-7xl mx-auto p-6 space-y-10">
          
          {/* Store Header / Points Banner */}
          <section className="relative rounded-2xl overflow-hidden bg-black p-8 lg:p-10 text-white shadow-2xl border border-zinc-800">
            <div className="absolute top-[-20%] right-[-5%] w-64 h-64 bg-zinc-500/10 blur-[80px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-black tracking-tighter mb-2 italic">THE PRODUCT STORE</h1>
                <p className="text-zinc-400 font-medium text-lg">Turn your hard-earned points into premium rewards.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col items-center min-w-45">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Your Balance</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">{userPoints}</span>
                  <span className="text-sm font-bold text-zinc-500 uppercase">pts</span>
                </div>
              </div>
            </div>
          </section>

          {/* Search & Dynamic Dropdown Filter */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between relative z-30">
            <div className="relative w-full md:w-1/3 group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-black transition-colors" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border-2 border-slate-200 text-slate-900 text-sm rounded-xl pl-12 pr-4 py-3.5 outline-none focus:border-black transition-all shadow-sm font-medium"
              />
            </div>

            {/* Category Dropdown */}
            <div className="relative w-full md:w-72" ref={dropdownRef}>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`w-full flex items-center justify-between px-5 py-3.5 bg-white border-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-sm
                  ${isFilterOpen ? "border-black ring-4 ring-slate-100" : "border-slate-200 hover:border-black"}`}
              >
                <div className="flex items-center gap-3">
                  <Filter size={14} />
                  <span>{selectedCategory === "All" ? "Filter Category" : selectedCategory}</span>
                </div>
                <ChevronDown size={16} className={`transition-transform duration-300 ${isFilterOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {isFilterOpen && (
                <div className="absolute top-full mt-2 w-full bg-white border-2 border-black rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-5 py-4 text-[10px] font-black uppercase tracking-widest transition-colors border-b border-slate-50 last:border-0
                          ${selectedCategory === cat ? "bg-black text-white" : "text-slate-600 hover:bg-slate-200"}`}
                      >
                        {cat}
                        {selectedCategory === cat && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div 
                key={product._id} 
                onClick={() => navigate(`/employee/store/${product._id}`)}
                className="group relative bg-white border-2 border-slate-200 rounded-xl p-4 transition-all hover:border-black hover:shadow-2xl cursor-pointer flex flex-col"
              >
                <div className="aspect-4/3 rounded-xl group-hover:border-2 bg-slate-100 mb-5 overflow-hidden relative flex items-center justify-center">
                  {product.gallery && product.gallery.length > 0 ? (
                    <img 
                      src={product.gallery[0].fileUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                    />
                  ) : (
                    <Package size={40} className="text-slate-300" />
                  )}
                  
                  <div className="absolute top-3 left-3">
                    <span className="bg-black/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg">
                      {product.category}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-200 flex items-center gap-1 shadow-sm">
                    <Star size={10} className="fill-black text-black" />
                    <span className="text-[10px] font-black text-black">4.8</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col px-1">
                  <h4 className="text-lg font-black text-slate-900 mb-2 line-clamp-1 leading-tight uppercase tracking-tight group-hover:text-zinc-600 transition-colors">
                    {product.name}
                  </h4>
                  
                  <p className="text-sm text-slate-400 line-clamp-2 mb-6 font-medium">
                    {product.description || "Premium employee reward item."}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Exchange At</span>
                      <div className="flex items-center gap-1">
                        <span className="text-2xl font-black text-black tracking-tighter italic">{product.price}</span>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">$</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 border-2 border-slate-100 group-hover:bg-black group-hover:border-black group-hover:text-white transition-all duration-300 shadow-sm text-slate-500">
                      <Plus size={20} />
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 opacity-0 group-hover:-translate-y-5 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                  <span className="bg-black text-white text-[10px] font-black uppercase p-3 rounded-sm shadow-xl">
                    View Details
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <Package size={60} className="text-slate-200 mb-4" />
              <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">No products found</h3>
              <button 
                onClick={() => {setSearchQuery(""); setSelectedCategory("All")}}
                className="mt-4 text-black underline font-bold"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmployeeStore;