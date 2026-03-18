import React, { useEffect, useState } from "react";
import { ShoppingBag, Loader2, XCircle } from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar"; 
import axios from "axios";
import { toast } from "../ui/Toaster";

const EmployeeOrder = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchMyOrders = async () => {
    try {
      setIsLoading(true);
      // First get current user ID
      const roleRes = await axios.get(`${import.meta.env.VITE_API_KEY}/check-role`, { withCredentials: true });
      const userId = roleRes.data.user._id;

      const res = await axios.post(`${import.meta.env.VITE_API_KEY}/orders-user/${userId}`,{}, { withCredentials: true });
      setOrders(res.data.orders || []);
      console.log(res.data);
    } catch (error) {
      toast.error("Failed to load your order history.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchMyOrders() }, []);

  const handleCancel = async (orderId) => {
    if(!window.confirm("Cancel this order? Points and stock will be restored.")) return;
    try {
      await axios.patch(`${import.meta.env.VITE_API_KEY}/order/${orderId}/cancel`, {}, { withCredentials: true });
      toast.success("Order cancelled successfully");
      fetchMyOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Cannot cancel order.");
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50">
      <EmployeeSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Purchase History</h1>
            <p className="text-sm font-bold text-slate-500">Track your store orders and point redemptions.</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-300" size={40} /></div>
          ) : orders.length === 0 ? (
            <div className="text-center bg-white border border-dashed border-slate-300 rounded-3xl p-12">
              <ShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 font-bold">You haven't placed any orders yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full border ${
                        order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        order.status === 'Cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {order.status}
                      </span>
                      <p className="text-xs text-slate-400 mt-2 font-bold">Ordered on {new Date(order.orderDate).toLocaleDateString()}</p>
                    </div>
                    <p className="text-lg font-black text-slate-900">₹{order.finalTotal}</p>
                  </div>

                  <div className="border-t border-slate-50 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-sm font-bold text-slate-600">
                      {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'} purchased
                    </div>
                    
                    {order.status === 'Pending' && (
                      <button 
                        onClick={() => handleCancel(order._id)}
                        className="flex items-center gap-2 text-rose-500 hover:text-rose-700 text-xs font-black uppercase tracking-widest transition-colors"
                      >
                        <XCircle size={16} /> Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmployeeOrder;