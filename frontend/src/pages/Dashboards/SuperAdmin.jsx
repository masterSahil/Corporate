import React, { useState } from "react";
import { 
  Menu, Users, Shield, Package, Gift, UserCheck, 
  AlertCircle, Zap, Trash2, Download, Plus, UserPlus, FileText, 
  CheckCircle2, Clock
} from "lucide-react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip 
} from "recharts";
import Sidebar from "../../components/Sidebar";
import { theme } from "../../components/theme";

// ==========================================
// DEMO DATA OBJECTS (Replace with API later)
// ==========================================

const topStats = [
  { id: 1, title: "Total Employees", value: "1,240", icon: Users, badge: "+12%", badgeColor: "bg-emerald-50 text-emerald-700" },
  { id: 2, title: "Total Admins", value: "15", icon: Shield, badge: null, badgeColor: "" },
  { id: 3, title: "Total Products", value: "450", icon: Package, badge: null, badgeColor: "" },
  { id: 4, title: "Rewards Issued", value: "3,200", icon: Gift, badge: null, badgeColor: "" },
  { id: 5, title: "Active Employees", value: "1,180", icon: UserCheck, badge: null, badgeColor: "" },
  { id: 6, title: "Products in Stock", value: "412", icon: Package, badge: "Low Stock", badgeColor: "bg-amber-50 text-amber-700" },
  { id: 7, title: "Issued Today", value: "18", icon: Zap, badge: null, badgeColor: "" },
  { id: 8, title: "Deleted Records", value: "54", icon: Trash2, badge: "Warning", badgeColor: "bg-red-50 text-red-600", alert: true },
];

const deptData = [
  { name: 'Engineering', value: 42 }, 
  { name: 'Sales', value: 25 }, 
  { name: 'Marketing', value: 18 }, 
  { name: 'Other', value: 15 },
];
const donutColors = ['#09090b', '#52525b', '#a1a1aa', '#e4e4e7'];

const quickActions = [
  { id: 1, label: "Add Employee", icon: UserPlus },
  { id: 2, label: "Create Reward", icon: Gift },
  { id: 3, label: "Add Product", icon: Package },
  { id: 4, label: "Audit Logs", icon: FileText },
];

const systemInsights = [
  { id: 1, text: "Reward issuance is up", highlight: "40%", suffix: "this week.", icon: Zap, iconColor: "text-zinc-300" },
  { id: 2, text: "8 items in 'Tech Gadgets' are", highlight: "low in stock", suffix: ".", icon: AlertCircle, iconColor: "text-amber-400" },
];

const activityFeed = [
  { id: 1, user: "Marcus Thorne", action: "Created new reward: Sales Bonus", time: "2 mins ago" },
  { id: 2, user: "Sarah Connor", action: "Added 45 new employees to Engineering", time: "1 hour ago" },
  { id: 3, user: "System Audit", action: "Inventory restock: 100x Headphones", time: "3 hours ago" },
];

const recentEmployees = [
  { id: 1, name: "David Miller", role: "Lead Designer", dept: "Creative", status: "Active", initial: "D" },
  { id: 2, name: "Sophia Chen", role: "Senior Dev", dept: "Engineering", status: "Active", initial: "S" },
  { id: 3, name: "Robert Fox", role: "Sales Associate", dept: "Marketing", status: "Pending", initial: "R" },
];

const recentRewards = [
  { id: 1, title: "Performance Excellence", recipient: "Alicia Keys", value: "$250.00", status: "Disbursed" },
  { id: 2, title: "Holiday Gift Card", recipient: "Mark Sloan", value: "$50.00", status: "Processing" },
  { id: 3, title: "Client Acquisition", recipient: "James Wilson", value: "$500.00", status: "Disbursed" },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Tailwind arbitrary variants to style the scrollbar uniformly
  const customScrollbarClasses = "overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

  return (
    <div className={`flex h-screen w-full ${theme.appBg} ${theme.textMain} font-sans overflow-hidden selection:bg-zinc-200 selection:text-zinc-900`}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className={`flex-1 bg-slate-50 ${customScrollbarClasses} flex flex-col`}>
        
        {/* Mobile Header (Replaces the complex Top Navbar) */}
        <div className="lg:hidden p-4 pb-0 flex justify-between items-center shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className={`flex items-center gap-2 ${theme.textMuted} hover:text-black hover:bg-zinc-100 ${theme.cardBg} border ${theme.border} px-3 py-2 rounded-lg shadow-sm transition-all`}>
            <Menu size={20} /> <span className="text-sm font-medium">Menu</span>
          </button>
        </div>

        {/* Dashboard Content Container */}
        <div className="p-6 max-w-7xl mx-auto w-full space-y-8 pb-12">
          
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">System Overview</h1>
              <p className="text-zinc-500 text-sm mt-1">Real-time management and analytics across the enterprise.</p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none px-5 py-2.5 bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl text-sm font-semibold text-zinc-700 flex items-center justify-center gap-2 hover:bg-zinc-50 transition-all shadow-sm">
                <Download size={18} /> Export
              </button>
              <button className="flex-1 sm:flex-none px-5 py-2.5 bg-black hover:bg-zinc-800 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md">
                <Plus size={18} /> Create New
              </button>
            </div>
          </div>

          {/* --- TOP METRICS GRID --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {topStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.id} className={`${theme.cardBg} p-6 rounded-2xl border ${stat.alert ? 'border-red-100' : theme.border} shadow-sm hover:shadow-md transition-shadow group`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2.5 rounded-xl group-hover:scale-110 transition-transform ${stat.alert ? 'bg-red-50 text-red-600' : 'bg-zinc-100 text-zinc-900'}`}>
                      <Icon size={20} />
                    </div>
                    {stat.badge && (
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${stat.badgeColor}`}>
                        {stat.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-bold tracking-wider uppercase text-zinc-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-zinc-900 mt-1 tracking-tight">{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* --- MIDDLE BENTO GRID --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Department Distribution Chart */}
            <div className={`${theme.cardBg} p-6 lg:p-8 rounded-2xl border ${theme.border} shadow-sm flex flex-col`}>
              <h2 className="text-lg font-bold text-zinc-900 mb-6">Department Spread</h2>
              <div className="flex-1 min-h-55 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={deptData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none">
                      {deptData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={donutColors[index % donutColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 'bold' }} itemStyle={{ color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-zinc-900">1.2k</span>
                  <span className="text-[9px] font-bold text-zinc-400 tracking-widest uppercase mt-1">Total</span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-y-3 gap-x-2">
                {deptData.map((dept, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: donutColors[i % donutColors.length]}} />
                    <span className="text-xs font-medium text-zinc-600">{dept.name} <span className="text-zinc-400">({dept.value}%)</span></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className={`${theme.cardBg} p-6 lg:p-8 rounded-2xl border ${theme.border} shadow-sm`}>
              <h2 className="text-[10px] font-bold tracking-wider uppercase text-zinc-500 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                {quickActions.map((action) => {
                  const ActionIcon = action.icon;
                  return (
                    <button key={action.id} className="flex flex-col items-center justify-center p-6 bg-zinc-50 rounded-xl hover:bg-zinc-900 hover:text-white transition-all duration-300 group border border-zinc-200 hover:border-zinc-900">
                      <ActionIcon className="mb-3 text-zinc-600 group-hover:text-white transition-colors" size={24} />
                      <span className="text-xs font-bold">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* System Insights & Activity */}
            <div className="space-y-6 flex flex-col">
              
              {/* Dark Insight Card */}
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
                </ul>
              </div>

              {/* Activity Feed */}
              <div className={`${theme.cardBg} p-6 rounded-2xl border ${theme.border} shadow-sm flex-1`}>
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-[10px] font-bold tracking-wider uppercase text-zinc-500">Recent Activity</h2>
                  <button className="text-[10px] font-bold tracking-wider uppercase text-zinc-900 hover:underline">View All</button>
                </div>
                <div className="space-y-5">
                  {activityFeed.map((feed) => (
                    <div key={feed.id} className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200">
                        <Clock size={14} className="text-zinc-500" />
                      </div>
                      <div>
                        <p className="text-xs text-zinc-800 leading-tight"><span className="font-bold text-zinc-900">{feed.user}</span> • {feed.action}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-1">{feed.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* --- BOTTOM DATA TABLES --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Recent Employees Table */}
            <div className={`${theme.cardBg} rounded-2xl border ${theme.border} shadow-sm overflow-hidden flex flex-col`}>
              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 gap-4">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">Recent Employees</h2>
                  <p className="text-xs text-zinc-500 mt-1">Latest onboarded personnel across departments.</p>
                </div>
                <button className="text-sm font-semibold text-zinc-900 border border-zinc-200 px-4 py-2 rounded-lg hover:bg-zinc-50 transition-colors">See all</button>
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
                    {recentEmployees.map((emp) => (
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Rewards Table */}
            <div className={`${theme.cardBg} rounded-2xl border ${theme.border} shadow-sm overflow-hidden flex flex-col`}>
              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 gap-4">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">Recent Rewards</h2>
                  <p className="text-xs text-zinc-500 mt-1">Latest reward distributions.</p>
                </div>
                <button className="text-sm font-semibold text-zinc-900 border border-zinc-200 px-4 py-2 rounded-lg hover:bg-zinc-50 transition-colors">See all</button>
              </div>
              <div className={`overflow-x-auto ${customScrollbarClasses}`}>
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-zinc-50/50 border-b border-zinc-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold tracking-wider uppercase text-zinc-500">Reward Title</th>
                      <th className="px-6 py-4 text-[10px] font-bold tracking-wider uppercase text-zinc-500">Value</th>
                      <th className="px-6 py-4 text-[10px] font-bold tracking-wider uppercase text-zinc-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {recentRewards.map((reward) => (
                      <tr key={reward.id} className="hover:bg-zinc-50 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-zinc-900">{reward.title}</p>
                          <p className="text-xs text-zinc-500">To: {reward.recipient}</p>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-zinc-700">{reward.value}</td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center gap-1.5 ${reward.status === 'Disbursed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {reward.status === 'Disbursed' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                            <span className="text-[10px] font-bold uppercase tracking-wider">{reward.status}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
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