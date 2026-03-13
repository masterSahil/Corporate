import React, { useEffect, useState } from "react";
import { Menu, Search, Filter, Trash2, ArchiveRestore, Info, LayoutGrid, ImageIcon, RefreshCw, Loader2 } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { theme } from "../../components/theme";
import axios from "axios";
import { toast } from '../../ui/Toaster'; // Ensure this path matches your project structure

const SoftDeletedProducts = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [deletedProducts, setDeletedProducts] = useState([]);
  
  // Added loading state for the overlay with dynamic text
  const [loadingText, setLoadingText] = useState("");

  const getDeletedData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_KEY}/product-soft-delete-view`, { withCredentials: true });
      setDeletedProducts(res.data.product);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch deleted products");
      console.log(error);
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

  // Restoring a Product
  const handleRestore = async (id) => {
    try {
      setLoadingText("Restoring product...");
      await axios.put(`${import.meta.env.VITE_API_KEY}/product-restore/${id}`, {}, { withCredentials: true });
      await getDeletedData();
      toast.success("Product Restored Successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to restore product");
      console.log(error);
    } finally {
      setLoadingText(""); // Close overlay
    }
  };

  // Permanent Deletion
  const handlePermanentDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this product? This cannot be undone.")) {
      const password = window.prompt("Enter your password to confirm deletion:");
      if (!password) return;

      try {
        setLoadingText("Permanently deleting...");
        await axios.post(`${import.meta.env.VITE_API_KEY}/hard-delete-product/${id}`, {password}, {withCredentials: true });
        await getDeletedData();
        toast.success("Permanently Deleted Successfully");
      } catch (error) {
        toast.error(error.response?.data?.message || "Delete failed");
      } finally {
        setLoadingText(""); // Close overlay
      }
    }
  };

  // Helper function for stock badge styling
  const getStockStatus = (quantity) => {
    if (!quantity || quantity <= 0) return { label: "Out of Stock", classes: "bg-rose-50 text-rose-700 border-rose-200" };
    if (quantity <= 15) return { label: "Low Stock", classes: "bg-amber-50 text-amber-700 border-amber-200" };
    return { label: "In Stock", classes: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  };

  // Tailwind scrollbar
  const customScrollbar = "overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

  // Dynamically extract unique categories from the deleted data
  const uniqueCategories = ["All", ...new Set(deletedProducts.map(p => p.category).filter(Boolean))];

  // Filter Logic
  const filteredProducts = deletedProducts.filter((product) => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Product Trash Bin</h1>
              <p className={`text-base ${theme.textMuted} mt-2`}>Review, restore, or permanently delete removed products.</p>
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
                Products in the trash bin are removed from the storefront immediately but their data is kept securely until you permanently delete them. Restoring a record will return it to active inventory.
              </p>
            </div>
          </div>

          {/* Toolbar: Search & Filter */}
          <div className={`flex flex-col md:flex-row gap-4 mb-8 p-5 rounded-xl border ${theme.border} ${theme.cardBg} shadow-sm`}>
            <div className="relative flex-1">
              <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted} pointer-events-none`} />
              <input 
                type="text" 
                placeholder="Search deleted products by name or brand..." 
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

          {/* Dynamic Loading Overlay */}
          {loadingText && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
              <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-2xl ring-1 ring-black/5">
                <Loader2 className="animate-spin text-slate-900" size={20} />
                <span className="text-sm font-medium text-slate-700">
                  {loadingText}
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
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Product</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Category & Brand</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Price</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Stock</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Deleted On</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredProducts.map((product) => {
                    const id = product._id?.$oid || product._id;
                    const primaryImage = product.gallery?.[0]?.fileUrl;
                    const initials = product.name ? product.name.substring(0, 2).toUpperCase() : "PR";
                    
                    // Pricing Logic
                    const hasDiscount = product.discount !== undefined && product.discount !== null;
                    const isPercentage = product.discountType === 'percentage' || !product.discountType;
                    let finalPrice = product.price || 0;
                    let discountBadgeText = "";

                    if (hasDiscount) {
                      if (isPercentage) {
                        finalPrice = finalPrice - (finalPrice * (product.discount / 100));
                        discountBadgeText = `${product.discount}%`;
                      } else {
                        finalPrice = finalPrice - product.discount;
                        if (finalPrice < 0) finalPrice = 0;
                        discountBadgeText = `$${product.discount}`;
                      }
                    }

                    // Stock Status Logic integration
                    const stockStatus = getStockStatus(product.quantity);

                    return (
                      <tr key={id} className="hover:bg-zinc-50/50 transition-colors group">
                        
                        {/* Product Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 shrink-0 relative overflow-hidden">
                              {primaryImage ? (
                                <img src={primaryImage} alt={product.name} className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all" />
                              ) : (
                                <>
                                  <ImageIcon size={20} className="opacity-50 grayscale group-hover:grayscale-0 transition-all" />
                                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 text-[10px] font-bold text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {initials}
                                  </div>
                                </>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm mb-0.5 capitalize line-through decoration-slate-300">{product.name}</p>
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
                            <span className="font-bold text-slate-900 text-sm opacity-70">
                             ${finalPrice.toFixed(2)}
                            </span>
                            {hasDiscount && (
                              <div className="flex items-center gap-1.5 mt-0.5 opacity-70">
                                <span className="text-xs text-slate-400 line-through">
                                  ${(product.price || 0).toFixed(2)}
                                </span>
                                <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                                 {discountBadgeText}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Stock (New Column) */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-start gap-1">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${stockStatus.classes}`}>
                              {stockStatus.label}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">
                              {product.quantity || 0} Units
                            </span>
                          </div>
                        </td>

                        {/* Deleted Date */}
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-slate-700">
                            {formatDate(product.deletedAt)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3 ">
                            <button onClick={() => handleRestore(id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-sm`} title="Restore Product">
                              <ArchiveRestore size={14} /> Restore
                            </button>
                            <button onClick={() => handlePermanentDelete(id)} className={`p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 hover:text-rose-700 transition-colors tooltip-trigger`} title="Permanently Delete">
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
                    <Trash2 size={24} className={theme.textMuted} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Trash is empty</h3>
                  <p className={`text-sm ${theme.textMuted} mt-1 max-w-sm`}>No deleted products found matching your current criteria.</p>
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

export default SoftDeletedProducts;