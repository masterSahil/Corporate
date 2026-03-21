import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, ImagePlus, X, Loader2, RefreshCw } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { theme } from "../../components/Theme";
import axios from "axios";
import { toast } from "../../ui/Toaster";

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const [formData, setFormData] = useState({
    name: "", category: "", brand: "", price: "", discount: "", 
    discountType: "percentage", quantity: "", description: "",
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_KEY}/product-all`, { withCredentials: true });
        const product = res.data.product.find(p => (p._id?.$oid || p._id) === id);

        if (product) {
          setFormData({
            name: product.name || "",
            category: product.category || "",
            brand: product.brand || "",
            price: product.price || "",
            discount: product.discount || "",
            discountType: product.discountType || "percentage",
            quantity: product.quantity || "",
            description: product.description || "",
          });
          setExistingImages(product.gallery || []);
        } else {
          toast.error("Product not found");
          navigate(-1); 
        }
      } catch (error) {
        toast.error("Failed to fetch product");
        console.error("Failed to fetch product:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Image Handling ---
  const handleImageSelect = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewImages((prev) => [...prev, ...filesArray]);
    }
  };

  const removeNewImage = (indexToRemove) => {
    setNewImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // Remove existing image from the UI state
  const removeExistingImage = (indexToRemove) => {
    setExistingImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const submitData = new FormData();
      
      Object.keys(formData).forEach((key) => {
        submitData.append(key, formData[key]);
      });

      // Send the images we decided to KEEP to the backend
      submitData.append("existingGallery", JSON.stringify(existingImages));

      if (newImages.length > 0) {
        newImages.forEach((file) => {
          submitData.append("gallery", file);
        });
      }
      await axios.put(`${import.meta.env.VITE_API_KEY}/product/${id}`, submitData, {withCredentials: true});

      toast.success("Product updated successfully!");
      navigate(-1); 
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update product");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const customScrollbar = "overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

  return (
    <div className={`flex h-screen w-full ${theme.appBg} ${theme.textMain} font-sans overflow-hidden selection:bg-zinc-200 selection:text-zinc-900`}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {isLoading && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-999">
          <div className="rounded-xl bg-white/70 shadow-xl px-6 py-5 flex items-center gap-3">
            <RefreshCw className="animate-spin text-slate-700" size={22} />
            <span className="text-sm font-semibold text-slate-800"> Loading... </span>
          </div>
        </div>
      )}

      <main className={`flex-1 bg-slate-50 ${customScrollbar} flex flex-col`}>
        <div className="p-6 max-w-7xl mx-auto w-full flex-1 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => navigate(-1)} className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors hidden sm:block">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">Edit Product</h1>
                <p className={`text-sm ${theme.textMuted} mt-1`}>Update details and manage images for this product.</p>
              </div>
            </div>

            <div className="flex gap-4 w-full sm:w-auto mt-2 sm:mt-0">
              <button onClick={() => navigate(-1)} className={`flex-1 sm:flex-none px-6 py-3 rounded-lg text-sm font-bold border ${theme.border} bg-white hover:bg-zinc-50 transition-colors`}> Cancel
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-6">
              {/* General Info */}
              <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 shadow-sm`}>
                <h2 className="text-lg font-bold text-slate-900 mb-4">General Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                      <input type="text" name="category" value={formData.category} onChange={handleInputChange} required className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Brand</label>
                      <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} required className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all resize-none"></textarea>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 shadow-sm`}>
                <h2 className="text-lg font-bold text-slate-900 mb-4">Pricing & Inventory</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price (₹)</label>
                    <input type="number" name="price" min="0" value={formData.price} onChange={handleInputChange} required className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quantity in Stock</label>
                    <input type="number" name="quantity" min="0" value={formData.quantity} onChange={handleInputChange} required className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Discount</label>
                    <input type="number" name="discount" min="0" value={formData.discount} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Discount Type</label>
                    <select name="discountType" value={formData.discountType} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all">
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount (₹)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-80 flex flex-col gap-6">
              {/* Media Card */}
              <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 shadow-sm`}>
                <h2 className="text-lg font-bold text-slate-900 mb-4">Media</h2>
                
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer mb-6">
                  <ImagePlus size={24} className="text-slate-400 mb-2" />
                  <span className="text-sm font-medium text-slate-600">Click to upload new images</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageSelect} className="hidden" />
                </label>

                {newImages.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">New Images</p>
                    <div className="grid grid-cols-3 gap-2">
                      {newImages.map((file, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                          <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 p-1 bg-white border border-rose-100 rounded-md text-rose-600 hover:bg-rose-50 transition-colors shadow-sm">
                            <X size={14} strokeWidth={3} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {existingImages.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Current Images</p>
                    <div className="grid grid-cols-3 gap-2">
                      {existingImages.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                          <img src={img.fileUrl} alt="Existing product" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 p-1 bg-white border border-rose-100 rounded-md text-rose-600 hover:bg-rose-50 transition-colors shadow-sm">
                            <X size={14} strokeWidth={3} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" disabled={isSaving} className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-black text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed">
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {isSaving ? "Saving..." : "Update Product"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default UpdateProduct;