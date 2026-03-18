import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ChevronLeft, ArrowRight, Minus, Plus,
    ShieldCheck, Truck, RefreshCw, Package,
    Play, Share2, Info
} from "lucide-react";
import axios from "axios";
import EmployeeSidebar from "./EmployeeSidebar";

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [activeMedia, setActiveMedia] = useState(0);
    const [qty, setQty] = useState(1);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_KEY}/product-single/${id}`, { withCredentials: true });

                setProduct(res.data.product.find(p => p._id === id));
            } catch (err) {
                console.log("Error fetching product:", err);
            }
        };
        fetchProduct();
    }, [id]);

    if (!product) {
        return (
            <div className="h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-zinc-200 border-t-black rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">No Products Found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-white text-black font-sans selection:bg-black selection:text-white overflow-hidden">
            <EmployeeSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <main className="flex-1 overflow-y-auto bg-white scroll-smooth">
                {/* Top Navigation */}
                <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-8 py-5 flex justify-between items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] hover:text-zinc-500 transition-colors"
                    >
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Collection
                    </button>
                    <div className="hidden md:flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">
                            {/* Added optional chaining ?. to safely access _id */}
                            Catalog // {product?._id ? product._id.slice(-6) : "LOADING"}
                        </span>
                    </div>
                </nav>

                <div className="max-w-350 mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-screen">

                    {/* Left Side: Media Gallery (5 Columns) */}
                    <section className="lg:col-span-5 border-r border-zinc-100 p-8 lg:p-12 bg-zinc-50/30">
                        <div className="sticky top-24 space-y-6">
                            {/* Main Display */}
                            <div className="aspect-square bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm relative group">
                                {product.gallery[activeMedia]?.fileType?.includes("video") || product.gallery[activeMedia]?.url?.endsWith(".mp4") ? (
                                    <video
                                        src={product.gallery[activeMedia].fileUrl || product.gallery[activeMedia].url}
                                        autoPlay muted loop
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <img src={product.gallery[activeMedia]?.fileUrl || product.gallery[activeMedia]?.url}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-102"
                                        alt={product.name}
                                    />
                                )}

                                {/* Media Overlay Badge */}
                                <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg">
                                    Preview // 0{activeMedia + 1}
                                </div>
                            </div>

                            {/* Thumbnails */}
                            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                {product.gallery.map((media, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveMedia(idx)}
                                        className={`relative w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-white shadow-sm
                      ${activeMedia === idx ? 'border-black scale-95' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                    >
                                        <img src={media.fileUrl || media.url} className="w-full h-full object-cover" alt="" />
                                        {(media.fileType?.includes("video") || media.url?.endsWith(".mp4")) && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                <Play size={16} fill="white" className="text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Right Side: Product Info (5 Columns) */}
                    <section className="lg:col-span-5 p-8 lg:p-16 flex flex-col">
                        <div className="mb-12">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full">
                                    {product.brand || "Exclusive"}
                                </span>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                    {product.category}
                                </span>
                            </div>

                            <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter leading-[0.9] mb-8 italic">
                                {product.name}
                            </h1>

                            <div className="flex items-baseline gap-4 mb-10">
                                <span className="text-5xl font-black tracking-tighter">{product.price * qty}</span>
                                <span className="text-xl font-bold text-zinc-300 uppercase italic">Price</span>
                                {product.discount > 0 && (
                                    <span className="ml-2 text-xs font-black border-2 border-black px-2 py-1 rounded-md">
                                        -{product.discount}% OFF
                                    </span>
                                )}
                            </div>

                            <div className="space-y-6 text-zinc-500 font-medium leading-relaxed">
                                <div className="flex items-start gap-3">
                                    <Info size={18} className="text-black shrink-0 mt-1" />
                                    <p className="text-sm">{product.description || "No description available for this premium reward."}</p>
                                </div>
                            </div>
                        </div>

                        {/* Inventory & Actions */}
                        <div className="mt-auto space-y-8">
                            <div className="flex items-center justify-between border-y border-zinc-100 py-8">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">Quantity</h4>
                                    <div className="flex items-center gap-6 bg-zinc-50 rounded-2xl p-2 border border-zinc-100">
                                        <button
                                            onClick={() => setQty(Math.max(1, qty - 1))}
                                            className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all border border-transparent hover:border-zinc-200"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="font-black text-xl w-8 text-center">{qty}</span>
                                        <button
                                            onClick={() => setQty(Math.min(product.quantity, qty + 1))}
                                            className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all border border-transparent hover:border-zinc-200"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">Availability</h4>
                                    <p className="text-lg font-black uppercase tracking-tight">
                                        {product.quantity > 0 ? `${product.quantity} In Stock` : "Out of Stock"}
                                    </p>
                                </div>
                            </div>

                            <button
                                disabled={product.quantity === 0}
                                className="group w-full bg-black text-white py-4 rounded-xl flex items-center justify-center gap-4 hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:bg-zinc-200 disabled:cursor-not-allowed"
                            >
                                <span className="text-sm font-black uppercase ">Redeem Reward</span>
                                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                            </button>

                            {/* Trust Markers */}
                            <div className="grid grid-cols-3 gap-4 pt-4">
                                {[
                                    { icon: ShieldCheck, label: "Verified" },
                                    { icon: Truck, label: "Express" },
                                    { icon: RefreshCw, label: "Returns" }
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                                        <item.icon size={18}  />
                                        <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
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