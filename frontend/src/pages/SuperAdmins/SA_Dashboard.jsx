import React, { useState } from 'react';
import { Menu, TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle, MoreVertical } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { theme } from '../../components/theme'; 

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activities = [
    { id: 1, user: 'Sarah Jenkins', action: 'Updated Inventory', date: 'Oct 24', status: 'Completed', color: theme.status.success },
    { id: 2, user: 'Michael Chen', action: 'Requested Approval', date: 'Oct 23', status: 'Pending', color: theme.status.pending },
    { id: 3, user: 'David Wilson', action: 'Login Failed', date: 'Oct 21', status: 'Failed', color: theme.status.danger },
  ];

  return (
    <div className={`flex h-screen w-full ${theme.appBg} ${theme.textMain} font-sans overflow-hidden selection:bg-zinc-200 selection:text-zinc-900`}>
      
      {/* Sidebar Controlled Here */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar relative bg-slate-50">
        
        {/* Mobile Header (Only visible on small screens) */}
        <div className="lg:hidden p-4 pb-0 flex justify-between items-center shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className={`flex items-center gap-2 ${theme.textMuted} hover:text-black hover:bg-zinc-100 ${theme.cardBg} border ${theme.border} px-3 py-2 rounded-lg shadow-sm transition-all`}
          >
            <Menu size={20} /> <span className="text-sm font-medium">Menu</span>
          </button>
        </div>

        {/* Dashboard Content area (Ideally, this would be an <Outlet /> if using nested routes) */}
        <div className="p-4 lg:p-8">
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">Overview</h1>
            <p className={`text-sm ${theme.textMuted} mt-1`}>Manage your enterprise platform metrics</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6 mb-8">
            {[
              { label: 'Total Admins', val: '124', trend: '+2.4%', up: true },
              { label: 'Employees', val: '8,432', trend: '+12.8%', up: true },
              { label: 'Products', val: '1,205', trend: '-0.5%', up: false },
              { label: 'Rewards', val: '45.2k', trend: '+8.2%', up: true },
            ].map((stat, i) => (
              <div key={i} className={`${theme.cardBg} rounded-xl p-5 border ${theme.border} shadow-sm hover:border-black transition-colors group`}>
                <h3 className={`text-xs font-bold uppercase ${theme.textMuted} mb-3 group-hover:text-black transition-colors`}>{stat.label}</h3>
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-bold text-slate-900">{stat.val}</span>
                  <span className={`flex items-center text-xs font-bold ${stat.up ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {stat.up ? <TrendingUp size={14} className="mr-1"/> : <TrendingDown size={14} className="mr-1"/>} {stat.trend}
                  </span>
                </div>
              </div>
            ))}
            
            {/* Highlight Card */}
            <div className={`bg-gradient-to-br from-zinc-800 to-black rounded-xl p-5 text-white shadow-lg shadow-black/20 relative overflow-hidden`}>
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              <h3 className="text-xs font-bold uppercase text-zinc-400 mb-3 relative z-10">Pending Approvals</h3>
              <div className="flex justify-between items-end relative z-10">
                <span className="text-2xl font-bold">18</span>
                <span className={`flex items-center text-xs font-bold text-black ${theme.cardBg} px-2 py-1 rounded-md shadow-sm`}>
                  <Clock size={12} className="mr-1" /> High
                </span>
              </div>
            </div>
          </div>

          {/* Charts Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Bar Chart */}
            <div className={`${theme.cardBg} rounded-xl border ${theme.border} shadow-sm p-6 flex flex-col h-72`}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Monthly Activity</h2>
                  <p className={`text-sm ${theme.textMuted}`}>System usage</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900">24.5k</p>
                  <p className={`text-xs text-black font-bold`}>+14%</p>
                </div>
              </div>
              <div className="flex-1 flex items-end gap-3 mt-auto">
                {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                     <div className={`w-full ${theme.appBg} rounded-sm absolute bottom-6 h-full`}>
                        <div className={`absolute bottom-0 w-full bg-zinc-800 rounded-sm transition-all duration-300 group-hover:bg-black`} style={{ height: `${h}%` }}></div>
                     </div>
                     <span className={`text-[10px] ${theme.textMuted} font-bold uppercase mt-auto z-10 group-hover:text-black transition-colors`}>
                       {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][i]}
                     </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Area Chart */}
            <div className={`${theme.cardBg} rounded-xl border ${theme.border} shadow-sm p-6 flex flex-col h-72 relative overflow-hidden`}>
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Employee Growth</h2>
                  <p className={`text-sm ${theme.textMuted}`}>Headcount changes</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900">8.4k</p>
                  <p className={`text-xs text-black font-bold`}>+22%</p>
                </div>
              </div>
              <div className="absolute inset-0 top-24 bottom-10 left-0 w-full flex items-end">
                <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full">
                  <defs>
                    <linearGradient id="gradBlack" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#000000" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,40 C20,40 30,20 50,25 C70,30 80,5 100,10 L100,50 L0,50 Z" fill="url(#gradBlack)" />
                  <path d="M0,40 C20,40 30,20 50,25 C70,30 80,5 100,10" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="50" cy="25" r="3" fill="#000000" className="animate-pulse shadow-md" />
                </svg>
              </div>
              <div className={`absolute bottom-4 left-6 right-6 flex justify-between text-[10px] ${theme.textMuted} font-bold uppercase`}>
                <span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className={`${theme.cardBg} rounded-xl border ${theme.border} overflow-hidden shadow-sm`}>
            <div className={`p-5 border-b ${theme.border} flex justify-between items-center ${theme.appBg}`}>
              <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
              <button className={`text-sm font-bold text-black ${theme.cardBg} border ${theme.border} hover:bg-zinc-100 px-3 py-1.5 rounded-md transition-colors`}>View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className={`text-[11px] uppercase tracking-wider ${theme.textMuted} border-b ${theme.border}`}>
                  <tr>
                    <th className="px-6 py-4 font-bold">Employee</th>
                    <th className="px-6 py-4 font-bold">Action</th>
                    <th className="px-6 py-4 font-bold">Date</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activities.map((act) => (
                    <tr key={act.id} className={`hover:bg-zinc-50 transition-colors`}>
                      <td className="px-6 py-4 font-bold text-slate-900">{act.user}</td>
                      <td className={`px-6 py-4 ${theme.textMuted} font-medium`}>{act.action}</td>
                      <td className={`px-6 py-4 ${theme.textMuted} font-medium`}>{act.date}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1.5 rounded-md text-[10px] uppercase tracking-wider font-bold flex w-max gap-1.5 border ${act.color}`}>
                          {act.status === 'Completed' ? <CheckCircle2 size={12} strokeWidth={2.5}/> : act.status === 'Pending' ? <Clock size={12} strokeWidth={2.5}/> : <XCircle size={12} strokeWidth={2.5}/>}
                          {act.status}
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

      {/* Global minimal scrollbar styling */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
};

export default Dashboard;