import React, { useState } from "react";
import { Menu, Package, CheckCircle, Clock } from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar";
import { theme } from "../components/theme";

const EmployeeHistory = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const orders = [
    { id: "ORD-0092", product: "Sony WH-1000XM5", points: 800, date: "Oct 12, 2026", status: "Delivered", statusColor: theme.status.success, icon: CheckCircle },
    { id: "ORD-0093", product: "Starbucks $50 Gift Card", points: 200, date: "Oct 14, 2026", status: "Processing", statusColor: theme.status.pending, icon: Clock }
  ];

  const customScrollbarClasses = "overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

  return (
    <div className={`flex h-screen w-full ${theme.appBg} ${theme.textMain} font-sans overflow-hidden`}>
      <EmployeeSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className={`flex-1 bg-slate-50 ${customScrollbarClasses}`}>
        <div className="lg:hidden p-4 pb-0 flex justify-between items-center shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className={`flex items-center gap-2 ${theme.textMuted} hover:text-black hover:bg-zinc-100 ${theme.cardBg} border ${theme.border} px-3 py-2 rounded-lg transition-all`}>
            <Menu size={20} /> <span className="text-sm font-medium">Menu</span>
          </button>
        </div>

        <div className="w-[90%] mx-auto py-8">
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Order History</h1>
            <p className={`text-base ${theme.textMuted} mt-2`}>Track your past redemptions and statuses.</p>
          </div>

          <div className={`${theme.cardBg} border ${theme.border} rounded-xl shadow-sm overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-500">Order ID</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-500">Item</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-500">Date</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-500">Points</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{order.id}</td>
                      <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                        <Package size={16} className={theme.textMuted} /> {order.product}
                      </td>
                      <td className={`px-6 py-4 text-sm ${theme.textMuted}`}>{order.date}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{order.points}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${order.statusColor}`}>
                          <order.icon size={12} />
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeHistory;