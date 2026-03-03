import React, { useState, useRef } from "react";
import { Menu, Box, UploadCloud, Tag, DollarSign, Package, LayoutGrid, AlignLeft, X, ImageIcon, Globe } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { theme } from "../../components/theme";

/* ================================
   Reusable Components
================================ */

const Card = ({ title, icon: Icon, children, className = "" }) => (
  <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 lg:p-8 shadow-sm ${className}`}>
    {title && (
      <div className={`flex items-center gap-2 mb-6 pb-4 border-b ${theme.border}`}>
        {Icon && <Icon size={20} className="text-slate-900" />}
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>
    )}
    {children}
  </div>
);

const Input = ({ label, type = "text", icon: Icon, rightElement, ...props }) => (
  <div className="flex flex-col gap-2 mb-6">
    <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>
      {label}
    </label>
    <div className="relative flex items-center">
      {Icon && <Icon size={18} className={`absolute left-4 ${theme.textMuted} pointer-events-none`} />}
      <input
        type={type}
        className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg ${Icon ? 'pl-11' : 'pl-4'} ${rightElement ? 'pr-11' : 'pr-4'} py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
        {...props}
      />
      {rightElement && <div className="absolute right-4">{rightElement}</div>}
    </div>
  </div>
);

const Select = ({ label, icon: Icon, options, ...props }) => (
  <div className="flex flex-col gap-2 mb-6">
    <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>
      {label}
    </label>
    <div className="relative flex items-center">
      {Icon && <Icon size={18} className={`absolute left-4 ${theme.textMuted} pointer-events-none`} />}
      <select
        className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg ${Icon ? 'pl-11' : 'pl-4'} pr-10 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none cursor-pointer`}
        {...props}
      >
        <option value="" disabled hidden>Select category</option>
        {options.map((opt, i) => (
          <option key={i} value={opt}>{opt}</option>
        ))}
      </select>
      <div className="absolute right-4 pointer-events-none text-slate-400">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  </div>
);

const TextArea = ({ label, icon: Icon, ...props }) => (
  <div className="flex flex-col gap-2 mb-6">
    <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>
      {label}
    </label>
    <div className="relative">
      {Icon && <Icon size={18} className={`absolute left-4 top-3.5 ${theme.textMuted} pointer-events-none`} />}
      <textarea
        className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all min-h-30 resize-y`}
        {...props}
      />
    </div>
  </div>
);

const MultiImageDropzone = ({ images, setImages }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImages = files.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substring(7)
      }));
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (idToRemove) => {
    setImages(prev => prev.filter(img => img.id !== idToRemove));
  };

  return (
    <Card title="Product Gallery" icon={ImageIcon}>
      <div className="space-y-4">
        {/* Image Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {images.map((img, index) => (
              <div key={img.id} className={`relative group rounded-xl overflow-hidden border ${theme.border} aspect-square`}>
                <img src={img.preview} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => removeImage(img.id)}
                    className="bg-white text-rose-600 p-2 rounded-full hover:scale-110 transition-transform shadow-lg"
                  >
                    <X size={16} strokeWidth={3} />
                  </button>
                </div>
                {index === 0 && (
                  <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
                    Primary
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        <label className={`border-2 border-dashed ${images.length > 0 ? 'border-zinc-300 py-6' : `border-zinc-300 py-12`} rounded-xl flex flex-col items-center justify-center text-center hover:border-black hover:bg-zinc-50 transition-all cursor-pointer group`}>
          <div className={`bg-slate-100 rounded-full group-hover:scale-110 transition-transform ${images.length > 0 ? 'p-3 mb-2' : 'p-4 mb-4'}`}>
            <UploadCloud size={images.length > 0 ? 20 : 28} className="text-slate-600" />
          </div>
          <p className={`${images.length > 0 ? 'text-sm' : 'text-base'} font-bold text-slate-900 mb-1`}>
            {images.length > 0 ? 'Add more images' : 'Click to upload images'}
          </p>
          {!images.length && <p className={`text-sm ${theme.textMuted}`}>JPG, PNG up to 5MB each</p>}
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            onChange={handleFileChange} 
            className="hidden" 
            ref={fileInputRef}
          />
        </label>
      </div>
    </Card>
  );
};

/* Main Component */

const AddProduct = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [images, setImages] = useState([]);
  
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    price: "",
    discountPrice: "",
    stock: "",
    description: "",
  });

  const handleChange = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  const handleSubmit = () => {
    const payload = {
      ...formData,
      images: images.map(img => img.file)
    };
    console.log("Submitting product:", payload);
    // TODO: connect to backend API
  };

  // Tailwind arbitrary variants for the custom scrollbar
  const customScrollbarClasses = "overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

  return (
    <div className={`flex h-screen w-full ${theme.appBg} ${theme.textMain} font-sans overflow-hidden selection:bg-zinc-200 selection:text-zinc-900`}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className={`flex-1 bg-slate-50 ${customScrollbarClasses}`}>
        
        {/* Mobile Header */}
        <div className="lg:hidden p-4 pb-0 flex justify-between items-center shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className={`flex items-center gap-2 ${theme.textMuted} hover:text-black hover:bg-zinc-100 ${theme.cardBg} border ${theme.border} px-3 py-2 rounded-lg shadow-sm transition-all`}>
            <Menu size={20} /> <span className="text-sm font-medium">Menu</span>
          </button>
        </div>

        <div className="p-6 max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-10">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Add New Product</h1>
              <p className={`text-base ${theme.textMuted} mt-2`}>Configure product details, gallery, and inventory.</p>
            </div>
            <div className="flex gap-4 w-full sm:w-auto">
              <button className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold border ${theme.border} bg-white hover:bg-zinc-50 transition-colors`}>
                Discard
              </button>
              <button onClick={handleSubmit} className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold text-white bg-black hover:bg-zinc-800 shadow-lg transition-colors">
                Publish Product
              </button>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Left Column: Form Fields */}
            <div className="xl:col-span-2 space-y-8">
              
              {/* Basic Details */}
              <Card title="Basic Details" icon={Box}>
                <div className="grid md:grid-cols-2 gap-x-8">
                  <div className="md:col-span-2">
                    <Input label="Product Name" icon={Box} value={formData.name} onChange={handleChange("name")} placeholder="e.g. Sony Noise Cancelling Headphones" />
                  </div>
                  <Select 
                    label="Product Category" 
                    icon={LayoutGrid} 
                    value={formData.category} 
                    onChange={handleChange("category")} 
                    options={["Electronics & Audio", "Apparel & Fashion", "Home & Furniture", "Beauty & Personal Care", "Sports & Outdoors"]} 
                  />
                  <Input label="Brand" icon={Tag} value={formData.brand} onChange={handleChange("brand")} placeholder="e.g. Sony" />
                </div>
              </Card>

              {/* Pricing & Inventory */}
              <Card title="Pricing & Inventory" icon={DollarSign}>
                <div className="grid md:grid-cols-3 gap-x-6">
                  <Input label="Regular Price" type="number" icon={DollarSign} value={formData.price} onChange={handleChange("price")} placeholder="0.00" />
                  <Input label="Discount Price" type="number" icon={DollarSign} value={formData.discountPrice} onChange={handleChange("discountPrice")} placeholder="0.00" />
                  <Input label="Stock Quantity" type="number" icon={Package} value={formData.stock} onChange={handleChange("stock")} placeholder="0" />
                </div>
              </Card>

              {/* Description */}
              <Card title="Description" icon={AlignLeft}>
                <TextArea
                  label="Product Description"
                  icon={AlignLeft}
                  value={formData.description}
                  onChange={handleChange("description")}
                  placeholder="Provide a detailed description of the product, including key features and specifications..."
                />
              </Card>

            </div>

            {/* Right Column: Gallery & Visibility */}
            <div className="space-y-8">
              
              <MultiImageDropzone images={images} setImages={setImages} />

              {/* Premium Storefront Badge */}
              <div className="bg-linear-to-br from-zinc-800 to-black rounded-xl p-8 text-white shadow-xl shadow-black/20 relative overflow-hidden flex flex-col justify-center min-h-35">
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <Globe size={32} className="text-zinc-400 mb-5 relative z-10" />
                <h3 className="text-lg font-bold mb-3 relative z-10">Storefront Visibility</h3>
                <p className="text-sm text-zinc-400 relative z-10 mb-8 leading-relaxed flex-1">
                  Once published, this product will be immediately visible to customers on your storefront and indexed for search.
                </p>
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest border-t border-zinc-700/50 pt-5 relative z-10 mt-auto">
                  <span className="text-zinc-400">Status</span>
                  <span className="text-blue-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                    Ready
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default AddProduct;