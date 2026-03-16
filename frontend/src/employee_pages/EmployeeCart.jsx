import React, { useState } from "react";
import { Menu, Trash2, ShoppingBag, Coins } from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar";
import { theme } from "../components/theme";

const EmployeeCart = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const userPoints = 1250; 

  const [cartItems, setCartItems] = useState([
    { id: 1, name: "Sony WH-1000XM5", points: 800, image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=150&q=80" },
    { id: 4, name: "Mechanical Keyboard", points: 450, image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=150&q=80" }
  ]);

  const totalPoints = cartItems.reduce((acc, item) => acc + item.points, 0);
  const canAfford = userPoints >= totalPoints;

  const handleRemove = (id) => setCartItems(cartItems.filter(item => item.id !== id));

  const handleCheckout = () => {
    if (canAfford) {
      console.log("Processing order for:", cartItems);
    } else {
      console.log("Insufficient points");
    }
  };

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
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your Cart</h1>
            <p className={`text-base ${theme.textMuted} mt-2`}>Review your items before redemption.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.length === 0 ? (
                <div className={`${theme.cardBg} border ${theme.border} p-10 rounded-xl text-center`}>
                  <ShoppingBag size={48} className={`mx-auto mb-4 ${theme.textMuted}`} />
                  <p className="font-bold text-slate-900">Your cart is empty</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className={`${theme.cardBg} border ${theme.border} p-4 rounded-xl flex items-center gap-4 shadow-sm`}>
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg bg-slate-100" />
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">{item.name}</h3>
                      <p className="text-emerald-600 font-bold mt-1">{item.points} pts</p>
                    </div>
                    <button onClick={() => handleRemove(item.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className={`${theme.cardBg} border ${theme.border} p-6 rounded-xl shadow-sm h-fit`}>
              <h2 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 border-b border-slate-200 pb-6">
                <div className="flex justify-between text-sm">
                  <span className={theme.textMuted}>Current Balance</span>
                  <span className="font-bold text-slate-900">{userPoints} pts</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={theme.textMuted}>Cart Total</span>
                  <span className="font-bold text-rose-600">-{totalPoints} pts</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="font-bold text-slate-900">Remaining Balance</span>
                <span className={`font-bold text-xl ${canAfford ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {userPoints - totalPoints} pts
                </span>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={!canAfford || cartItems.length === 0}
                className={`w-full py-3 rounded-xl text-sm font-bold text-white transition-colors flex items-center justify-center gap-2 ${
                  !canAfford || cartItems.length === 0 
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : 'bg-black hover:bg-zinc-800 shadow-md'
                }`}
              >
                <Coins size={18} />
                {canAfford ? 'Redeem Rewards' : 'Insufficient Points'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeCart;