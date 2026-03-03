import React, { useState } from "react";
import { Menu, Search, Filter, Edit2, Trash2, Plus, MoreVertical, LayoutGrid, ImageIcon } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { theme } from "../../components/theme";

/* ================================
   Mock Data
================================ */
const initialProducts = [
  { id: 1, name: "Sony WH-1000XM5 Headphones", brand: "Sony", category: "Electronics & Audio", price: 398.00, discountPrice: 348.00, stock: 45, initials: "SN" },
  { id: 2, name: "Ergonomic Mesh Office Chair", brand: "Herman Miller", category: "Home & Furniture", price: 1250.00, discountPrice: null, stock: 8, initials: "HM" },
  { id: 3, name: "Organic Cotton T-Shirt", brand: "Everlane", category: "Apparel & Fashion", price: 35.00, discountPrice: null, stock: 150, initials: "EV" },
  { id: 4, name: "Pro Yoga Mat 5mm", brand: "Lululemon", category: "Sports & Outdoors", price: 98.00, discountPrice: 79.00, stock: 0, initials: "LL" },
  { id: 5, name: "Hydrating Facial Serum", brand: "The Ordinary", category: "Beauty & Personal Care", price: 15.00, discountPrice: null, stock: 12, initials: "TO" },
];

/* ================================
   Main Component
================================ */
const ViewProducts = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Tailwind arbitrary variants for the custom scrollbar
  const customScrollbar = "[&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

  // Filter logic
  const filteredProducts = initialProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Helper function for stock badge styling
  const getStockStatus = (stock) => {
    if (stock === 0) return { label: "Out of Stock", classes: "bg-rose-50 text-rose-700 border-rose-200" };
    if (stock <= 15) return { label: "Low Stock", classes: "bg-amber-50 text-amber-700 border-amber-200" };
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
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-8">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Products</h1>
              <p className={`text-base ${theme.textMuted} mt-2`}>Manage your inventory, pricing, and product details.</p>
            </div>
            <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-black hover:bg-zinc-800 shadow-lg transition-colors w-full sm:w-auto">
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
                <option value="All">All Categories</option>
                <option value="Electronics & Audio">Electronics & Audio</option>
                <option value="Apparel & Fashion">Apparel & Fashion</option>
                <option value="Home & Furniture">Home & Furniture</option>
                <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                <option value="Sports & Outdoors">Sports & Outdoors</option>
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
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Category & Brand</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Price</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Inventory</th>
                    <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.stock);
                    
                    return (
                      <tr key={product.id} className="hover:bg-zinc-50/50 transition-colors group">
                        
                        {/* Product Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {/* Product Image Placeholder */}
                            <div className="w-12 h-12 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 shrink-0 relative overflow-hidden">
                              <ImageIcon size={20} className="opacity-50" />
                              <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 text-[10px] font-bold text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                {product.initials}
                              </div>
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm mb-0.5">{product.name}</p>
                              <p className={`text-xs ${theme.textMuted}`}>ID: #{product.id.toString().padStart(5, '0')}</p>
                            </div>
                          </div>
                        </td>

                        {/* Category & Brand */}
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 text-sm mb-0.5">{product.category}</p>
                          <p className={`text-xs ${theme.textMuted}`}>{product.brand}</p>
                        </td>

                        {/* Pricing */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-sm">
                              ${product.discountPrice ? product.discountPrice.toFixed(2) : product.price.toFixed(2)}
                            </span>
                            {product.discountPrice && (
                              <span className="text-xs text-slate-400 line-through mt-0.5">
                                ${product.price.toFixed(2)}
                              </span>
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
                              {product.stock} in stock
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                            <button className={`p-2 rounded-lg hover:bg-zinc-100 text-slate-500 hover:text-black transition-colors tooltip-trigger`} title="Edit Product">
                              <Edit2 size={18} />
                            </button>
                            <button className={`p-2 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors tooltip-trigger`} title="Delete Product">
                              <Trash2 size={18} />
                            </button>
                          </div>
                          {/* Mobile visible fallback */}
                          <button className="lg:hidden p-2 text-slate-400 hover:text-black transition-colors">
                            <MoreVertical size={18} />
                          </button>
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