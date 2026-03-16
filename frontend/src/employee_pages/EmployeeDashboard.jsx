import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, ArrowRight, ShoppingCart, Shield, Award, Package, Mail, Sparkles, UserCircle } from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar";
import { theme } from "../components/theme";
import axios from "axios";

const EmployeeDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const [admins, setAdmins] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [products, setProducts] = useState([]);

  const userPoints = 0;

  const getData = async() => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_KEY}`, {withCredentials: true});
      const res2 = await axios.get(`${import.meta.env.VITE_API_KEY}/reward`, {withCredentials: true});
      const res3 = await axios.get(`${import.meta.env.VITE_API_KEY}/product`, {withCredentials: true});
      setAdmins(res.data.users.slice(0, 3));
      setRewards(res2.data.reward.slice(0, 3))
      setProducts(res3.data.product.slice(0, 4))
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getData();    
  }, [])
  
  const customScrollbarClasses = "overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

  return (
    <div className={`flex h-screen ${theme.appBg} ${theme.textMain} font-sans overflow-hidden selection:bg-zinc-200 selection:text-black`}>
      <EmployeeSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className={`flex-1 bg-slate-50 ${customScrollbarClasses}`}>
        
        {/* Mobile Header */}
        <div className="lg:hidden p-4 pb-0 flex justify-between items-center shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className={`flex items-center gap-2 ${theme.textMuted} hover:text-black hover:bg-zinc-100 ${theme.cardBg} border ${theme.border} px-3 py-2 rounded-xl shadow-sm transition-all`}>
            <Menu size={20} /> <span className="text-sm font-medium">Menu</span>
          </button>
        </div>

        <div className="max-w-7xl mx-auto py-8 px-6 space-y-12">
          
          {/* 1. Welcome Banner */}
          <section className="relative rounded-xl overflow-hidden bg-black flex flex-col justify-end p-8 text-white shadow-2xl border border-zinc-800">
            <div className="absolute top-[-50%] left-[-10%] w-96 h-96 bg-zinc-600/20 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-80 h-80 bg-zinc-400/10 blur-[100px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md mb-6">
                  <Sparkles size={14} className="text-zinc-300" />
                  <span className="text-[11px] uppercase tracking-widest text-zinc-300 font-bold">Employee Portal</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 tracking-tight text-white">
                  Welcome back, Alex!
                </h2>
                <p className="text-base lg:text-lg text-zinc-400 leading-relaxed font-medium">
                  Here is a snapshot of your current balance, recent rewards, and new items.
                </p>
              </div>

              {/* Current Points Overlay */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl p-6 w-full md:w-auto shrink-0 flex flex-col items-start md:items-end">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Available Balance</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white tracking-tight">{userPoints}</span>
                  <span className="text-xl font-bold text-zinc-400">pts</span>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Team Leaders / Admins (Grid of 3) */}
          <div className="flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-black text-white rounded-lg"><Shield size={18} /></div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">System Administrators</h3>
              </div>
              <button onClick={() => navigate('/employee/directory')} className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-black transition-colors flex items-center gap-1">
                View Directory <ArrowRight size={14} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {admins.map((user) => (
                <div key={user._id} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-lg transition-all hover:border-black group flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    {user.profile?.imageUrl ? (
                      <img src={user.profile.imageUrl} alt={user.username} className="w-16 h-16 rounded-full object-cover border-4 border-slate-50 shadow-sm" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border-4 border-slate-50"><UserCircle size={32} className="text-slate-400" /></div>
                    )}
                    <span className="px-2.5 py-1 bg-zinc-100 text-zinc-800 text-[10px] font-bold uppercase tracking-widest rounded-md">{user.role.replace('_', ' ')}</span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-6 capitalize">{user.username}</h4>
                  
                  <div className="mt-auto">
                    <a href={`mailto:${user.email}`} className="w-full py-2.5 bg-slate-50 hover:bg-black hover:text-white border border-slate-200 hover:border-black text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                      <Mail size={14} /> Email Admin
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Recent Rewards (Grid of 3) */}
          <div className="flex flex-col pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-black text-white rounded-lg"><Award size={18} /></div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Recent Achievements</h3>
              </div>
              <button onClick={() => navigate('/employee/orders')} className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-black transition-colors flex items-center gap-1">
                View History <ArrowRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {rewards.map((reward) => (
                <div key={reward._id} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-lg transition-all hover:border-black flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white bg-black px-2.5 py-1 rounded-md">{reward.category}</span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 leading-snug mb-2">{reward.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed mb-6 line-clamp-3">{reward.description}</p>
                  
                  <div className="mt-auto pt-4 border-t border-slate-100">
                    {reward.points ? (
                      <span className="text-2xl font-extrabold text-black tracking-tight">+{reward.points} <span className="text-sm font-semibold text-zinc-500">pts</span></span>
                    ) : (
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Special Perk</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Featured Products (Grid of 4) */}
          <div className="flex flex-col pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-black text-white rounded-lg"><Package size={18} /></div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Marketplace Highlights</h3>
              </div>
              <button 
                onClick={() => navigate('/employee/store')}
                className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 w-fit"
              >
                Explore Store <ArrowRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product._id} className="group relative bg-white border-2 border-slate-200 rounded-md p-4 transition-all hover:border-black hover:shadow-xl cursor-pointer flex flex-col">
                  <div className="aspect-4/3 rounded-md border-black group-hover:border-2 bg-slate-100 mb-5 overflow-hidden relative   flex items-center justify-center">
                    {product.gallery && product.gallery.length > 0 ? (
                      <img 
                        src={product.gallery[0].fileUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                      />
                    ) : (
                      <Package size={40} className="text-slate-300" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                  </div>
                  <div className="flex-1 flex flex-col px-1">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1.5">{product.category}</p>
                    <h4 className="text-base font-bold text-slate-900 mb-4 line-clamp-2 leading-tight">{product.name}</h4>
                    
                    <div className="mt-auto flex items-end justify-between">
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold mb-0.5 uppercase tracking-widest">Price</p>
                        <span className="text-xl font-extrabold text-black tracking-tight">{product.price} <span className="text-xs font-semibold text-zinc-500">pts</span></span>
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center group-hover:bg-black group-hover:border-black group-hover:text-white transition-all duration-300 shadow-sm text-slate-500">
                        <ShoppingCart size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;