import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ChevronLeft, ArrowRight, Minus, Plus,
    ShieldCheck, Truck, RefreshCw, Package,
    Play, Info, ShoppingBag
} from "lucide-react";
import axios from "axios";
import EmployeeSidebar from "./EmployeeSidebar";
import { toast } from "../ui/Toaster"; 

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Core States
    const [product, setProduct] = useState(null);
    const [activeMedia, setActiveMedia] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Cart Logic States
    const [currentUserId, setCurrentUserId] = useState(null);
    const [cartItem, setCartItem] = useState(null); 
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                setIsLoading(true);
                const [prodRes, roleRes, cartRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_KEY}/product-single/${id}`, { withCredentials: true }),
                    axios.get(`${import.meta.env.VITE_API_KEY}/check-role`, { withCredentials: true }),
                    axios.get(`${import.meta.env.VITE_API_KEY}/cart-all`, { withCredentials: true })
                ]);

                const foundProduct = prodRes.data.product.find(p => p._id === id);
                setProduct(foundProduct);

                const user = roleRes.data.user;
                setCurrentUserId(user._id);

                const userCart = cartRes.data.cart.filter(item => item.buyerId === user._id);
                const existingCartItem = userCart.find(c => c.productId === id);
                setCartItem(existingCartItem || null);

            } catch (err) {
                console.error("Error fetching data:", err);
                toast.error("Failed to load product details.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchMasterData();
    }, [id]);

    // --- CART ACTIONS --- //
    const addToCart = async () => {
        if (!currentUserId || !product) return;
        if (product.quantity <= 0) {
            toast.error("Product is out of stock.");
            return;
        }

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_KEY}/cart`, { 
                buyerId: currentUserId, 
                productId: product._id, 
                quantity: 1 
            }, { withCredentials: true });
            
            setCartItem(res.data.cart);
            toast.success("Added to Cart");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add product");
        }
    };

    const updateQuantity = async (newQuantity) => {
        if (!cartItem) return;

        try {
            if (newQuantity <= 0) {
                await axios.delete(`${import.meta.env.VITE_API_KEY}/cart/${cartItem._id}`, { withCredentials: true });
                setCartItem(null);
                toast.success("Removed from cart");
            } else {
                if (newQuantity > product.quantity) {
                    toast.error("Maximum available stock reached.");
                    return;
                }
                
                const res = await axios.put(`${import.meta.env.VITE_API_KEY}/cart/${cartItem._id}`, {
                    buyerId: currentUserId,
                    productId: product._id,
                    quantity: newQuantity
                }, { withCredentials: true });

                setCartItem(res.data.cart);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update quantity");
        }
    };

    if (isLoading || !product) {
        return (
            <div className="h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-zinc-200 border-t-black rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 text-center px-4">
                        {isLoading ? "Loading Details..." : "No Products Found"}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-white text-black font-sans selection:bg-black selection:text-white overflow-hidden">
            <EmployeeSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <main className="flex-1 overflow-y-auto bg-white scroll-smooth custom-scrollbar relative">
                
                {/* Top Navigation */}
                <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-4 sm:px-8 py-4 flex justify-between items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] hover:text-zinc-500 transition-colors"
                    >
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Store
                    </button>
                    <div className="hidden md:flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">
                            Catalog // {product?._id ? product._id.slice(-6) : "LOADING"}
                        </span>
                    </div>
                </nav>

                {/* Main Content Container */}
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 min-h-full">

                    {/* Left Side: Media Gallery (5 Columns) */}
                    <section className="lg:col-span-6 xl:col-span-5 border-b lg:border-b-0 lg:border-r border-zinc-100 p-4 sm:p-8 lg:p-6 bg-zinc-50/30">
                        <div className="lg:sticky lg:top-24 space-y-4 sm:space-y-6">
                            
                            {/* Main Display */}
                            <div className="aspect-square w-full bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm relative group flex items-center justify-center">
                                {product.gallery?.length > 0 ? (
                                    product.gallery[activeMedia]?.fileType?.includes("video") || product.gallery[activeMedia]?.url?.endsWith(".mp4") ? (
                                        <video
                                            src={product.gallery[activeMedia].fileUrl || product.gallery[activeMedia].url}
                                            autoPlay muted loop playsInline
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <img src={product.gallery[activeMedia]?.fileUrl || product.gallery[activeMedia]?.url}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                            alt={product.name}
                                        />
                                    )
                                ) : (
                                    <Package size={64} className="text-zinc-200 sm:w-20 sm:h-20" />
                                )}

                                {/* Media Overlay Badge */}
                                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 bg-black/80 backdrop-blur-md text-white text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg pointer-events-none">
                                    Preview // 0{activeMedia + 1}
                                </div>
                            </div>

                            {/* Thumbnails */}
                            {product.gallery?.length > 1 && (
                                <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
                                    {product.gallery.map((media, idx) => (
                                        <button key={idx} onClick={() => setActiveMedia(idx)}
                                            className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-white shadow-sm snap-start
                                            ${activeMedia === idx ? 'border-black scale-95' : 'border-transparent opacity-50 hover:opacity-100'}`} >
                                            <img src={media.fileUrl || media.url} className="w-full h-full object-cover" alt="" />
                                            {(media.fileType?.includes("video") || media.url?.endsWith(".mp4")) && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                    <Play size={16} fill="white" className="text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Right Side: Product Info */}
                    <section className="lg:col-span-6 p-5 sm:p-8 lg:p-6 xl:p-16 flex flex-col h-full">
                        <div className="mb-8 sm:mb-12">
                            
                            {/* Tags */}
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                                <span className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full">
                                    {product.brand || "Exclusive"}
                                </span>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                    {product.category}
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold uppercase  leading-[0.9] mb-6 sm:mb-8 wrap-break-word">
                                {product.name}
                            </h1>

                            {/* Pricing */}
                            <div className="flex flex-wrap items-baseline gap-2 sm:gap-4 mb-8 sm:mb-10 border-b border-zinc-100 pb-6 sm:pb-8">
                                <span className="text-4xl sm:text-5xl font-black tracking-tighter">
                                    {product.price * (cartItem ? cartItem.quantity : 1)}
                                </span>
                                <span className="text-lg sm:text-xl font-bold text-zinc-300 uppercase italic">rs</span>
                                {product.discount > 0 && (
                                    <span className="ml-0 sm:ml-2 text-[10px] sm:text-xs font-black border-2 border-black px-2 py-1 rounded-md mt-2 sm:mt-0">
                                        -{product.discount}% OFF
                                    </span>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-6 text-zinc-500 font-medium leading-relaxed">
                                <div className="flex items-start gap-3">
                                    <Info size={18} className="text-black shrink-0 mt-1" />
                                    <p className="text-sm sm:text-base">{product.description || "No description available for this premium reward."}</p>
                                </div>
                            </div>
                        </div>

                        {/* Inventory & Actions Area */}
                        <div className="mt-auto space-y-6 sm:space-y-8">
                            
                            {/* Stock Indicator */}
                            <div className="flex items-center justify-between">
                                <div className="text-left">
                                    <h4 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-1">Stock Status</h4>
                                    <p className={`text-base sm:text-lg font-black uppercase tracking-tight ${product.quantity > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                                        {product.quantity > 0 ? `${product.quantity} Units Available` : "Out of Stock"}
                                    </p>
                                </div>
                            </div>

                            {/* Dynamic Cart Controls */}
                            {cartItem ? (
                                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 w-full">
                                    
                                    {/* Status Left */}
                                    <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black text-white rounded-full flex items-center justify-center shrink-0">
                                            <ShoppingBag size={18} className="sm:w-5 sm:h-5" />
                                        </div>
                                        <div>
                                            <span className="block text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Status</span>
                                            <span className="block text-xs sm:text-sm font-bold text-black uppercase tracking-widest">Added to Cart</span>
                                        </div>
                                    </div>
                                    
                                    {/* Toggles Right */}
                                    <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-xl p-1.5 border border-zinc-200 shadow-sm w-full sm:w-auto justify-between sm:justify-center">
                                        <button
                                            onClick={() => updateQuantity(cartItem.quantity - 1)}
                                            className="w-12 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100 active:scale-95"
                                        >
                                            <Minus size={16} className="sm:w-4 sm:h-4" />
                                        </button>
                                        <span className="font-black text-xl sm:text-2xl w-10 sm:w-12 text-center text-black">
                                            {cartItem.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(cartItem.quantity + 1)}
                                            className="w-12 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100 active:scale-95"
                                        >
                                            <Plus size={16} className="sm:w-4 sm:h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={addToCart}
                                    disabled={product.quantity <= 0}
                                    className="group w-full bg-black text-white py-4 sm:py-5 rounded-2xl flex items-center justify-center gap-3 sm:gap-4 hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:bg-zinc-100 disabled:text-zinc-400 disabled:cursor-not-allowed border border-transparent disabled:border-zinc-200 shadow-xl disabled:shadow-none"
                                >
                                    <span className="text-sm sm:text-base font-black uppercase tracking-widest">
                                        {product.quantity > 0 ? "Add to Cart" : "Currently Unavailable"}
                                    </span>
                                    {product.quantity > 0 && <ArrowRight size={18} className="sm:w-5 sm:h-5 group-hover:translate-x-2 transition-transform" />}
                                </button>
                            )}

                            {/* Trust Markers */}
                            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-6 border-t border-zinc-100">
                                {[
                                    { icon: ShieldCheck, label: "Verified" },
                                    { icon: Truck, label: "Express" },
                                    { icon: RefreshCw, label: "Returns" }
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col items-center justify-center gap-1 sm:gap-2 py-3 sm:py-4 rounded-2xl bg-zinc-50 border border-zinc-100 text-zinc-600 hover:text-black hover:border-zinc-300 transition-colors">
                                        <item.icon size={18} className="sm:w-5 sm:h-5" />
                                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default ProductDetails;