import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, ArrowLeft, Trash2, Plus, Minus, Package, ShoppingCart, ArrowRight, Sparkles, Receipt, Check, RefreshCw } from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar";
import axios from "axios";
import { toast } from "../ui/Toaster";

const EmployeeCart = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Data States
  const [cartItems, setCartItems] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);

  // New States for Points Logic
  const [applyPoints, setApplyPoints] = useState(false);
  const [pointsInput, setPointsInput] = useState("");

  const navigate = useNavigate();

  const fetchData = async () => {
  try {
    setIsLoading(true);
    const [resProducts, resRole, resCart] = await Promise.all([
      axios.get(`${import.meta.env.VITE_API_KEY}/product`, { withCredentials: true }),
      axios.get(`${import.meta.env.VITE_API_KEY}/check-role`, { withCredentials: true }),
      axios.get(`${import.meta.env.VITE_API_KEY}/cart-all`, { withCredentials: true })
    ]);

    const user = resRole.data.user;
    setCurrentUserId(user._id);
    setUserPoints(user.points || 0);

    const fetchedProducts = resProducts.data?.product || [];
    const userCartRaw = resCart.data?.cart?.filter(item => item.buyerId === user._id) || [];
    
    const mergedCart = userCartRaw.map(cartItem => {
      const productDetail = fetchedProducts.find(p => p._id === cartItem.productId);
      return { ...cartItem, product: productDetail || null };
    }).filter(item => item.product);

    setCartItems(mergedCart);
  } catch (error) {
    toast.error("Failed to load cart data.");
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    fetchData();
  }, []);

  const updateQuantity = async (cartItemId, productId, newQuantity) => {
    try {
      setIsLoading(true);
      if (newQuantity <= 0) {
        removeItem(cartItemId);
        return;
      }

      setCartItems(prev => prev.map(item => 
        item._id === cartItemId ? { ...item, quantity: newQuantity } : item
      ));

      await axios.put(`${import.meta.env.VITE_API_KEY}/cart/${cartItemId}`, {
        buyerId: currentUserId,
        productId: productId,
        quantity: newQuantity
      }, { withCredentials: true });
    } catch (error) {
      toast.error("Failed to update quantity");
      fetchData(); 
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      setIsLoading(true);
      setCartItems(prev => prev.filter(item => item._id !== cartItemId));
      await axios.delete(`${import.meta.env.VITE_API_KEY}/cart/${cartItemId}`, { withCredentials: true });
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
      fetchData(); 
    } finally {
      setIsLoading(false);
    }
  };

  // --- CART MATH LOGIC ---
  const cartTotalRs = cartItems.reduce((total, item) => {
    return total + (item.quantity * (item.product?.price || 0));
  }, 0);

  // Auto-adjust points if cart total drops below currently inputted points
  useEffect(() => {
    if (applyPoints && Number(pointsInput) > cartTotalRs) {
      setPointsInput(cartTotalRs);
    }
  }, [cartTotalRs, applyPoints, pointsInput]);

  const handlePointsChange = (e) => {
    setPointsInput(e.target.value);
  };

  const handleTogglePoints = () => {
    setApplyPoints(!applyPoints);
    if (!applyPoints) {
      setPointsInput(Math.min(userPoints, cartTotalRs).toString()); 
    } else {
      setPointsInput(""); 
    }
  };

  // Convert the input string to a float safely for math
  const parsedPoints = parseFloat(pointsInput) || 0;
  
  // Validation Logic 
  let pointsError = null;
  if (applyPoints && pointsInput !== "") {
    if (parsedPoints < 0) {
      pointsError = "Points cannot be negative.";
    } else if (parsedPoints > userPoints) {
      pointsError = `You only have ${userPoints} points available.`;
    } else if (parsedPoints > cartTotalRs) {
      pointsError = `Points cannot exceed the cart total (₹${cartTotalRs}).`;
    }
  }

  // Only apply the discount if there is NO error
  const discountRs = pointsError ? 0 : parsedPoints;
  const finalTotalRs = cartTotalRs - discountRs;

  // --- CHECKOUT FUNCTION ---
  const checkout = async () => {
    if (pointsError) {
      toast.error("Please fix the points error before checking out."); return;
    }
    try {
      setIsLoading(true);
      const cleanItems = cartItems.map(item => ({productId: item.productId, quantity: item.quantity}));
      const res = await axios.post(`${import.meta.env.VITE_API_KEY}/checkout`, 
        {userId: currentUserId, items: cleanItems, pointsUsed: discountRs}, { withCredentials: true });
      
      toast.success(res.data.message || "Checkout successful!");
      setPointsInput("");
      setApplyPoints(false);
      fetchData(); 
    } catch (error) {
      toast.error(error.response?.data?.message || "Checkout failed");
      console.log(error, error.response?.data?.message);
    } finally {
      setIsLoading(false);
    }
  }

  const customScrollbarClasses = "overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

  return (
    <div className={`flex h-screen w-full overflow-hidden bg-slate-50 selection:bg-zinc-200 selection:text-black`}>
      <EmployeeSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {isLoading && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-999">
          <div className="rounded-xl bg-white/70 shadow-xl px-6 py-5 flex items-center gap-3">
            <RefreshCw className="animate-spin text-slate-700" size={22} />
            <span className="text-sm font-semibold text-slate-800"> Loading... </span>
          </div>
        </div>
      )}
      <main className={`flex-1 flex flex-col ${customScrollbarClasses}`}>
        {/* Mobile Header Toggle */}
        <div className="lg:hidden p-4 pb-0 flex justify-between items-center shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="flex items-center gap-2 text-slate-500 hover:text-black bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm transition-all">
            <Menu size={20} /> <span className="text-sm font-bold">Menu</span>
          </button>
        </div>

        <div className="max-w-7xl mx-auto w-full p-6 flex-1 flex flex-col">
          
          {/* Top Navigation & Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/employee/store')}
                className="w-10 h-10 flex items-center justify-center shrink-0 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-black hover:text-white hover:border-black transition-all">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Shopping Cart</h1>
                <p className="text-xs md:text-sm font-bold text-slate-500 mt-1">Review items and apply your points.</p>
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl flex items-center justify-between sm:justify-start gap-3 shadow-sm shrink-0">
              <Sparkles size={16} className="text-slate-400 hidden sm:block" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Available Balance</span>
                <span className="text-sm font-black text-slate-900 leading-none mt-0.5">{userPoints} pts</span>
              </div>
            </div>
          </div>

          {cartItems.length === 0 ? (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 p-6 md:p-8 text-center shadow-sm">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                <ShoppingCart size={32} className="text-slate-300 md:w-10 md:h-10" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-sm text-slate-500 font-medium mb-8 max-w-md">Looks like you haven't added any products to your cart yet. Head over to the store to see what's new.</p>
              <button onClick={() => navigate('/employee/store')}
                className="flex items-center justify-center gap-2 bg-black text-white px-6 md:px-8 py-3 md:py-3.5 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-md w-full sm:w-auto">
                Browse Store <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            /* Cart Content Grid */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 pb-12">
              
              {/* Left Column: Cart Items List */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div key={item._id} className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center shadow-sm hover:shadow-md transition-shadow">
                    
                    {/* Product Image */}
                    <div className="w-20 h-24 sm:w-24 sm:h-24 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {item.product?.gallery && item.product.gallery.length > 0 ? (
                        <img src={item.product.gallery[0].fileUrl} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={24} className="text-slate-300" />
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0 w-full">
                      <span className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.product?.category || 'Category'}</span>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 mt-1 mb-1 sm:mb-2 truncate">{item.product?.name || 'Unknown Product'}</h3>
                      <p className="text-base sm:text-lg font-black text-slate-900 leading-none">
                        ₹{item.product?.price?.toLocaleString()}
                      </p>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap items-center justify-between sm:justify-end w-full sm:w-auto gap-4 mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-slate-100">
                      
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 border border-slate-200 rounded-xl p-1 shrink-0">
                        <button 
                          onClick={() => updateQuantity(item._id, item.productId, item.quantity - 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-white text-slate-600 border border-slate-200 hover:text-black hover:border-black transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-4 sm:w-6 text-center font-black text-xs sm:text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item._id, item.productId, item.quantity + 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-black text-white hover:bg-zinc-800 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Total Item Price & Delete */}
                      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                        <div className="text-right hidden min-[400px]:block">
                          <p className="text-lg sm:text-xl font-black text-slate-900">₹{(item.product?.price * item.quantity).toLocaleString()}</p>
                        </div>
                        <button 
                          onClick={() => removeItem(item._id)}
                          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors shrink-0"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-black rounded-3xl p-5 sm:p-6 md:p-8 text-white lg:sticky top-8 shadow-xl">
                  <h2 className="text-lg md:text-xl font-black mb-5 md:mb-6 border-b border-zinc-800 pb-4 flex items-center gap-2">
                    <Receipt size={20} className="text-zinc-400" />
                    Order Summary
                  </h2>
                  
                  {/* Custom Points Input Block */}
                  {userPoints > 0 && (
                    <div className="mb-6 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
                      <label className="flex items-center gap-3 cursor-pointer group select-none">
                        <div 
                          onClick={handleTogglePoints}
                          className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                            applyPoints ? 'bg-white border-white' : 'bg-zinc-900 border-zinc-600 group-hover:border-zinc-400'
                          }`}
                        >
                          {applyPoints && <Check size={14} className="text-black" />}
                        </div>
                        <span className="text-xs font-bold text-zinc-300">Use points for discount</span>
                      </label>

                      {applyPoints && (
                        <div className="flex flex-col mt-3">
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <input type="number" step="any" value={pointsInput}
                                onChange={handlePointsChange} placeholder="Enter points"
                                className={`w-full bg-black border ${pointsError ? 'border-rose-500 focus:border-rose-500' : 'border-zinc-700 focus:border-zinc-500'} text-white text-xs font-bold rounded-xl pl-3 pr-10 py-3 outline-none transition-all placeholder:text-zinc-600`}
                              />
                              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-widest ${pointsError ? 'text-rose-500' : 'text-zinc-500'}`}>pts</span>
                            </div>
                            <button onClick={() => setPointsInput(Math.min(userPoints, cartTotalRs).toString())} className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors border border-zinc-700"> Max </button>
                          </div>
                          
                          {pointsError && (
                            <p className="text-[10px] font-bold text-rose-400 mt-2 ml-1">{pointsError}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-4 mb-6 md:mb-8">
                    <div className="flex justify-between items-center text-xs md:text-sm font-bold text-zinc-400">
                      <span>Subtotal ({cartItems.length} items)</span>
                      <span>₹{cartTotalRs.toLocaleString()}</span>
                    </div>
                    
                    {/* Points Discount Applied */}
                    {discountRs > 0 && (
                      <div className="flex justify-between items-center text-xs md:text-sm font-bold text-emerald-400">
                        <span>Points Applied (-{discountRs} pts)</span>
                        <span>- ₹{discountRs.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs md:text-sm font-bold text-zinc-400 border-b border-zinc-800 pb-4">
                      <span>Taxes & Fees</span>
                      <span>₹0</span>
                    </div>
                    
                    <div className="flex justify-between items-end pt-2">
                      <span className="text-xs md:text-sm font-black text-white uppercase tracking-widest">Payable Total</span>
                      <div className="text-right">
                        <span className="text-2xl md:text-3xl font-black text-white">₹{finalTotalRs.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button onClick={checkout} disabled={isLoading || !!pointsError} 
                    className="w-full py-3.5 md:py-4 rounded-lg flex items-center justify-center gap-2 text-xs md:text-xs font-black uppercase tracking-widest transition-all bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed" >
                    Proceed to Checkout
                  </button>

                  <p className="text-center text-[9px] md:text-[10px] font-bold text-zinc-600 mt-4 md:mt-6 uppercase tracking-widest"> Discounts calculated securely. </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmployeeCart;