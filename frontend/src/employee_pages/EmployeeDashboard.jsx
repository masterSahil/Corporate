import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Menu, ArrowRight, ShoppingCart, Shield, Award, 
  Package, Mail, Sparkles, UserCircle, TrendingUp, 
  Trophy, Gift, Clock, ChevronRight
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from "recharts";
import EmployeeSidebar from "./EmployeeSidebar";
import { theme } from "../components/theme";
import axios from "axios";

const EmployeeDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // --- STATE ---
  const [currentUser, setCurrentUser] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Dynamic UI States
  const [userPoints, setUserPoints] = useState(0);
  const [stats, setStats] = useState([]);
  const [graphData, setGraphData] = useState([]);

  // --- DATA FETCHING & PROCESSING ---
  const getData = async () => {
    try {
      const [resUsers, resRewards, resProducts] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_KEY}`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_KEY}/reward`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_KEY}/product`, { withCredentials: true })
      ]);

      const fetchedUsers = resUsers.data?.users || [];
      const fetchedRewards = resRewards.data?.reward || [];
      const fetchedProducts = resProducts.data?.product || [];

      // 1. Setup Users & Admins
      const adminsList = fetchedUsers.filter(u => ['admin', 'super_admin'].includes(u.role?.toLowerCase()));
      setAdmins(adminsList.slice(0, 3));

      // Assuming we can identify the current employee. Fallback to the first employee found.
      const employee = fetchedUsers.find(u => u.role?.toLowerCase() === 'employee');
      setCurrentUser(employee);

      // 2. Setup Products & Rewards
      setProducts(fetchedProducts.filter(p => !p.isDeleted).slice(0, 4));
      
      const activeRewards = fetchedRewards.filter(r => !r.isDeleted);
      setRewards(activeRewards.slice(0, 4));

      // 3. Calculate Dynamic Points & Stats
      let totalEarned = 0;
      let claimedCount = 0;

      const myRewards = activeRewards.filter(r => r.email === employee.email)
      claimedCount = myRewards.length;
      totalEarned = myRewards.reduce((total, rewardPoint) => {
        return total += (rewardPoint.points || 0)
      }, 0)
      setUserPoints(totalEarned); 

      setStats([
        { id: 1, title: "Total Points Earned", value: totalEarned.toLocaleString(), icon: Award, trend: "Lifetime earnings", trendUp: true },
        { id: 2, title: "Rewards Claimed", value: claimedCount.toString(), icon: Gift, trend: "Successfully redeemed", trendUp: true },
        { id: 3, title: "Department", value: employee?.department || "N/A", icon: Trophy, trend: employee?.employment || "Active", trendUp: true },
        { id: 4, title: "Available Balance", value: totalEarned.toLocaleString(), icon: Sparkles, trend: "Ready to spend", trendUp: true },
      ]);

      // 4. Generate 6-Month Points History for Chart
      generateChartData(activeRewards);

    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  // Helper to build sequential graph data
  const generateChartData = (rewardsData) => {
    const data = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const today = new Date();
    
    // Initialize last 6 months with 0 points
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      data.push({
        name: monthNames[d.getMonth()],
        monthIndex: d.getMonth(),
        year: d.getFullYear(),
        points: 0
      });
    }

    // Populate with actual API data
    rewardsData.forEach(r => {
      if (r.points) {
        // Safely extract date (Handles both ISO strings and MongoDB $date objects)
        const dateStr = r.createdAt?.$date || r.createdAt;
        if (!dateStr) return;
        
        const rDate = new Date(dateStr);
        const rMonth = rDate.getMonth();
        const rYear = rDate.getFullYear();

        // Add points to the matching month in our timeline
        const monthData = data.find(m => m.monthIndex === rMonth && m.year === rYear);
        if (monthData) {
          monthData.points += r.points;
        }
      }
    });

    setGraphData(data);
  };

  useEffect(() => {
    getData();    
  }, []);
  
  const customScrollbarClasses = "overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

  // --- RENDER ---
  return (
    <div className={`flex h-screen ${theme.appBg} ${theme.textMain} font-sans overflow-hidden selection:bg-zinc-200 selection:text-black`}>
      <EmployeeSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className={`flex-1 bg-slate-50 ${customScrollbarClasses}`}>
        
        {/* Mobile Header */}
        <div className="lg:hidden p-4 pb-0 flex justify-between items-center shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className={`flex items-center gap-2 ${theme.textMuted} hover:text-black hover:bg-zinc-100 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm transition-all`}>
            <Menu size={20} /> <span className="text-sm font-medium">Menu</span>
          </button>
        </div>

        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 pb-12">
          
          {/* 1. Welcome Banner */}
          <section className="relative rounded-2xl overflow-hidden bg-zinc-950 flex flex-col justify-end p-8 sm:p-10 text-white shadow-xl border border-zinc-800">
            <div className="absolute top-[-50%] left-[-10%] w-96 h-96 bg-zinc-600/20 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-80 h-80 bg-zinc-400/10 blur-[100px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md mb-6">
                  <Sparkles size={14} className="text-zinc-300" />
                  <span className="text-[11px] uppercase tracking-widest text-zinc-300 font-bold">Employee Portal</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold mb-3 tracking-tight text-white capitalize">
                  Welcome back, {currentUser?.username?.split(' ')[0] || 'Team Member'}!
                </h2>
                <p className="text-base text-zinc-400 leading-relaxed font-medium">
                  You're doing great. Check out your latest achievements and see what's new in the rewards store.
                </p>
              </div>

              {/* Current Points Overlay */}
              <div className="bg-white/10 border border-white/10 rounded-2xl p-6 w-full md:w-auto shrink-0 flex flex-col items-start md:items-end shadow-lg">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Available Balance</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold text-white tracking-tight">{userPoints.toLocaleString()}</span>
                  <span className="text-xl font-bold text-zinc-400">pts</span>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Quick Stats Grid (Dynamically Rendered) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-xl bg-zinc-50 text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-300">
                      <Icon size={20} />
                    </div>
                  </div>
                  <p className="text-[10px] font-bold tracking-wider uppercase text-slate-500">{stat.title}</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight capitalize">{stat.value}</p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                    <TrendingUp size={14} />
                    <span>{stat.trend}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3. Performance Graph & Recent Achievements */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart Section */}
            <div className="lg:col-span-2 bg-white p-6 lg:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Points History</h2>
                  <p className="text-xs text-slate-500 mt-1">Your earning velocity over the last 6 months.</p>
                </div>
              </div>
              
              <div className="flex-1 w-full h-70">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#09090b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#09090b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#09090b', color: '#fff', borderRadius: '12px', border: 'none', fontWeight: 'bold' }}
                      itemStyle={{ color: '#fff' }}
                      cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area type="monotone" dataKey="points" stroke="#09090b" strokeWidth={3} fillOpacity={1} fill="url(#colorPoints)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Achievements Vertical List */}
            <div className="bg-white p-6 lg:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-900">Recent Rewards</h2>
                <button onClick={() => navigate('/employee/rewards')} className="text-xs font-bold text-slate-500 hover:text-black transition-colors flex items-center gap-1">
                  View All <ChevronRight size={14} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {rewards.length > 0 ? rewards.map((reward) => (
                  <div key={reward._id?.$oid || reward._id} className="group relative p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-zinc-900 hover:border-zinc-900 transition-all duration-300">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-zinc-400 line-clamp-1 pr-2">{reward.category}</span>
                      {reward.points ? (
                        <span className="text-xs font-extrabold text-slate-900 group-hover:text-white bg-white group-hover:bg-zinc-800 px-2 py-0.5 rounded shadow-sm border border-slate-200 group-hover:border-zinc-700 transition-colors whitespace-nowrap">
                          +{reward.points} pts
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-900 group-hover:text-white uppercase">
                          Perk
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-white mb-1 transition-colors">{reward.title}</h4>
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 group-hover:text-zinc-500">
                      <Clock size={12} />
                      <span className="capitalize">{reward.status || 'Issued'}</span>
                    </div>
                  </div>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50">
                    <Award size={32} className="text-slate-400" />
                    <p className="text-sm text-slate-500 font-medium">No recent rewards found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. Featured Products (Marketplace Highlights) */}
          <div className="flex flex-col pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-zinc-100 text-zinc-900 rounded-xl"><Package size={20} /></div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Marketplace Highlights</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Spend your points on exclusive items.</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/employee/store')}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-all shadow-md w-full sm:w-auto"
              >
                Explore Store <ArrowRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {products.map((product) => (
                <div key={product._id?.$oid || product._id} className="group bg-white border border-slate-200 rounded-2xl p-4 transition-all duration-300 hover:border-zinc-900 hover:shadow-xl flex flex-col">
                  <div className="aspect-square rounded-xl bg-slate-50 mb-4 overflow-hidden relative flex items-center justify-center border border-slate-100">
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
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1.5">{product.category || 'Merch'}</p>
                    <h4 className="text-sm font-bold text-slate-900 mb-4 line-clamp-2 leading-snug">{product.name}</h4>
                    
                    <div className="mt-auto flex items-end justify-between pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold mb-0.5 uppercase tracking-widest">Cost</p>
                        <span className="text-lg font-extrabold text-zinc-900 tracking-tight">{product.price} <span className="text-[10px] font-semibold text-zinc-500 uppercase">pts</span></span>
                      </div>
                      <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-zinc-900 group-hover:border-zinc-900 group-hover:text-white transition-all duration-300 text-slate-600 bg-white">
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Team Leaders / Directory */}
          <div className="flex flex-col pt-6 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-zinc-100 text-zinc-900 rounded-xl"><Shield size={20} /></div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">System Administrators</h3>
              </div>
              <button onClick={() => navigate('/employee/directory')} className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-black transition-colors flex items-center gap-1">
                View Directory <ArrowRight size={14} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {admins.map((user) => (
                <div key={user._id?.$oid || user._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                  <div className="relative shrink-0">
                    {user.profile?.imageUrl ? (
                      <img src={user.profile.imageUrl} alt={user.username} className="w-14 h-14 rounded-full object-cover border border-slate-200" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200">
                        <UserCircle size={28} className="text-slate-400" />
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate capitalize">{user.username}</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{user.role?.replace('_', ' ')}</p>
                  </div>

                  <a href={`mailto:${user.email}`} className="p-2.5 bg-slate-50 hover:bg-zinc-900 hover:text-white border border-slate-200 hover:border-zinc-900 text-slate-600 rounded-xl transition-colors shrink-0">
                    <Mail size={16} />
                  </a>
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