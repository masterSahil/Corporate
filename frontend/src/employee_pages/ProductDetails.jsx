import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ChevronLeft, ArrowRight, Minus, Plus,
    ShieldCheck, Truck, RefreshCw, Package,
    Play, Info, ShoppingBag, Star, Edit3
} from "lucide-react";
import axios from "axios";
import EmployeeSidebar from "./EmployeeSidebar";
import { toast } from "../ui/Toaster";

// Mock Reviews Data
const mockReviews = [
    { id: 1, user: "Sarah M.", rating: 5, comment: "Absolutely incredible! The build quality is premium, and the sound isolation completely blocks out my noisy office.", date: "2 days ago" },
    { id: 2, user: "James K.", rating: 4, comment: "Really solid product. Battery life is fantastic. Only giving 4 stars because the carrying case feels a bit flimsy.", date: "1 week ago" }
];

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Core States
    const [product, setProduct] = useState(null);
    const [activeMedia, setActiveMedia] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    // Cart Logic States
    const [currentUserId, setCurrentUserId] = useState(null);
    const [currentUserName, setCurrentUserName] = useState(null);
    const [cartItem, setCartItem] = useState(null); 

    // Review States
    const [reviews, setReviews] = useState(mockReviews);
    const [isWritingReview, setIsWritingReview] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: "" });

    const fetchMasterData = async () => {
        try {
            setIsLoading(true);
            const [prodRes, roleRes, cartRes, reviewRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_KEY}/product-single/${id}`, { withCredentials: true }),
                axios.get(`${import.meta.env.VITE_API_KEY}/check-role`, { withCredentials: true }),
                axios.get(`${import.meta.env.VITE_API_KEY}/cart-all`, { withCredentials: true }),
                axios.get(`${import.meta.env.VITE_API_KEY}/rating-all`, { withCredentials: true })
            ]);

            const foundProduct = prodRes.data.product.find(p => p._id === id);
            setProduct(foundProduct);

            const user = roleRes.data.user;
            setCurrentUserId(user._id); setCurrentUserName(user.username);

            // Filter reviews for THIS product and map them to match your UI
            const productReviews = reviewRes.data.rating
                .filter(r => r.productId === id)
                .map(r => ({
                    id: r._id,
                    user: currentUserName,
                    rating: r.rate,
                    comment: r.review, 
                    date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "Recently"
                }));

            setReviews(productReviews.length > 0 ? productReviews : mockReviews);

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
    useEffect(() => {
        fetchMasterData();
    }, []);

    // --- CART ACTIONS ---
    const addToCart = async () => {
        if (!currentUserId || !product) return;
        if (product.quantity <= 0) return toast.error("Product is out of stock.");

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_KEY}/cart`, { 
                buyerId: currentUserId, productId: product._id, quantity: 1 
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
                if (newQuantity > product.quantity) return toast.error("Maximum stock reached.");
                const res = await axios.put(`${import.meta.env.VITE_API_KEY}/cart/${cartItem._id}`, {
                    buyerId: currentUserId, productId: product._id, quantity: newQuantity
                }, { withCredentials: true });
                setCartItem(res.data.cart);
            }
        } catch (error) {
            toast.error("Failed to update quantity");
        }
    };

    // --- REVIEW ACTIONS ---
    const handleSubmitReview = async (e) => {
    try {
        e.preventDefault();
        if (!newReview.comment.trim()) return toast.error("Please write a comment.");

        const res = await axios.post(`${import.meta.env.VITE_API_KEY}/rating`, 
            { review: newReview.comment, buyerId: currentUserId, productId: id, rate: newReview.rating },
            { withCredentials: true });

        const savedRating = res.data.rating;
        const formattedReview = {
            id: savedRating._id,
            user: currentUserName, 
            rating: savedRating.rate,
            comment: savedRating.review,
        };

        setReviews([formattedReview, ...reviews]);
        setIsWritingReview(false);
        setNewReview({ rating: 5, comment: "" });

        toast.success("Review posted successfully!");
    } catch (error) {
        toast.error(error.response?.data?.message || "Error posting review");
        console.error(error);
    }
};

    if (isLoading || !product) {
        return (
            <div className="h-screen flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-white text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white overflow-hidden">
            <EmployeeSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <main className="flex-1 overflow-y-auto bg-white scroll-smooth custom-scrollbar relative flex flex-col">
                
                {/* Top Nav */}
                <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-100 px-6 py-4 flex justify-between items-center">
                    <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
                        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Store
                    </button>
                    <span className="text-xs font-medium text-zinc-400 hidden sm:block">Product / {product._id.slice(-8)}</span>
                </nav>

                <div className="max-w-300 w-full mx-auto px-6 py-8 lg:py-12">
                    
                    {/* Top Section: Split 50/50 Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">

                        {/* LEFT: Image Gallery (Shrink-wrapped to avoid whitespace) */}
                        <div className="w-full flex flex-col gap-4">
                            <div className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden relative flex items-center justify-center group shadow-sm">
                                {product.gallery?.length > 0 ? (
                                    product.gallery[activeMedia]?.fileType?.includes("video") || product.gallery[activeMedia]?.url?.endsWith(".mp4") ? (
                                        <video src={product.gallery[activeMedia].fileUrl || product.gallery[activeMedia].url} autoPlay muted loop playsInline className="w-full h-auto max-h-150 object-contain" />
                                    ) : (
                                        <img 
                                            src={product.gallery[activeMedia]?.fileUrl || product.gallery[activeMedia]?.url} 
                                            alt={product.name} 
                                            className="w-full h-auto max-h-150 object-contain transition-transform duration-700 group-hover:scale-105" 
                                        />
                                    )
                                ) : (
                                    <div className="h-100 flex items-center justify-center"><Package size={80} className="text-zinc-200" /></div>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {product.gallery?.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                                    {product.gallery.map((media, idx) => (
                                        <button key={idx} onClick={() => setActiveMedia(idx)}
                                            className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-white
                                            ${activeMedia === idx ? 'border-zinc-900' : 'border-zinc-100 opacity-60 hover:opacity-100'}`} >
                                            <img src={media.fileUrl || media.url} className="w-full h-full object-cover" alt="" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Product Info, Cart, and Trust Badges */}
                        <div className="flex flex-col">
                            
                            {/* Title & Price Info */}
                            <div className="mb-6">
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <span className="px-3 py-1 bg-zinc-900 text-white text-[11px] font-semibold uppercase tracking-wider rounded-full">
                                        {product.brand || "Exclusive"}
                                    </span>
                                    <span className="text-sm font-medium text-zinc-500">{product.category}</span>
                                </div>
                                <h1 className="text-3xl lg:text-4xl font-semibold text-zinc-900 mb-3 leading-tight">{product.name}</h1>
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl font-bold text-zinc-900">Rs {product.price * (cartItem ? cartItem.quantity : 1)}</span>
                                    {product.discount > 0 && <span className="text-sm font-semibold bg-rose-50 text-rose-600 px-2 py-1 rounded-md">{product.discount}% OFF</span>}
                                </div>
                            </div>

                            <p className="text-zinc-600 text-sm sm:text-base leading-relaxed mb-8">
                                {product.description || "Premium quality product designed for excellence. Fits perfectly into your lifestyle with outstanding durability and functionality."}
                            </p>

                            {/* Cart Action Box */}
                            <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-6 mb-6">
                                <div className="flex justify-between items-center mb-5">
                                    <span className="text-sm font-medium text-zinc-600">Availability</span>
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${product.quantity > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                                        {product.quantity > 0 ? `${product.quantity} In Stock` : "Out of Stock"}
                                    </span>
                                </div>

                                {cartItem ? (
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="flex items-center gap-4 bg-zinc-50 rounded-xl p-1.5 border border-zinc-200 w-full sm:w-1/2 justify-between">
                                            <button onClick={() => updateQuantity(cartItem.quantity - 1)} className="w-10 h-10 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-white hover:shadow-sm transition-all"><Minus size={18} /></button>
                                            <span className="font-semibold text-lg">{cartItem.quantity}</span>
                                            <button onClick={() => updateQuantity(cartItem.quantity + 1)} className="w-10 h-10 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-white hover:shadow-sm transition-all"><Plus size={18} /></button>
                                        </div>
                                        <button className="w-full sm:w-1/2 bg-zinc-900 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 opacity-80 cursor-default">
                                            <ShoppingBag size={18} /> Added to Cart
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={addToCart} disabled={product.quantity <= 0} className="w-full bg-zinc-900 text-white py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        <span className="font-semibold">Add to Cart</span>
                                        <ArrowRight size={18} />
                                    </button>
                                )}
                            </div>

                            {/* Trust Badges - Moved Back Here */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { icon: ShieldCheck, title: "1 Yr Warranty" },
                                    { icon: Truck, title: "Fast Delivery" },
                                    { icon: RefreshCw, title: "Free Returns" }
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-zinc-50 border border-zinc-100 text-center">
                                        <item.icon size={22} className="text-zinc-600 mb-1.5" />
                                        <span className="text-[10px] sm:text-xs font-semibold text-zinc-800">{item.title}</span>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>

                    {/* Bottom Section: Reviews Only */}
                    <div className="mt-16 pt-12 border-t border-zinc-200">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                                <div>
                                    <h3 className="text-2xl font-semibold text-zinc-900 flex items-center gap-2">
                                        <Star size={24} className="fill-yellow-400 text-yellow-400" /> Customer Reviews
                                    </h3>
                                    <p className="text-sm text-zinc-500 mt-1">Based on {reviews.length} reviews for this product</p>
                                </div>
                                <button onClick={() => setIsWritingReview(!isWritingReview)} className="bg-white border border-zinc-200 text-sm font-semibold text-zinc-900 px-5 py-2.5 rounded-xl hover:bg-zinc-50 flex items-center gap-2 transition-colors shadow-sm">
                                    <Edit3 size={16} /> {isWritingReview ? "Cancel Review" : "Write a Review"}
                                </button>
                            </div>

                            {/* Write Review Form */}
                            {isWritingReview && (
                                <form onSubmit={handleSubmitReview} className="mb-10 p-6 sm:p-8 bg-zinc-50 border border-zinc-100 rounded-2xl animate-in fade-in slide-in-from-top-4">
                                    <div className="mb-5">
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">Overall Rating</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button key={star} type="button" onClick={() => setNewReview({ ...newReview, rating: star })} className="focus:outline-none transition-transform hover:scale-110">
                                                    <Star size={28} className={newReview.rating >= star ? "fill-yellow-400 text-yellow-400" : "text-zinc-300"} />
                                                </button>
                                            ))} 
                                        </div>
                                    </div>
                                    <div className="mb-5">
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">Your Experience</label>
                                        <textarea rows="4" placeholder="What did you like or dislike?" value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} className="w-full rounded-xl border border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 p-4 text-sm resize-none shadow-sm" />
                                    </div>
                                    <button type="submit" className="bg-zinc-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-sm">
                                        Submit Review
                                    </button>
                                </form>
                            )}

                            {/* Reviews List Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {reviews.map((review) => (
                                    <div key={review.id} className="p-6 border border-zinc-100 rounded-2xl bg-white shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-sm font-bold text-zinc-700">
                                                    {review?.user?.charAt(0) || "?"}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-semibold text-zinc-900">{review.user}</h4>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={12} className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-200"} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xs text-zinc-400">{review.date}</span>
                                        </div>
                                        <p className="text-sm text-zinc-600 leading-relaxed">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProductDetails;