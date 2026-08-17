import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, ChevronRight, Download, Sparkles, Building2, Wrench } from 'lucide-react';

export const AdminInsightsPage: React.FC = () => {
  const { recurringAssets, navigate, showToast, t } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-2">
          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/30">
            Preventive Capital Engineering
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-sans">
            Recurring Asset Intelligence & Root Cause Analysis
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Automated detection of infrastructure nodes failing repeatedly, with recommended preventive capital overhauls.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* CIVIC INTELLIGENCE & DUPLICATE REDUCTION SUMMARY METRICS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Duplicates Avoided
            </span>
            <span className="text-2xl font-black text-blue-600 font-mono">142</span>
            <span className="text-[11px] text-slate-500 block">Field dispatch overhead saved</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Community Supported Issues
            </span>
            <span className="text-2xl font-black text-emerald-600 font-mono">37</span>
            <span className="text-[11px] text-slate-500 block">Upvoted by multiple citizens</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Recurring Clusters
            </span>
            <span className="text-2xl font-black text-amber-600 font-mono">18</span>
            <span className="text-[11px] text-slate-500 block">Targeted for capital overhauls</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Est. Budget Optimization
            </span>
            <span className="text-2xl font-black text-slate-900 font-mono">₹24.5 Lakhs</span>
            <span className="text-[11px] text-slate-500 block">Proactive vs reactive repairs</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {recurringAssets.map((ast) => (
            <div
              key={ast.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block font-bold">ASSET ID: {ast.id}</span>
                    <h3 className="font-extrabold text-slate-900 text-base font-sans">{ast.assetType}</h3>
                  </div>

                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 text-xs font-extrabold block">
                      RISK SCORE {ast.riskScore}/100
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">{ast.ward}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold block">TOTAL COMPLAINTS</span>
                    <span className="font-bold text-slate-900">{ast.totalComplaints} Logged</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold block">REOPENED COUNT</span>
                    <span className="font-bold text-rose-600">{ast.reopenedCount} Reopened</span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs space-y-1.5 text-amber-950">
                  <span className="font-bold block flex items-center gap-1.5 text-[11px]">
                    <Sparkles className="w-4 h-4 text-amber-600" /> AI Root Cause Diagnosis:
                  </span>
                  <p className="leading-relaxed">{ast.aiRootCause}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs space-y-1.5 text-blue-950">
                  <span className="font-bold block text-[11px] uppercase tracking-wider text-blue-800">
                    Recommended Preventive Upgrade:
                  </span>
                  <p className="leading-relaxed">{ast.recommendedFix}</p>
                  <p className="font-bold text-blue-700 text-[11px] pt-1">
                    Est. Capital Budget: {ast.estimatedCost} • Payback Window: {ast.roiPeriod}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    showToast('PDF Export Dispatched', `Capital Briefing for ${ast.id} downloaded`, 'info');
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> PDF Report
                </button>

                <button
                  onClick={() => navigate(`/admin/insights/${ast.id}`)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Deep Dive Failure Analysis</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
