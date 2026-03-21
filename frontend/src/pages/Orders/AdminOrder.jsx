import React, { useEffect, useState } from "react";
import { Search, Menu, Calendar, Hash, ChevronDown, ImageIcon, Clock, User, Mail, CreditCard, RefreshCw } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import axios from "axios";
import { toast } from "../../ui/Toaster";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [resOrders, resProducts, resUsers] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_KEY}/orders`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_KEY}/product`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_KEY}`, { withCredentials: true }) 
      ]);

      const allOrders = (resOrders.data.orders || []).sort(
        (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
      );
      const allProducts = resProducts.data.product || [];
      const allUsers = resUsers.data.users || [];

      // Deep Merge Logic
      const enrichedOrders = allOrders.map(order => {
        // 1. Find the Buyer
        const buyer = allUsers.find(u => u._id === (order.userId?.$oid || order.userId));
        
        // 2. Find Product Images
        const itemsWithData = order.items.map(item => {
          const product = allProducts.find(p => p._id === (item.productId?.$oid || item.productId));
          return { ...item, image: product?.gallery?.[0]?.fileUrl || null, 
            category: product?.category || "General"
          };
        });
        return { ...order, buyer, items: itemsWithData };
      });

      setOrders(enrichedOrders);
    } catch (error) {
      console.error("Data Sync Error:", error);
      toast.error("Failed to load master data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData() }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_KEY}/order-status/${orderId}`, 
        { status: newStatus }, { withCredentials: true });
      toast.success(`Order #${orderId.slice(-6)} set to ${newStatus}`);
      fetchData(); 
    } catch (error) {
      toast.error("Status update failed.");
    }
  };

  const filteredOrders = orders.filter(o => 
    o._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.buyer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen w-full bg-[#f1f5f9] font-sans text-slate-900 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Responsive Mobile Nav */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b">
          <span className="font-bold text-slate-800">ORDER CONTROL</span>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-100 rounded-lg">
            <Menu size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Order Logs</h1>
                <p className="text-slate-500 font-medium">Detailed overview of all store transactions and buyer details.</p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Search ID " 
                  className="w-full md:w-96 pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-md text-sm outline-none transition-all shadow-sm"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-999">
                <div className="rounded-xl bg-white/70 shadow-xl px-6 py-5 flex items-center gap-3">
                  <RefreshCw className="animate-spin text-slate-700" size={22} />
                  <span className="text-sm font-semibold text-slate-800"> Loading... </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredOrders.map(order => (
                  <div key={order._id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    
                    {/* 1. Header: Meta Info */}
                    <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Hash size={14} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-700 uppercase">{order._id.slice(-12)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <Calendar size={14} />
                          <span className="text-xs font-medium">{new Date(order.orderDate).toLocaleString()}</span>
                        </div>
                      </div>
                      <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                        order.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    {/* 2. Main Content Grid */}
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                      
                      {/* Left: Customer Profile */}
                      <div className="lg:col-span-3 space-y-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Buyer Details</p>
                        <div className="bg-slate-100 p-4 rounded-md border border-slate-300">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border shadow-sm">
                              <User size={18} className="text-slate-600" />
                            </div>
                            <div className="min-w-0">
                              {order.buyer?.username && 
                              <p className="text-sm font-bold text-slate-900 truncate">{order.buyer?.username}</p>}
                              <p className="text-[10px] text-slate-700 font-semibold">Registered Employee</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Mail size={18} className="text-slate-400" />
                              <span className="truncate text-[14px]">{order.buyer?.email || "No Email Provided"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <CreditCard size={18} className="text-slate-400" />
                              <span className="truncate text-[14px]">Points Used: {order.pointsUsed} pts</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Product Items */}
                      <div className="lg:col-span-6 space-y-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Contents</p>
                        <div className="space-y-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-3 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors">
                              <div className="w-16 h-16 bg-white border border-slate-200 rounded-lg overflow-hidden shrink-0">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-slate-50"><ImageIcon size={20} className="text-slate-200" /></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate">{item.name}</p>
                                <p className="text-xs text-slate-500 font-medium">Unit Price: ₹{item.price.toLocaleString()}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-slate-900">Qty: {item.quantity}</p>
                                <p className="text-sm font-bold text-slate-900 mt-1">₹{(item.price * item.quantity).toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Actions (3 cols) */}
                      <div className="lg:col-span-3 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-300 pt-6 lg:pt-0 lg:pl-8">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Checkout Summary</p>
                          <div className="space-y-1 mb-6">
                            <div className="flex justify-between text-xs text-slate-500 font-medium">
                              <span>Subtotal</span>
                              <span>₹{order.subtotal?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs text-rose-500 font-medium">
                              <span>Discount</span>
                              <span>-₹{order.pointsUsed?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 mt-2 border-t">
                              <span className="text-xs font-bold text-slate-900">Total</span>
                              <span className="text-2xl font-black text-slate-900">₹{order.finalTotal?.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update Workflow</label>
                          <div className="relative group">
                            <select 
                              value={order.status}
                              onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                              className="w-full appearance-none bg-slate-900 text-white rounded-md px-4 py-3 text-xs font-bold uppercase tracking-widest cursor-pointer outline-none hover:bg-slate-800 transition-all">
                              {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium justify-center">
                            <Clock size={12} />
                            <span>Last update: {new Date(order.updatedAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminOrders;