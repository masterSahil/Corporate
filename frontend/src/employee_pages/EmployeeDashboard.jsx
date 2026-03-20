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
import { theme } from "../components/Theme";
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
  
  // CHART STATES: 'THIS_MONTH', 'LAST_MONTH', '1_YEAR'
  const [chartView, setChartView] = useState('THIS_MONTH'); 
  const [allUserRewards, setAllUserRewards] = useState([]); 

  // --- DATA FETCHING & PROCESSING ---
  const getData = async () => {
    try {
      // 1. Fetch all data in parallel, INCLUDING the current session role
      const [resUsers, resRewards, resProducts, resRole] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_KEY}`, { withCredentials: true }), 
        axios.get(`${import.meta.env.VITE_API_KEY}/reward`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_KEY}/product`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_KEY}/check-role`, { withCredentials: true }) 
      ]);

      const fetchedUsers = resUsers.data?.users || [];
      const fetchedRewards = resRewards.data?.reward || [];
      const fetchedProducts = resProducts.data?.product || [];
      
      // 2. EXACT USER MATCHING
      // Get the email of the person holding the JWT cookie
      const loggedInEmail = resRole.data?.user?.email;
      // Find their exact profile in the user database
      const actualEmployee = fetchedUsers.find(u => u.email === loggedInEmail);
      setCurrentUser(actualEmployee);

      // 3. Setup Admins & Store Items (For the UI layout)
      const adminsList = fetchedUsers.filter(u => ['admin', 'super_admin'].includes(u.role?.toLowerCase()));
      setAdmins(adminsList.slice(0, 3));
      setProducts(fetchedProducts.filter(p => !p.isDeleted).slice(0, 4));
      const activeRewards = fetchedRewards.filter(r => !r.isDeleted);
      setRewards(activeRewards.slice(0, 4));

      // 4. PROCESS PERSONALIZED DATA
      // Only get rewards that belong to this specific user
      const myRewards = activeRewards.filter(r => r.email === loggedInEmail);
      setAllUserRewards(myRewards);
      // Grab points straight from the database object!
      setUserPoints(actualEmployee?.points || 0); 

      // 5. CALCULATE STATS
      // Count how many items they've successfully claimed
      const claimedCount = myRewards.filter(r => r.status?.toLowerCase() === 'redeemed').length;
      const dateString = actualEmployee?.createdAt?.$date || actualEmployee?.createdAt;
      const joinDate = dateString ? 
      new Date(dateString).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) 
        : "Recently";

      // 6. BUILD NON-REPETITIVE STAT CARDS
      setStats([
        {  id: 1,  title: "Rewards Claimed",  value: claimedCount.toString(),  
           icon: Gift,  trend: "Lifetime redemptions",  trendUp: true 
        },
        { 
          id: 2, title: "Department", value: actualEmployee?.department || "Unassigned", icon: Trophy, 
          trend: "Active Team", trendUp: true 
        },
        { 
          id: 3,  title: "Role Type",  value: actualEmployee?.employment || "Staff",  icon: Shield,  
          trend: "Verified Status",  trendUp: true 
        },
        { 
          id: 4, title: "Member Since", value: joinDate, icon: Clock, trend: "Company Tenure", trendUp: true 
        },
      ]);

      // 7. Initialize Graph Data
      generateChartData(myRewards, 'THIS_MONTH');
    } catch (error) {
      console.error("Error fetching employee dashboard data:", error);
    }
  };

  // Build graph data based on selection
  const generateChartData = (rewardsData, viewType) => {
    const data = [];
    const today = new Date();

    if (viewType === 'THIS_MONTH' || viewType === 'LAST_MONTH') {
      // Setup base date depending on selection
      const targetDate = viewType === 'THIS_MONTH' 
        ? new Date(today.getFullYear(), today.getMonth(), 1)
        : new Date(today.getFullYear(), today.getMonth() - 1, 1);
      
      // Get total days in that specific month (e.g., 28, 30, or 31)
      const daysInMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();

      // Create an entry for every day of the month (1 to 31)
      for (let i = 1; i <= daysInMonth; i++) {
        data.push({
          name: `${i} ${targetDate.toLocaleString('default', { month: 'short' })}`, day: i, 
          monthIndex: targetDate.getMonth(), year: targetDate.getFullYear(), points: 0
        });
      }

      // Map rewards to the specific days
      rewardsData.forEach(r => {
        if (r.points && r.status?.toLowerCase() === 'redeemed') {
          const dateStr = r.createdAt?.$date || r.createdAt;
          if (!dateStr) return;
          const rDate = new Date(dateStr);
          
          const dayData = data.find(d => 
            d.day === rDate.getDate() && 
            d.monthIndex === rDate.getMonth() && 
            d.year === rDate.getFullYear()
          );
          if (dayData) dayData.points += r.points;
        }
      });

    } else if (viewType === '1_YEAR') {
      // Create an entry for the last 12 months
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        data.push({
          name: monthNames[d.getMonth()],
          monthIndex: d.getMonth(),
          year: d.getFullYear(),
          points: 0
        });
      }

      // Map rewards to the specific months
      rewardsData.forEach(r => {
        if (r.points && r.status?.toLowerCase() === 'redeemed') {
          const dateStr = r.createdAt?.$date || r.createdAt;
          if (!dateStr) return;
          const rDate = new Date(dateStr);
          
          const monthData = data.find(m => m.monthIndex === rDate.getMonth() && m.year === rDate.getFullYear());
          if (monthData) monthData.points += r.points;
        }
      });
    }
    setGraphData(data);
  };

  const handleChartToggle = (view) => {
    setChartView(view);
    generateChartData(allUserRewards, view);
  };

  useEffect(() => {
    getData();    
  }, []);
  
  const customScrollbarClasses = "overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

  return (
    <div className={`flex h-screen ${theme.appBg} ${theme.textMain} font-sans overflow-hidden selection:bg-zinc-200 selection:text-black`}>
      <EmployeeSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className={`flex-1 bg-slate-50 ${customScrollbarClasses}`}>
        
        <div className="lg:hidden p-4 pb-0 flex justify-between items-center shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className={`flex items-center gap-2 ${theme.textMuted} hover:text-black hover:bg-zinc-100 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm transition-all`}>
            <Menu size={20} /> <span className="text-sm font-medium">Menu</span>
          </button>
        </div>

        <div className="max-w-7xl mx-auto p-6 space-y-8 pb-12">
          {/* Welcome Banner */}
          <section className="relative rounded-2xl overflow-hidden bg-zinc-950 flex flex-col justify-end p-6 text-white shadow-xl border border-zinc-800">
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

              <div className="bg-white/10 border border-white/10 rounded-2xl p-6 w-full md:w-auto shrink-0 flex flex-col items-start md:items-end shadow-lg">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Available Points</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold text-white tracking-tight">{userPoints.toLocaleString()}</span>
                  <span className="text-xl font-bold text-zinc-400">pts</span>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Stats Grid */}
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

          {/* Performance Graph & Recent Achievements */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart Section */}
            <div className="lg:col-span-2 bg-white p-6 lg:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Points History</h2>
                  <p className="text-xs text-slate-500 mt-1">Your earning velocity over time.</p>
                </div>
                
                {/* NEW TOGGLE BUTTONS */}
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 overflow-x-auto max-w-full">
                  <button 
                    onClick={() => handleChartToggle('THIS_MONTH')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap ${chartView === 'THIS_MONTH' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    This Month
                  </button>
                  <button 
                    onClick={() => handleChartToggle('LAST_MONTH')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap ${chartView === 'LAST_MONTH' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Last Month
                  </button>
                  <button 
                    onClick={() => handleChartToggle('1_YEAR')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap ${chartView === '1_YEAR' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    1 Year
                  </button>
                </div>
              </div>
              
              <div className="flex-1 w-full h-75 min-h-75">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#09090b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#09090b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} 
                      dy={10} 
                      minTickGap={15} // Prevents day labels from overlapping on month view
                    />
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

              <div className="flex-1 pr-2 space-y-4 custom-scrollbar">
                {rewards.length > 0 ? rewards.map((reward, key) => (
                  <div key={key} className="group relative p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-zinc-900 hover:border-zinc-900 transition-all duration-300">
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

          {/* Featured Products (Marketplace Highlights) */}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {products.map((product) => (
                <div 
                  key={product._id?.$oid || product._id} 
                  onClick={() => navigate('/employee/store')}
                  className="group bg-white border border-slate-200 rounded-2xl p-3 transition-all duration-500 hover:border-black hover:shadow-2xl cursor-pointer flex flex-col"
                >
                  {/* Image Container with Floating Badges */}
                  <div className="aspect-square rounded-xl bg-slate-50 mb-4 overflow-hidden relative flex items-center justify-center border border-slate-100">
                    {product.gallery && product.gallery.length > 0 ? (
                      <img src={product.gallery[0].fileUrl || "https://static.vecteezy.com/system/resources/thumbnails/032/176/191/small/business-avatar-profile-black-icon-man-of-user-symbol-in-trendy-flat-style-isolated-on-male-profile-people-diverse-face-for-social-network-or-web-vector.jpg"} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                      />
                    ) : (
                      <Package size={40} className="text-slate-300" />
                    )}
                    
                    {/* Subtle dark overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>

                    {/* Category Badge (Top Left) */}
                    <div className="absolute top-3 left-0 flex min-w-0 max-w-full">
                      <span className="bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1.5 rounded-md shadow-sm truncate">
                        {product.category || 'Merch'}
                      </span>
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 flex flex-col px-2 pb-2">
                    <h4 className="text-base font-black text-slate-900 mb-1 line-clamp-1 leading-snug group-hover:text-black transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-xs font-medium text-slate-500 line-clamp-2">
                      {product.description || "Premium employee reward item."}
                    </p>
                    
                    {/* Hover Animated "View in Store" Link */}
                    <div className="mt-4 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-400 group-hover:text-black transition-colors">
                      <span>View in Store</span>
                      <ArrowRight size={14} className="transform -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                    </div>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <>
                  <div className="w-full bg-white border border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="p-4 bg-slate-100 rounded-full mb-4 border border-slate-100">
                      <Package size={32} />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">Marketplace is Empty</h4>
                    <p className="text-sm text-slate-500 max-w-sm">
                      There are currently no items available in the store. Check back later to spend your points on new rewards!
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Team Leaders / Directory */}
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