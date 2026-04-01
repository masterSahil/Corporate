import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ArrowRight, Minus, Plus, ShieldCheck, Truck, RefreshCw, Package, ShoppingBag, Star, Edit3, CheckCircle2, Trash2, Save, X } from "lucide-react";
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
    const [isLoading, setIsLoading] = useState(true);

    // Cart Logic States
    const [currentUserId, setCurrentUserId] = useState(null);
    const [currentUserName, setCurrentUserName] = useState(null);
    const [cartItem, setCartItem] = useState(null);

    // Review States
    const [reviews, setReviews] = useState([]);
    const [isWritingReview, setIsWritingReview] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: "" });

    // Edit States
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editData, setEditData] = useState({ rating: 5, comment: "" });

    const fetchMasterData = async () => {
        try {
            setIsLoading(true);
            const [prodRes, roleRes, cartRes, reviewRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_KEY}/product-single/${id}`, { withCredentials: true }),
                axios.get(`${import.meta.env.VITE_API_KEY}/check-role`, { withCredentials: true }),
                axios.get(`${import.meta.env.VITE_API_KEY}/cart-all`, { withCredentials: true }),
                axios.get(`${import.meta.env.VITE_API_KEY}/rating-all`, { withCredentials: true })
            ]);

            const foundProduct = prodRes.data.product;
            setProduct(foundProduct);

            const user = roleRes.data.user;
            setCurrentUserId(user._id);
            setCurrentUserName(user.username);

            // Correctly mapping usernames from individual review records
            const productReviews = reviewRes.data.rating.filter(r => r.productId === id)
                .map(r => ({
                    id: r._id,
                    buyerId: r.buyerId?._id || r.buyerId,
                    user: r.buyerId?.username || "User",
                    rating: r.rate,
                    comment: r.review,
                    date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "Recently"
                }));

            setReviews(productReviews);

            const userCart = cartRes.data.cart.filter(item => item.buyerId === user._id);
            setCartItem(userCart.find(c => c.productId === id) || null);

        } catch (err) {
            console.error("Error fetching data:", err);
            toast.error("Failed to Fetching Details.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchMasterData() }, []);

    // --- CART ACTIONS ---
    const addToCart = async () => {
        if (!currentUserId || !product) return;
        if (product.quantity <= 0) return toast.error("Product is out of stock.");
        try {
            setIsLoading(true);
            const res = await axios.post(`${import.meta.env.VITE_API_KEY}/cart`, {
                buyerId: currentUserId, productId: product._id, quantity: 1
            }, { withCredentials: true });
            setCartItem(res.data.cart);
            toast.success("Products Added to Cart Successfully");
        } catch (error) {
            toast.error("Failed to add product in cart");
        } finally {
            setIsLoading(false);
        }
    };

    const updateQuantity = async (newQuantity) => {
        if (!cartItem) return;
        try {
            if (newQuantity <= 0) {
                await axios.delete(`${import.meta.env.VITE_API_KEY}/cart/${cartItem._id}`, { withCredentials: true });
                setCartItem(null);
                toast.success("Product Removed from Cart Successfully");
            } else {
                if (newQuantity > product.quantity) return toast.error("Maximum stock reached.");
                const res = await axios.put(`${import.meta.env.VITE_API_KEY}/cart/${cartItem._id}`, {
                    buyerId: currentUserId, productId: product._id, quantity: newQuantity
                }, { withCredentials: true });
                setCartItem(res.data.cart);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to Update Product Quantity");
            console.log(error);
        }
    };

    // --- REVIEW ACTIONS ---
    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!newReview.comment.trim()) return toast.error("Please write a comment.");
        try {
            setIsLoading(true);
            const res = await axios.post(`${import.meta.env.VITE_API_KEY}/rating`,
                { review: newReview.comment, buyerId: currentUserId, productId: id, rate: newReview.rating, username: currentUserName }, { withCredentials: true });

            const saved = res.data.rating;
            setReviews([{ id: saved._id, buyerId: currentUserId, user: currentUserName, rating: saved.rate, comment: saved.review, date: "Just now" }, ...reviews]);
            setIsWritingReview(false);
            setNewReview({ rating: 5, comment: "" });
            toast.success("Review Posted Successfully!");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Error Posting Review");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        try {
            setIsLoading(true);
            await axios.delete(`${import.meta.env.VITE_API_KEY}/rating/${reviewId}`, { withCredentials: true });
            setReviews(reviews.filter(r => r.id !== reviewId));
            toast.success("Review Deleted Successfully");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to delete review");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateReview = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await axios.put(`${import.meta.env.VITE_API_KEY}/rating/${editingReviewId}`,
                { review: editData.comment, rate: editData.rating }, { withCredentials: true });

            setReviews(reviews.map(r => r.id === editingReviewId ? { ...r, comment: editData.comment, rating: editData.rating } : r));
            setEditingReviewId(null);
            toast.success("Review Updated Successfully!");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to Update Review");
            console.log(error)
        } finally {
            setIsLoading(false);
        }
    };

    const averageRating = reviews.length > 0 ?
        (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0;

    // --- NEW: Price Calculation Function ---
    const getFinalPrice = (prod) => {
        if (!prod?.discount || prod?.discount <= 0) return prod?.price;
        
        if (prod?.discountType === "percentage") {
            return Math.round(prod.price - (prod.price * prod.discount) / 100);
        }
        
        if (prod?.discountType === "fixed" || prod?.discountType === "flat") {
            return Math.max(0, prod.price - prod.discount);
        }
        
        return prod.price;
    };

    return (
        <div className="flex h-dvh w-full bg-white text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white overflow-hidden">
            <EmployeeSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {(isLoading || !product) && (
                <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-999">
                    <div className="rounded-xl bg-white/70 shadow-xl px-6 py-5 flex items-center gap-3">
                    <RefreshCw className="animate-spin text-slate-700" size={22} />
                        <span className="text-sm font-semibold text-slate-800"> Loading... </span>
                    </div>
                </div>
            )}
            <main className="flex-1 overflow-y-auto bg-white scroll-smooth custom-scrollbar relative flex flex-col">
                <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-100 px-6 py-4 flex justify-between items-center">
                    <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
                        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Store
                    </button>
                    <span className="text-xs font-medium text-zinc-400 hidden sm:block">Product / {product?._id?.slice(-8)}</span>
                </nav>

                <div className="max-w-7xl w-full mx-auto px-6 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start mb-16">

                        {/* LEFT: Image Section */}
                        <div className="w-full flex flex-col gap-4">
                            <div className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden relative flex items-center justify-center group shadow-sm">
                                <img src={product?.gallery[activeMedia]?.fileUrl || product?.gallery[activeMedia]?.url} alt={product?.name} className="w-full min-h-75 h-auto max-h-125 object-contain transition-transform duration-700 group-hover:scale-105" />
                            </div>
                            <div className="flex gap-3 overflow-auto pb-2 no-scrollbar">
                                {product?.gallery?.map((media, idx) => (
                                    <button key={idx} onClick={() => setActiveMedia(idx)}
                                        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-white ${activeMedia === idx ? 'border-zinc-900' : 'border-zinc-100 opacity-60 hover:opacity-100'}`} >
                                        <img src={media?.fileUrl || media?.url} className="w-full h-full object-cover" alt="Product Gallery" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT: Product Details */}
                        <div className="flex flex-col">
                            <div className="mb-6">
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <span className="px-3 py-1 bg-zinc-900 text-white text-[11px] font-semibold uppercase tracking-wider rounded-full">{product?.brand || "Exclusive"}</span>
                                    <span className="text-sm font-medium text-zinc-500">{product?.category}</span>
                                </div>
                                <h1 className="text-3xl lg:text-4xl font-semibold text-zinc-900 mb-3 leading-tight">{product?.name}</h1>
                                
                                {/* --- NEW PRICING SECTION --- */}
                                <div className="flex flex-col gap-1.5 mb-6">
                                    <div className="flex flex-wrap items-center gap-3">
                                        {/* Final Price */}
                                        <span className="text-3xl font-bold text-zinc-900">
                                            ₹{getFinalPrice(product)?.toLocaleString()}
                                        </span>
                                        
                                        {/* Original Price (Crossed out) - Only shows if there is a discount */}
                                        {product?.discount > 0 && (
                                            <span className="text-lg text-zinc-400 line-through font-medium">
                                                ₹{product?.price?.toLocaleString()}
                                            </span>
                                        )}

                                        {/* Discount Badge - Adapts to Percentage vs Flat */}
                                        {product?.discount > 0 && (
                                            <span className="text-sm font-bold bg-rose-50 text-rose-600 px-2.5 py-1 rounded-md border border-rose-100 tracking-wide uppercase">
                                                {product?.discountType === "percentage" 
                                                    ? `${product?.discount}% OFF` 
                                                    : `₹${product?.discount} OFF`}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* "You Save" Text */}
                                    {product?.discount > 0 && (
                                        <span className="text-sm font-semibold text-emerald-600">
                                            You save ₹{(product?.price - getFinalPrice(product)).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                {/* --- END NEW PRICING SECTION --- */}
                            </div>

                            <p className="text-zinc-600 text-sm sm:text-base leading-relaxed mb-8">{product?.description}</p>

                            <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-6 mb-6">
                                <div className="flex justify-between items-center mb-5">
                                    <span className="text-sm font-medium text-zinc-600">Availability</span>
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${product?.quantity > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                                        {product?.quantity > 0 ? `${product?.quantity} In Stock` : "Out of Stock"}
                                    </span>
                                </div>
                                {cartItem ? (
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="flex items-center gap-4 bg-zinc-50 rounded-xl p-1.5 border border-zinc-200 w-full sm:w-1/2 justify-between">
                                            <button onClick={() => updateQuantity(cartItem.quantity - 1)} className="w-10 h-10 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-white hover:shadow-sm"><Minus size={18} /></button>
                                            <span className="font-semibold text-lg">{cartItem.quantity}</span>
                                            <button onClick={() => updateQuantity(cartItem.quantity + 1)} className="w-10 h-10 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-white hover:shadow-sm"><Plus size={18} /></button>
                                        </div>
                                        <button className="w-full sm:w-1/2 bg-zinc-900 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 opacity-80"><ShoppingBag size={18} /> Added to Cart</button>
                                    </div>
                                ) : (
                                    <button onClick={addToCart} disabled={product?.quantity <= 0} className="w-full bg-zinc-900 text-white py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:opacity-50 transition-colors">
                                        <span className="font-semibold">Add to Cart</span><ArrowRight size={18} />
                                    </button>
                                )}
                            </div>

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

                    {/* REVIEWS SECTION */}
                    <section className="mt-16 pt-12 border-t border-zinc-200">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                                        <Star size={24} className="fill-black text-black" /> Reviews
                                    </h3>
                                    <p className="text-sm text-zinc-500 mt-1">{reviews.length} total reviews • {averageRating} Avg Rating</p>
                                </div>
                                <button onClick={() => setIsWritingReview(!isWritingReview)}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-bold transition-all border ${isWritingReview ? "bg-zinc-100 text-zinc-600 border-zinc-200" : "bg-white text-zinc-900 border-zinc-200 shadow-sm hover:bg-zinc-50"}`}>
                                    {isWritingReview ? "Cancel" : <><Edit3 size={16} /> Write Review</>}
                                </button>
                            </div>

                            {isWritingReview ? (
                                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6 animate-in fade-in slide-in-from-top-4">
                                    <form onSubmit={handleSubmitReview} className="space-y-8">
                                        <div>
                                            <label className="block text-sm font-bold text-zinc-700 mb-4 uppercase tracking-widest">Your Rating</label>
                                            <div className="flex gap-4">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button key={star} type="button" onClick={() => setNewReview({ ...newReview, rating: star })} className="transition-transform hover:scale-110">
                                                        <Star size={30} className={newReview.rating >= star ? "fill-yellow-400 text-yellow-400" : "text-zinc-300"} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <textarea rows="5" value={newReview.comment} placeholder="Your feedback..." onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                            className="w-full rounded-lg border border-zinc-200 p-5 text-sm resize-none outline-none bg-white shadow-sm focus:border-zinc-900" />
                                        <button type="submit" className="w-full sm:w-auto bg-zinc-900 text-white px-12 py-4 rounded-lg text-sm font-bold shadow-lg">Submit Review</button>
                                    </form>
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    {/* Star Breakdown */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 bg-zinc-100 p-6 rounded-lg border border-zinc-100">
                                        <div className="flex flex-col justify-center items-center sm:items-start">
                                            <span className="text-5xl font-black text-zinc-900">{averageRating}</span>
                                            <div className="flex gap-1 my-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={18} className={i < Math.round(averageRating) ? "fill-black text-black" : "text-zinc-200"} />
                                                ))}
                                            </div>
                                            <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Average Rating</p>
                                        </div>
                                        <div className="space-y-2.5">
                                            {[5, 4, 3, 2, 1].map((star) => {
                                                const count = reviews.filter(r => r.rating === star).length;
                                                const perc = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                                return (
                                                    <div key={star} className="flex items-center gap-3">
                                                        <span className="text-xs font-bold text-zinc-500 w-3">{star}</span>
                                                        <div className="flex-1 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                                                            <div className="h-full bg-zinc-900 rounded-full" style={{ width: `${perc}%` }} />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-zinc-600 w-8">{Math.round(perc)}%</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Review List - Responsive Grid */}
                                    <div className="grid grid-cols-1 gap-6">
                                        {reviews.length > 0 ? reviews.map((review) => (
                                            <div key={review.id} className="group relative p-6 md:p-8 border rounded-xl bg-white border-zinc-300 hover:shadow-2xl hover:shadow-zinc-200/40 transition-all duration-500">
                                                {editingReviewId === review.id ? (
                                                    <form onSubmit={handleUpdateReview} className="space-y-6">
                                                        <div className="flex gap-2 p-3 bg-zinc-100 w-fit rounded-lg border border-zinc-100">
                                                            {[1, 2, 3, 4, 5].map((s) => (
                                                                <button key={s} type="button" onClick={() => setEditData({ ...editData, rating: s })}>
                                                                    <Star size={24} className={editData.rating >= s ? "fill-yellow-400 text-yellow-400" : "text-zinc-200"} />
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <textarea value={editData.comment} onChange={(e) => setEditData({ ...editData, comment: e.target.value })}
                                                            className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none focus:bg-white transition-all resize-none" rows="4" />
                                                        <div className="flex gap-2">
                                                            <button type="submit" className="bg-zinc-900 text-white px-6 py-3 rounded-lg text-xs font-bold flex items-center gap-1"><Save size={16} /> Save</button>
                                                            <button type="button" onClick={() => setEditingReviewId(null)} className="bg-zinc-100 text-zinc-600 px-6 py-3 rounded-lg text-xs font-bold flex items-center gap-1"><X size={16} /> Cancel</button>
                                                        </div>
                                                    </form>
                                                ) : (
                                                    <>
                                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-lg">{review.user.charAt(0).toUpperCase()}</div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <h4 className="text-[15px] font-bold text-zinc-900">{review.user}</h4>
                                                                        <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100"><CheckCircle2 size={10} /> Verified</span>
                                                                    </div>
                                                                    <div className="flex gap-0.5">
                                                                        {[...Array(5)].map((_, i) => (<Star key={i} size={12} className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-100"} />))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3 sm:self-start">
                                                                <span className="text-[12px] font-bold uppercase">{review.date}</span>
                                                                {review.buyerId === currentUserId && (
                                                                    <div className="flex items-center gap-1 bg-zinc-50 p-1 rounded-lg border border-zinc-100">
                                                                        <button onClick={() => {
                                                                            setEditingReviewId(review.id);
                                                                            setEditData({ rating: review.rating, comment: review.comment });
                                                                        }}
                                                                            className="p-2 hover:text-yellow-500 rounded-lg transition-all">
                                                                            <Edit3 size={15} />
                                                                        </button>
                                                                        <button onClick={() => handleDeleteReview(review.id)}
                                                                            className="p-2 hover:text-rose-600 rounded-lg transition-all">
                                                                            <Trash2 size={15} />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="text-zinc-600 text-[15px] leading-relaxed italic md:pl-16 relative">"{review.comment}"</p>
                                                    </>
                                                )}
                                            </div>
                                        )) : (
                                            <div className="py-24 text-center border-2 border-dashed border-zinc-100 rounded-lg bg-zinc-50/30">
                                                <Package size={32} className="mx-auto text-zinc-200 mb-6" />
                                                <h5 className="text-xl font-bold text-zinc-900 mb-2">No reviews yet</h5>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default ProductDetails;