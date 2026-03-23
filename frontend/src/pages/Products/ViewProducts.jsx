import React, { useState, useEffect } from "react";
import { Menu, Search, Edit2, Trash2, Plus, LayoutGrid, ImageIcon, RefreshCw } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { theme } from "../../components/Theme";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "../../ui/Toaster";

const ViewProducts = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const getProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_KEY}/product`, { withCredentials: true });
      setProducts(res.data.product);
    } catch (error) {
      toast.error(error);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const deleteProduct = async (id) => {
    try {
      setLoading(true);
      await axios.put(`${import.meta.env.VITE_API_KEY}/product-soft-delete/${id}`, { isDeleted: true, deletedAt: new Date() }, { withCredentials: true });
      getProducts();
      toast.success("Product Deleted Successfully");
    } catch (error) {
      toast.error(error);
      console.log("Error deleting product:", error);
    } finally {
      setLoading(false);
    }
  };

  // Tailwind arbitrary variants for the custom scrollbar
  const customScrollbar = "[&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

  // Dynamically extract unique categories for the filter dropdown
  const uniqueCategories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];

  // Filter logic
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;
    
    // Only show products that are not deleted (if your API doesn't already filter them)
    const isNotDeleted = !product.isDeleted;

    return matchesSearch && matchesCategory && isNotDeleted;
  });

  // Helper function for stock badge styling
  const getStockStatus = (quantity) => {
    if (!quantity || quantity <= 0) return { label: "Out of Stock", classes: "bg-rose-50 text-rose-700 border-rose-200" };
    if (quantity <= 25) return { label: "Low Stock", classes: "bg-amber-50 text-amber-700 border-amber-200" };
    return { label: "In Stock", classes: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  };

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
          {loading && (
            <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-999">
              <div className="rounded-xl bg-white/70 shadow-xl px-6 py-5 flex items-center gap-3">
                <RefreshCw className="animate-spin text-slate-700" size={22} />
                <span className="text-sm font-semibold text-slate-800">
                  Loading...
                </span>
              </div>
            </div>
          )}
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-8">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Products</h1>
              <p className={`text-base ${theme.textMuted} mt-2`}>Manage your inventory, pricing, and product details.</p>
            </div>
            <button 
              onClick={() => navigate('/products/add')}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-black hover:bg-zinc-800 shadow-lg transition-colors w-full sm:w-auto"
            >
              <Plus size={18} />
              Add Product
            </button>
          </div>

          {/* Toolbar: Search & Filter */}
          <div className={`flex flex-col md:flex-row gap-4 mb-8 p-5 rounded-xl border ${theme.border} ${theme.cardBg} shadow-sm`}>
            {/* Search */}
            <div className="relative flex-1">
              <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted} pointer-events-none`} />
              <input 
                type="text" 
                placeholder="Search by product name or brand..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 bg-zinc-50 border ${theme.border} rounded-lg text-sm text-slate-900 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
              />
            </div>
            
            {/* Category Filter */}
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

          {/* Data Table Card */}
          <div className={`${theme.cardBg} border ${theme.border} rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col`}>
            <div className={`overflow-x-auto ${customScrollbar}`}>
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className={`bg-zinc-50/80 border-b ${theme.border}`}>
                  <tr>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Product</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Category</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Price</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Inventory</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredProducts.map((product) => {
                    const id = product._id?.$oid || product._id;
                    const stockStatus = getStockStatus(product.quantity);
                    const primaryImage = product.gallery?.[0]?.fileUrl;
                    
                    // Generate initials if no image is available
                    const initials = product.name ? product.name.substring(0, 2).toUpperCase() : "PR";
                    
                    // --- NEW DISCOUNT LOGIC ---
                    const hasDiscount = product.discount !== undefined && product.discount !== null;
                    const isPercentage = product.discountType === 'percentage' || !product.discountType; // Fallback to percentage if undefined
                    
                    let finalPrice = product.price;
                    let discountBadgeText = "";

                    if (hasDiscount) {
                      if (isPercentage) {
                        finalPrice = product.price - (product.price * (product.discount / 100));
                        discountBadgeText = `Discount: ${product.discount}%`;
                      } else {
                        finalPrice = product.price - product.discount;
                        if (finalPrice < 0) finalPrice = 0;
                        discountBadgeText = `Discount: ₹${product.discount}`;
                      }
                    }

                    return (
                      <tr key={id} className="hover:bg-zinc-50/50 transition-colors group">
                        
                        {/* Product Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            
                            {/* Product Image */}
                            <div className="w-12 h-12 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 shrink-0 relative overflow-hidden">
                              {primaryImage ? (
                                <img src={primaryImage} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <>
                                  <ImageIcon size={20} className="opacity-50" />
                                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 text-[10px] font-bold text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {initials}
                                  </div>
                                </>
                              )}
                            </div>

                            <div>
                              <p className="font-bold text-slate-900 text-sm mb-0.5 capitalize">{product.name}</p>
                              {/* Display shortened MongoDB Object ID */}
                              <p className={`text-xs ${theme.textMuted}`}>ID: #{id.slice(-6).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>

                        {/* Category & Brand */}
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 text-sm mb-0.5">{product.category}</p>
                          <p className={`text-xs capitalize ${theme.textMuted}`}>{product.brand}</p>
                        </td>

                        {/* Pricing */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-sm">
                              ₹{finalPrice.toFixed(2)}
                            </span>
                            {hasDiscount && (
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xs text-slate-400 line-through">
                                  ₹{product.price.toFixed(2)}
                                </span>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                  {discountBadgeText}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Inventory & Stock Status */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-start gap-1.5">
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${stockStatus.classes}`}>
                              {stockStatus.label}
                            </span>
                            <span className={`text-xs font-semibold ${theme.textMuted}`}>
                              {product.quantity} in stock
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => navigate(`/products/update/${id}`)}
                              className={`p-2 rounded-lg hover:bg-zinc-100 text-slate-500 hover:text-black transition-colors tooltip-trigger`} 
                              title="Edit Product"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              onClick={() => deleteProduct(id)}
                              className={`p-2 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors tooltip-trigger`} 
                              title="Delete Product"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {/* Empty State */}
              {filteredProducts.length === 0 && (
                <div className="p-16 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center mb-4">
                    <Search size={24} className={theme.textMuted} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">No products found</h3>
                  <p className={`text-sm ${theme.textMuted} mt-1 max-w-sm`}>We couldn't find any products matching your current search or filter criteria.</p>
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

export default ViewProducts;