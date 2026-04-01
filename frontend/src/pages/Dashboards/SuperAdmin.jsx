import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Menu, Users, Shield, Package, Gift, UserCheck, Zap, Trash2, Download, UserPlus, FileText, CheckCircle2, Clock, ShoppingCart, RefreshCw } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import Sidebar from "../../components/Sidebar";
import { theme } from "../../components/Theme";
import { toast } from "../../ui/Toaster";

// --- CONSTANTS ---
const donutColors = ['#09090b', '#52525b', '#a1a1aa', '#e4e4e7', '#71717a'];
const donutBgClasses = ['bg-[#09090b]', 'bg-[#52525b]', 'bg-[#a1a1aa]', 'bg-[#e4e4e7]', 'bg-[#71717a]'];

const quickActions = [
  { id: 1, label: "Add Employee", icon: UserPlus, navigate: "/employees/add" },
  { id: 2, label: "Create Reward", icon: Gift, navigate: "/rewards/add" },
  { id: 3, label: "Add Product", icon: Package, navigate: "/products/add" },
  { id: 4, label: "Audit Logs", icon: FileText, navigate: "/system-logs" },
  { id: 5, label: "Orders", icon: ShoppingCart, navigate: "/checkout-orders" },
  { id: 6, label: "Settings", icon: FileText, navigate: "/settings" },
];

const Dashboard = () => {
  // --- STATE ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [joiningDate, setJoiningDate] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- DATA FETCHING ---
  const getData = async () => {
    try {
      setLoading(true);
      const [resUsers, resDeleted, resProducts, resRewards, loggedInAdmin] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_KEY}/fetch-all-user`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_KEY}/fetch-deleted`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_KEY}/product-all`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_KEY}/reward-all`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_KEY}/check-role`, { withCredentials: true }),
      ]);

      if (resUsers.data?.success) setUsers(resUsers.data.users || []);
      if (resDeleted.data?.success) setDeletedUsers(resDeleted.data.users || []);
      if (resProducts.data?.success) setProducts(resProducts.data.product || []);
      if (resRewards.data?.success) setRewards(resRewards.data.reward.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5) || []);
      setJoiningDate(loggedInAdmin.data.user.createdAt);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const formatDateTimeParts = (dateString) => {
  const date = new Date(dateString);

  const formattedDate = date.toLocaleDateString("en-IN", {day: "2-digit", month: "2-digit", year: "numeric"});
  const formattedTime = date.toLocaleTimeString("en-IN", {hour: "2-digit", minute: "2-digit", hour12: true});

  return { formattedDate, formattedTime };
};

  // --- DYNAMIC DATA CALCULATIONS ---
  // 1. User & Admin Metrics
  const employeesOnly = users.filter(u => u.role?.toLowerCase() === 'employee');
  const totalEmployeesCount = employeesOnly.length;
  const activeEmployeesCount = employeesOnly.filter(u => !u.isDeleted).length;
  const adminsCount = users.filter(u => ['admin', 'super_admin'].includes(u.role?.toLowerCase())).length;
  
  // 2. Product & Reward Metrics
  const uniqueBrandsCount = new Set(products.map(p => p.brand?.toLowerCase())).size;
  const uniqueRewardCategories = new Set(rewards.map(r => r.category)).size;

  const topStats = [
    { id: 1, title: "Joining Date", value: "-", icon: Users, badge: null, badgeColor: "" },
    { id: 2, title: "Total Admins", value: adminsCount.toString(), icon: Shield, badge: null, badgeColor: "" },
    { id: 3, title: "Total Products", value: products.length.toString(), icon: Package, badge: null, badgeColor: "" },
    { id: 4, title: "Rewards Issued", value: rewards.length.toString(), icon: Gift, badge: null, badgeColor: "" },
    { id: 5, title: "Active Employees", value: activeEmployeesCount.toString(), icon: UserCheck, badge: null, badgeColor: "" },
    { id: 6, title: "Product Brands", value: uniqueBrandsCount.toString(), icon: Package, badge: null, badgeColor: "" },
    { id: 7, title: "Reward Categories", value: uniqueRewardCategories.toString(), icon: Zap, badge: null, badgeColor: "" },
    { id: 8, title: "Deleted Records", value: deletedUsers.length.toString(), icon: Trash2, badge: deletedUsers.length > 0 ? "Warning" : null, badgeColor: "bg-red-50 text-red-600", alert: deletedUsers.length > 0 },
  ];

  // 3. Department Spread
  const deptCounts = {};
  employeesOnly.forEach(u => {
    const dept = u.department || 'Unassigned';
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });
  
  const dynamicDeptData = Object.keys(deptCounts).map(name => ({ name, value: deptCounts[name],
    percentage: Math.round((deptCounts[name] / (totalEmployeesCount || 1)) * 100)
  }));
  const safeDeptData = dynamicDeptData.length>0 ? dynamicDeptData: [{name: 'No Data', value: 1, percentage: 0}];

  // 4. System Insights
  const uniqueProductCategories = new Set(products.map(p => p.category)).size;
  const uniqueRewardRecipients = new Set(rewards.map(r => r.email)).size;
  
  const systemInsights = [
    { id: 1, text: "Inventory catalog spans across", highlight: uniqueProductCategories.toString(), suffix: "unique categories.", icon: Package, iconColor: "text-zinc-300" },
    { id: 2, text: "Total rewards assigned to", highlight: uniqueRewardRecipients.toString(), suffix: "corporate employees.", icon: Gift, iconColor: "text-amber-400" },
  ];

  // 5. Activity Feed
  const activityFeed = [];
  if (rewards.length > 0) {
    const latestReward = rewards[rewards.length - 1];
    activityFeed.push({ id: 1, user: "Reward System", action: `Issued '${latestReward.title}' to ${latestReward.email.split('@')[0]}`, time: "Recent" });
  }
  if (users.length > 0) {
    const latestUser = users[users.length - 1];
    activityFeed.push({ id: 2, user: "HR Module", action: `Onboarded new employee: ${latestUser.email.split('@')[0]}`, time: "Recent" });
  }
  if (products.length > 0) {
    const latestProduct = products[products.length - 1];
    activityFeed.push({ id: 3, user: "Inventory", action: `Added ${latestProduct.name} (${latestProduct.brand})`, time: "Recent" });
  }

  // 6. Recent Lists
  const recentEmployeesList = employeesOnly.slice(-5).reverse().map(u => ({
    id: u._id,
    name: u.email.split('@')[0],
    role: u.profile?.role || "Employee",
    dept: u.department || "Unassigned",
    status: u.isDeleted ? "Pending" : "Active",
    initial: (u.profile?.name || u.email)[0].toUpperCase()
  }));

  const recentRewardsList = rewards.slice(-5).reverse().map(r => ({
    id: r._id,
    title: r.title,
    recipient: r.email,
    value: r.category, 
    status: r.status 
  }));

  // --- HANDLERS ---
  const handleExportCSV = () => {
    let csvContent = "Metric,Value\n";
    topStats.forEach(stat => { csvContent += `"${stat.title}","${stat.value}"\n`; });
    csvContent += "\nDepartment,Employee Count,Percentage\n";
    safeDeptData.forEach(dept => {
      if (dept.name !== 'No Data') {
        csvContent += `"${dept.name}","${dept.value}","${dept.percentage}%"\n`;
      }
    });
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `dashboard_summary_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const customScrollbarClasses = "overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

  // --- RENDER ---
  return (
    <div className={`flex h-dvh w-full ${theme.appBg} ${theme.textMain} font-sans overflow-hidden selection:bg-zinc-200 selection:text-zinc-900`}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className={`flex-1 bg-slate-50 ${customScrollbarClasses} flex flex-col`}>
        
        {/* loader */}
        {loading && (
          <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-999">
            <div className="rounded-xl bg-white/70 shadow-xl px-6 py-5 flex items-center gap-3">
              <RefreshCw className="animate-spin text-slate-700" size={22} />
              <span className="text-sm font-semibold text-slate-800"> Loading... </span>
            </div>
          </div>
        )}

        {/* Mobile Header */}
        <div className="lg:hidden p-4 pb-0 flex justify-between items-center shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className={`flex items-center gap-2 ${theme.textMuted} hover:text-black hover:bg-zinc-100 ${theme.cardBg} border ${theme.border} px-3 py-2 rounded-lg shadow-sm transition-all`}>
            <Menu size={20} /> <span className="text-sm font-medium">Menu</span>
          </button>
        </div>

        <div className="p-6 max-w-7xl mx-auto w-full space-y-8 pb-12">
          
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">System Overview</h1>
              <p className="text-zinc-500 text-sm mt-1">Real-time management and analytics across the enterprise.</p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button onClick={handleExportCSV} 
                className="flex-1 sm:flex-none px-5 py-2.5 bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl text-sm font-semibold text-zinc-700 flex items-center justify-center gap-2 hover:bg-zinc-50 transition-all shadow-sm">
                <Download size={18} /> Export
              </button>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {topStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.id} className={`${theme.cardBg} p-6 rounded-2xl border ${stat.alert ? 'border-red-100' : theme.border} shadow-sm hover:shadow-md transition-shadow group`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2.5 rounded-xl transition-transform ${stat.alert ? 'bg-red-50 text-red-600' : 'bg-zinc-100 text-zinc-900'}`}>
                      <Icon size={20} />
                    </div>
                    {stat.badge && (
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${stat.badgeColor}`}>
                        {stat.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-bold tracking-wider uppercase text-zinc-500">{stat.title}</p>
                  {stat.title === "Joining Date" && joiningDate ? (
                    (() => {
                      const { formattedDate, formattedTime } = formatDateTimeParts(joiningDate);
                      return (
                        <div className="flex items-center gap-2 mt-1">
                          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
                            {formattedDate}
                          </h1>
                          <span className="text-sm mt-2 text-zinc-500 font-medium">
                            {formattedTime}
                          </span>
                        </div>
                      );
                    })()
                  ) : (
                    <p className="text-2xl font-bold text-zinc-900 mt-1 tracking-tight">
                      {stat.value}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Department Chart */}
            <div className={`${theme.cardBg} p-6 lg:p-8 rounded-2xl border ${theme.border} shadow-sm flex flex-col`}>
              <h2 className="text-lg font-bold text-zinc-900 mb-6">Department Spread</h2>
              <div className="flex-1 min-h-55 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={safeDeptData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none">
                      {safeDeptData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={donutColors[index % donutColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 'bold', zIndex: 9999, position: 'relative' }} itemStyle={{ color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-zinc-900">{totalEmployeesCount}</span>
                  <span className="text-[9px] font-bold text-zinc-400 tracking-widest uppercase mt-1">Total</span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-y-3 gap-x-2">
                {safeDeptData.map((dept, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${donutBgClasses[i % donutBgClasses.length]}`} />
                    <span className="text-xs font-medium text-zinc-600 truncate" title={dept.name}>
                      {dept.name} <span className="text-zinc-400">({dept.percentage}%)</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`${theme.cardBg} p-6 lg:p-8 rounded-2xl border ${theme.border} shadow-sm`}>
              <h2 className="text-[10px] font-bold tracking-wider uppercase text-zinc-500 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 lg:gap-4">
                {quickActions.map((action, index) => {
                  const ActionIcon = action.icon;
                  return (
                    <Link to={action.navigate} key={action.id}
                      className={`flex flex-col items-center justify-center p-6 bg-zinc-50 rounded-xl
                        hover:bg-zinc-900 hover:text-white transition-all duration-300 group
                        border border-zinc-200 hover:border-zinc-900
                        ${index >= 4 ? "lg:hidden xl:flex" : ""}`}>
                      <ActionIcon className="mb-3 text-zinc-600 group-hover:text-white transition-colors"
                        size={24}/>
                      <span className="text-xs font-bold text-center">
                        {action.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Insights & Feed */}
            <div className="space-y-6 flex flex-col">
              <div className="bg-zinc-900 text-white p-6 lg:p-8 rounded-2xl shadow-lg">
                <h2 className="text-[10px] font-bold tracking-wider uppercase text-zinc-400 mb-5">System Insights</h2>
                <ul className="space-y-4">
                  {systemInsights.map((insight) => {
                    const InsightIcon = insight.icon;
                    return (
                      <li key={insight.id} className="flex gap-3 items-start">
                        <InsightIcon size={16} className={`${insight.iconColor} mt-0.5 shrink-0`} />
                        <p className="text-sm leading-snug text-zinc-100">
                          {insight.text} <span className="font-bold text-white">{insight.highlight}</span> {insight.suffix}
                        </p>
                      </li>
                    );
                  })}
                  {systemInsights.length === 0 && (
                     <p className="text-sm text-zinc-400">Collecting insight data...</p>
                  )}
                </ul>
              </div>

              <div className={`${theme.cardBg} p-6 rounded-2xl border ${theme.border} shadow-sm flex-1`}>
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-[10px] font-bold tracking-wider uppercase text-zinc-500">Recent Activity</h2>
                  <Link to="/system-logs" className="text-sm font-semibold text-zinc-900 border border-zinc-200 px-4 py-2 rounded-lg hover:bg-zinc-50 transition-colors">See all</Link>
                </div>
                <div className="space-y-5">
                  {activityFeed.length > 0 ? activityFeed.map((feed) => (
                    <div key={feed.id} className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200">
                        <Clock size={14} className="text-zinc-500" />
                      </div>
                      <div>
                        <p className="text-xs text-zinc-800 leading-tight"><span className="font-bold text-zinc-900">{feed.user}</span> • {feed.action}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-1">{feed.time}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-zinc-500">No recent activity found.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Employees Table */}
            <div className={`${theme.cardBg} rounded-2xl border ${theme.border} shadow-sm overflow-hidden flex flex-col`}>
              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 gap-4">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">Recent Employees</h2>
                  <p className="text-xs text-zinc-500 mt-1">Latest onboarded personnel across departments.</p>
                </div>
                <Link to="/employees/manage" className="text-sm font-semibold text-zinc-900 border border-zinc-200 px-4 py-2 rounded-lg hover:bg-zinc-50 transition-colors">See all</Link>
              </div>
              <div className={`overflow-x-auto ${customScrollbarClasses}`}>
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-zinc-50/50 border-b border-zinc-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold tracking-wider uppercase text-zinc-500">Employee</th>
                      <th className="px-6 py-4 text-[10px] font-bold tracking-wider uppercase text-zinc-500">Department</th>
                      <th className="px-6 py-4 text-[10px] font-bold tracking-wider uppercase text-zinc-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {recentEmployeesList.length > 0 ? recentEmployeesList.map((emp) => (
                      <tr key={emp.id} className="hover:bg-zinc-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600">
                              {emp.initial}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-zinc-900 group-hover:text-black">{emp.name}</p>
                              <p className="text-xs text-zinc-500">{emp.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-600">{emp.dept}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {emp.status}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="3" className="px-6 py-8 text-center text-sm text-zinc-500">No recent employees found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rewards Table */}
            <div className={`${theme.cardBg} rounded-2xl border ${theme.border} shadow-sm overflow-hidden flex flex-col`}>
              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 gap-4">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">Recent Rewards</h2>
                  <p className="text-xs text-zinc-500 mt-1">Latest reward distributions.</p>
                </div>
                <Link to="/rewards/manage" className="text-sm font-semibold text-zinc-900 border border-zinc-200 px-4 py-2 rounded-lg hover:bg-zinc-50 transition-colors">See all</Link>
              </div>
              <div className={`overflow-x-auto ${customScrollbarClasses}`}>
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-zinc-50/50 border-b border-zinc-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold tracking-wider uppercase text-zinc-500">Reward Title</th>
                      <th className="px-6 py-4 text-[10px] font-bold tracking-wider uppercase text-zinc-500">Category</th>
                      <th className="px-6 py-4 text-[10px] font-bold tracking-wider uppercase text-zinc-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {recentRewardsList.length > 0 ? recentRewardsList.map((reward) => (
                      <tr key={reward.id} className="hover:bg-zinc-50 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-zinc-900">{reward.title}</p>
                          <p className="text-xs text-zinc-500">To: {reward.recipient || "Not Assigned"}</p>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-zinc-700">{reward.value}</td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center gap-1.5 ${reward.status === 'Disbursed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {reward.status === 'Disbursed' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                            <span className="text-[10px] font-bold uppercase tracking-wider">{reward.status}</span>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="3" className="px-6 py-8 text-center text-sm text-zinc-500">No recent rewards found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;