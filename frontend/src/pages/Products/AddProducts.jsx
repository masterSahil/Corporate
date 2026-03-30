import React, { useState, useRef } from "react";
import { Menu, Box, UploadCloud, Tag, DollarSign, Package, LayoutGrid, AlignLeft, X, ImageIcon, Globe, IndianRupee } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { theme } from "../../components/Theme";
import axios from "axios"
import { toast } from "../../ui/Toaster";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    price: 0,
    discount: 0,
    discountType: "percentage",
    quantity: 0,
    description: "",
    gallery: null,
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // for single files
  // const handleFileChange = (e) => {
  //   const file = e.target.files[0];

  //   if (file) {
  //     setFiles(file);
  //     const preview = URL.createObjectURL(file);

  //     setImages([{ id: Date.now(), preview }]);
  //   }
  // };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    for(let file of selectedFiles) {
      if (file.size > 1 * 1024 * 1024) {
        toast.error("Uploaded File must be less than 1MB");
        return;
      }
    }
    setFiles(selectedFiles);

    const previews = selectedFiles.map(file => ({
      id: Date.now() + Math.random(),
      preview: URL.createObjectURL(file)
    }));
    setImages(previews);
  };

  const removeImage = (idToRemove) => {
    setImages(prev => prev.filter(img => img.id !== idToRemove));
  };

  const resetForm = () => {
    setFormData({ name: "", category: "", brand: "", price: 0, discount: 0, 
      discountType: "percentage", quantity: 0, description: "", gallery: null })
    setImages([]); setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = null;
  }

  const validateForm = () => {
    if (!formData.name.trim()) return "Product Name is required";
    if (!formData.category.trim()) return "Category is required";
    if (!formData.brand.trim()) return "Brand is required";
    if (formData.price === "" || formData.price <= 0) return "A valid Price (greater than 0) is required";
    if (formData.discount === "" || formData.discount < 0) return "A valid Discount (0 or more) is required";
    if (formData.quantity === "" || formData.quantity < 0) return "A valid Stock Quantity (0 or more) is required";
    if (!formData.description.trim()) return "Product Description is required";
    if (files.length === 0) return "At least one product image or video is required";
    return null; 
  };

  const handleSubmit = async () => {
    try {
      const err = validateForm();
      if (err) {
        toast.warning(err);
        return;
      }
      setIsSubmitting(true);
      const data = new FormData();
      data.append("name", formData.name);
      data.append("category", formData.category);
      data.append("brand", formData.brand);
      data.append("price", formData.price);
      data.append("discount", formData.discount);
      data.append("discountType", formData.discountType);
      data.append("quantity", formData.quantity);
      data.append("description", formData.description);

      if (files.length > 0) {
        files.forEach(file => {
          data.append("gallery", file);
        });
      }

      await axios.post(`${import.meta.env.VITE_API_KEY}/product`, data, {withCredentials: true});
      resetForm();
      toast.success("Product Added Successfully");
      navigate("/products/manage");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went Wrong");
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tailwind arbitrary variants for the custom scrollbar
  const customScrollbarClasses = "overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

  return (
    <div className={`flex h-dvh w-full ${theme.appBg} ${theme.textMain} font-sans overflow-hidden selection:bg-zinc-200 selection:text-zinc-900`}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className={`flex-1 bg-slate-50 ${customScrollbarClasses}`}>
        
        {/* Mobile Header */}
        <div className="lg:hidden p-4 pb-0 flex justify-between items-center shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className={`flex items-center gap-2 ${theme.textMuted} hover:text-black hover:bg-zinc-100 ${theme.cardBg} border ${theme.border} px-3 py-2 rounded-lg shadow-sm transition-all`}>
            <Menu size={20} /> <span className="text-sm font-medium">Menu</span>
          </button>
        </div>

        <div className="p-6 max-w-7xl mx-auto pb-12">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-10">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Add New Product</h1>
              <p className={`text-base ${theme.textMuted} mt-2`}>Configure product details, gallery, and inventory.</p>
            </div>
            <div className="flex gap-4 w-full sm:w-auto">
              <button onClick={()=>{resetForm, navigate('/products/manage')}} className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold border ${theme.border} bg-white hover:bg-zinc-50 transition-colors`}>
                Discard
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold text-white ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-zinc-800"} shadow-lg transition-colors`}
              >
                {isSubmitting ? "Publishing..." : "Publish Product"}
              </button>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Left Column: Form Fields */}
            <div className="xl:col-span-2 space-y-8">
              
              {/* Basic Details Block */}
              <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 lg:p-8 shadow-sm`}>
                <div className={`flex items-center gap-2 mb-6 pb-4 border-b ${theme.border}`}>
                  <Box size={20} className="text-slate-900" />
                  <h2 className="text-lg font-bold text-slate-900">Basic Details</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-x-8">
                  {/* Product Name */}
                  <div className="md:col-span-2 flex flex-col gap-2 mb-6">
                    <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>Product Name</label>
                    <div className="relative flex items-center">
                      <Box size={18} className={`absolute left-4 ${theme.textMuted} pointer-events-none`} />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Sony Noise Cancelling Headphones"
                        className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg pl-11 pr-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
                      />
                    </div>
                  </div>

                  {/* Product Category */}
                  <div className="flex flex-col gap-2 mb-6">
                    <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>Product Category</label>
                    <div className="relative flex items-center">
                      <LayoutGrid size={18} className={`absolute left-4 ${theme.textMuted} pointer-events-none`} />
                      <input name="category" value={formData.category}
                        onChange={handleChange} placeholder="Category"
                        className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg pl-11 pr-10 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none cursor-pointer`}
                       />
                    </div>
                  </div>

                  {/* Brand */}
                  <div className="flex flex-col gap-2 mb-6">
                    <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>Brand</label>
                    <div className="relative flex items-center">
                      <Tag size={18} className={`absolute left-4 ${theme.textMuted} pointer-events-none`} />
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                        placeholder="e.g. Sony"
                        className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg pl-11 pr-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Inventory Block */}
              <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 lg:p-8 shadow-sm`}>
                <div className={`flex items-center gap-2 mb-6 pb-4 border-b ${theme.border}`}>
                  <IndianRupee size={20} className="text-slate-900" />
                  <h2 className="text-lg font-bold text-slate-900">Pricing & Inventory</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-x-6">
                  {/* Regular Price */}
                  <div className="flex flex-col gap-2 mb-6">
                    <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>Regular Price</label>
                    <div className="relative flex items-center">
                      <IndianRupee size={18} className={`absolute left-4 ${theme.textMuted} pointer-events-none`} />
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={(e) => setFormData(prev =>({ ...prev, price: Number(e.target.value)}))}
                        placeholder="0.00"
                        className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg pl-11 pr-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
                      />
                    </div>
                  </div>

                  {/* Discount Amount & Type */}
                  <div className="flex flex-col gap-2 mb-6">
                    <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>Discount</label>
                    <div className="relative flex items-center">
                      
                      {/* Dynamic Icon based on selected type */}
                      {formData.discountType === 'percentage' ? (
                        <span className={`absolute left-4 font-bold ${theme.textMuted} pointer-events-none`}>%</span>
                      ) : (
                        <IndianRupee size={18} className={`absolute left-4 ${theme.textMuted} pointer-events-none`} />
                      )}

                      {/* Value Input */}
                      <input type="number" name="discount" value={formData.discount}
                        onChange={(e) => setFormData(prev =>({ ...prev, discount: Number(e.target.value)}))}
                        placeholder="0" className={`w-full bg-zinc-50 border ${theme.border} border-r-2 text-slate-900 text-sm rounded-l-md pl-11 pr-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`} />

                      {/* Type Selector */}
                      <select
                        name="discountType"
                        value={formData.discountType}
                        onChange={handleChange}
                        className={`bg-zinc-100 border ${theme.border} text-slate-700 text-sm font-bold rounded-r-lg px-3 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all cursor-pointer`}
                      >
                        <option value="percentage">Percent (%)</option>
                        <option value="flat">Flat (₹)</option>
                      </select>
                    </div>
                  </div>

                  {/* Stock Quantity */}
                  <div className="flex flex-col gap-2 mb-6">
                    <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>Stock Quantity</label>
                    <div className="relative flex items-center">
                      <Package size={18} className={`absolute left-4 ${theme.textMuted} pointer-events-none`} />
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={(e) =>setFormData(prev =>({...prev, quantity: Number(e.target.value)}))}
                        placeholder="0"
                        className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg pl-11 pr-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Block */}
              <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 lg:p-8 shadow-sm`}>
                <div className={`flex items-center gap-2 mb-6 pb-4 border-b ${theme.border}`}>
                  <AlignLeft size={20} className="text-slate-900" />
                  <h2 className="text-lg font-bold text-slate-900">Description</h2>
                </div>
                
                <div className="flex flex-col gap-2 mb-6">
                  <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>Product Description</label>
                  <div className="relative">
                    <AlignLeft size={18} className={`absolute left-4 top-3.5 ${theme.textMuted} pointer-events-none`} />
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Provide a detailed description of the product, including key features and specifications..."
                      className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg pl-11 pr-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all min-h-30 resize-y`}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Gallery & Visibility */}
            <div className="space-y-8">
              
              {/* Product Gallery Block */}
              <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 lg:p-8 shadow-sm`}>
                <div className={`flex items-center gap-2 mb-6 pb-4 border-b ${theme.border}`}>
                  <ImageIcon size={20} className="text-slate-900" />
                  <h2 className="text-lg font-bold text-slate-900">Product Gallery</h2>
                </div>
                
                <div className="space-y-4">
                  {/* Image Grid */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {images.map((fileObj, index) => {
                        const isVideo = fileObj.preview.match(/\.(mp4|webm|ogg)$/i);

                        return (
                          <div key={fileObj.id} className={`relative group rounded-xl overflow-hidden border ${theme.border} aspect-square bg-zinc-50`} >
                            {isVideo ? (
                              <video src={fileObj.preview} className="w-full h-full object-cover" controls />
                            ) : (
                              <img src={fileObj.preview} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                            )}

                            {/* Overlay & Remove Button */}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button onClick={() => removeImage(fileObj.id)} className="bg-white text-rose-600 p-2 rounded-full hover:scale-110 transition-transform shadow-lg cursor-pointer" >
                                <X size={16} strokeWidth={3} />
                              </button>
                            </div>

                            {/* Primary Badge */}
                            {index === 0 && (
                              <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md"> Primary </span>
                            )}

                            {/* Type Badge */}
                            <span className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
                              {isVideo ? "Video" : "Image"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Upload Button */}
                  <label className={`border-2 border-dashed ${images.length > 0 ? 'border-zinc-300 py-6' : 'border-zinc-300 py-12'} rounded-xl flex flex-col items-center justify-center text-center hover:border-black hover:bg-zinc-50 transition-all cursor-pointer group`}>
                    <div className={`bg-slate-100 rounded-full group-hover:scale-110 transition-transform ${images.length > 0 ? 'p-3 mb-2' : 'p-4 mb-4'}`}>
                      <UploadCloud size={images.length > 0 ? 20 : 28} className="text-slate-600" />
                    </div>
                    <p className={`${images.length > 0 ? 'text-sm' : 'text-base'} font-bold text-slate-900 mb-1`}>
                      {images.length > 0 ? 'Add more images' : 'Click to upload images'}
                    </p>
                    {!images.length && <p className={`text-sm ${theme.textMuted}`}>JPG, PNG up to 1MB each</p>}
                    <input 
                      type="file" 
                      // accept="image/*" 
                      multiple 
                      onChange={handleFileChange} 
                      className="hidden" 
                      ref={fileInputRef}
                    />
                  </label>
                </div>
              </div>

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