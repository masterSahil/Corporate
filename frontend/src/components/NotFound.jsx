import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LayoutGrid, Compass } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 overflow-hidden font-sans selection:bg-zinc-200 selection:text-zinc-900">
      
      {/* Next-Level Background: Subtle Grid & Glowing Orb */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[24px_24px]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-linear-to-tr from-rose-100/40 via-slate-200/40 to-blue-100/40 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

      <div className="relative z-10 max-w-2xl w-full px-6 text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">
        
        {/* Floating Compass Icon */}
        <div className="w-20 h-20 mb-8 rounded-2xl bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-xl shadow-slate-200/40 flex items-center justify-center text-slate-700 relative">
          <div className="absolute inset-0 rounded-2xl border border-white/40 pointer-events-none"></div>
          <Compass size={40} strokeWidth={1.5} className="animate-[spin_4s_ease-in-out_infinite]" />
        </div>
        
        {/* Gradient 404 Text */}
        <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-slate-900 via-slate-700 to-slate-400 drop-shadow-sm mb-4">
          404
        </h1>
        
        {/* Corporate Messaging */}
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
          Page not found
        </h2>
        <p className="text-base text-slate-500 mb-10 max-w-md mx-auto leading-relaxed">
          The page you are looking for doesn't exist or has been moved. Let's get you back to the main workspace.
        </p>

        {/* Premium Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center justify-center gap-2 px-8 py-3.5 w-full sm:w-auto text-sm font-bold text-slate-700 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow transition-all duration-300"
          >
            <ArrowLeft size={18} className="text-slate-400 group-hover:-translate-x-1 transition-transform duration-300" /> 
            Go Back
          </button>
          
          <button
            onClick={() => navigate("/dashboard")}
            className="group flex items-center justify-center gap-2 px-8 py-3.5 w-full sm:w-auto text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden"
          >
            {/* Subtle button glare effect */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
            
            <LayoutGrid size={18} className="text-slate-400 group-hover:text-white transition-colors duration-300" /> 
            Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};

export default NotFound;