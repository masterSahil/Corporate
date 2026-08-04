import React, { useEffect, useState } from "react";
import { ShoppingBag, XCircle, Package, Calendar, CreditCard, Hash, ImageIcon, ArrowRight, RefreshCw, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar"; 
import axios from "axios";
import { toast } from "../ui/Toaster";
import { useNavigate } from "react-router-dom";

const EmployeeOrder = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);

  // --- NEW: PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Default to 5 for orders
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  const fetchMyOrders = async () => {
    try {
      setIsLoading(true);

      const token = sessionStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // 1. Get user ID
      const roleRes = await axios.get(
        `${import.meta.env.VITE_API_KEY}/check-role`,
        config
      );

      const userId = roleRes.data.user._id;

      // 2. Fetch orders + products
      const [ordersRes, productsRes] = await Promise.all([
        axios.post(
          `${import.meta.env.VITE_API_KEY}/orders-user/${userId}?page=${currentPage}&limit=${itemsPerPage}`,
          {},
          config
        ),
        axios.get(`${import.meta.env.VITE_API_KEY}/product`, config)
      ]);

      const myOrders = ordersRes.data.orders || [];
      const allProducts = productsRes.data.product || [];
      setTotalPages(ordersRes.data.pagination?.totalPages || 1);

      const enrichedOrders = myOrders.map(order => ({
        ...order,
        items: order.items.map(item => {
          const productMatch = allProducts.find(p => p._id === item.productId);
          return {
            ...item,
            image: productMatch?.gallery?.[0]?.fileUrl || null
          };
        })
      }));

      const sortedOrders = enrichedOrders.sort(
        (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
      );

      setOrders(sortedOrders);

    } catch (error) {
      if (error?.response?.status === 401) {
        sessionStorage.removeItem("token");
        navigate("/");
        return;
      }
      console.error("Fetch Orders Error:", error);
      toast.error("Failed to load your order history.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchMyOrders() }, [currentPage, itemsPerPage]);

  // --- NEW: Reset page to 1 if itemsPerPage changes ---
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const handleCancel = async () => {
    if (!cancelOrderId) return;
    
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem("token");
      await axios.patch(
        `${import.meta.env.VITE_API_KEY}/order-status/${cancelOrderId}`, { status: "Cancelled" },
        { headers: { Authorization: `Bearer ${token}` } });

      toast.success("Order cancelled successfully");
      fetchMyOrders(); 
      setShowCancelModal(false);
      setCancelOrderId(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Cannot cancel order.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- NEW: PAGINATION LOGIC ---
  const currentOrders = orders;

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex h-dvh w-full bg-[#f1f5f9] font-sans text-slate-900 overflow-hidden">
      <EmployeeSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {isLoading && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-999">
          <div className="rounded-xl bg-white/70 shadow-xl px-6 py-5 flex items-center gap-3">
            <RefreshCw className="animate-spin text-slate-700" size={22} />
            <span className="text-sm font-semibold text-slate-800"> Loading... </span>
          </div>
        </div>
      )}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
          <span className="font-bold text-slate-800 tracking-tight">MY ORDERS</span>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-100 rounded-lg text-slate-600">
            <ShoppingBag size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="max-w-7xl mx-auto">
            
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-[28px] sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <Package className="text-[28] sm:text-[32px]" size={32} />
                Purchase History
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-1 ml-11">
                Track your store orders, view item details, and manage point redemptions.
              </p>
            </div>

            {/* Content Area */}
            {orders.length === 0 ? (
              <div className="bg-white border hover:border-dashed hover:border-black border-slate-300 rounded-3xl p-16 flex flex-col items-center text-center shadow-sm transition-all">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <ShoppingBag size={40} className="text-black" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No orders found</h3>
                <p className="text-slate-500 max-w-sm">You haven't placed any orders yet. Visit the company store to redeem your points!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* CHANGED: Mapping over currentOrders instead of orders */}
                {currentOrders.map(order => (
                  <div key={order._id} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    
                    {/* Card Header (Meta Info) */}
                    <div className="bg-slate-50/80 border-b border-slate-100 p-5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-4 sm:gap-8">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar size={12}/> Order Placed</p>
                          <p className="text-sm font-bold text-slate-700">
                            {new Date(order.orderDate).toLocaleString('en-US', {
                              day: 'numeric', month: 'short', year: 'numeric',
                              hour: 'numeric', minute: '2-digit', hour12: true
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Hash size={12}/> Order Number</p>
                          <p className="text-sm font-bold text-slate-700 uppercase">{order._id.slice(-8)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                          <p className="text-sm font-black text-slate-900">₹{order.finalTotal?.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest border ${
                          order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          order.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          order.status === 'Shipped' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Card Body (Items inside the order) */}
                    <div className="p-5 sm:px-6">
                      <div className="space-y-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4 py-2">
                            {/* Product Image */}
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon size={24} className="text-slate-300" />
                              )}
                            </div>
                            
                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base font-bold text-slate-900 truncate">{item.name}</h4>
                              <p className="text-sm text-slate-500 font-medium mt-1">Qty: {item.quantity}</p>
                              {order.status === 'Delivered' && (
                                <button onClick={()=>navigate('/employee/store')} className="mt-2 text-[11px] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-800 flex items-center gap-1 transition-colors">
                                  Buy Again <ArrowRight size={12} />
                                </button>
                              )}
                            </div>

                            {/* Price */}
                            <div className="text-right shrink-0">
                              <p className="text-base font-black text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                              <p className="text-xs text-slate-400 font-medium mt-1">₹{item.price.toLocaleString()} each</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Card Footer (Points & Actions) */}
                    <div className="bg-slate-50/50 border-t border-slate-100 p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      
                      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm w-full sm:w-auto">
                        <CreditCard size={16} className="text-amber-500" />
                        <span className="text-xs font-bold text-slate-600">Points Redeemed:</span>
                        <span className="text-sm font-black text-slate-900">{order.pointsUsed || 0} pts</span>
                      </div>

                      {order.status === 'Pending' && (
                        <button onClick={() => { setCancelOrderId(order._id); setShowCancelModal(true) }}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white border-2 border-rose-100 text-rose-600 hover:bg-rose-50 hover:border-rose-200 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                          <XCircle size={16} /> Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* NEW: Pagination Controls UI */}
                {totalPages > 1 && (
                  <div className="flex flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-200">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Show</span>
                      <div className="relative">
                        <select 
                          value={itemsPerPage} 
                          onChange={(e) => setItemsPerPage(Number(e.target.value))}
                          className="appearance-none bg-white border border-slate-200 text-sm font-bold rounded-lg pl-3 pr-8 py-2 outline-none focus:border-slate-900 transition-colors cursor-pointer shadow-sm"
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={30}>30</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-900 hover:text-slate-900 disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-all shadow-sm"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      <div className="flex items-center gap-1">
                        {getPageNumbers().map((page, index) => (
                          page === "..." ? (
                            <span key={index} className="w-6 flex justify-center text-slate-400 font-bold text-sm">...</span>
                          ) : (
                            <button
                              key={index}
                              onClick={() => setCurrentPage(page)}
                              className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-all shadow-sm
                                ${currentPage === page 
                                  ? "bg-slate-900 text-white border-2 border-slate-900" 
                                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-900 hover:text-slate-900"}`}
                            >
                              {page}
                            </button>
                          )
                        ))}
                      </div>

                      <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-900 hover:text-slate-900 disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-all shadow-sm"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Custom Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-100 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 border border-zinc-200">
              <h2 className="text-lg font-bold text-rose-600 flex items-center gap-2 mb-2">
                <XCircle size={20} /> Confirm Cancellation
              </h2>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Are you sure you want to cancel this order? Your points and product stock will be restored. This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => { setShowCancelModal(false); setCancelOrderId(null) }}
                  className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">
                  Keep Order
                </button>
                <button onClick={handleCancel} className="px-4 py-2 text-sm font-bold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors">
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EmployeeOrder;