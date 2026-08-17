import React from 'react';
import { useApp } from '../context/AppContext';
import { Building2, Sparkles, ShieldCheck, Heart, Users, Cpu } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { navigate, t } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <section className="bg-slate-900 text-white py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300">
            About NammaDhwani
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-sans">
            Transforming Civic Governance from Reactive to Proactive
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Our mission is to create a transparent, accountable, AI-powered civic intelligence ecosystem that empowers citizens and municipalities to build resilient cities.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-12">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xl font-bold text-slate-900 font-sans">The Core Mission</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
            NammaDhwani was built on a simple observation: urban grievances fail because they lack verification, citizen feedback loops, and root-cause intelligence. By introducing AI image comparison, location telemetry verification, and asset-level failure analytics, NammaDhwani turns individual complaints into actionable civic intelligence for city planners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm font-sans">Technology Stack</h3>
            <p className="text-xs text-slate-500">Built with React, Express, Vite, Leaflet, Recharts, and AI SDK.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm font-sans">Data Privacy</h3>
            <p className="text-xs text-slate-500">Citizen PII is encrypted; GPS telemetry is sanitized solely for grievance verification.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm font-sans">Public Impact</h3>
            <p className="text-xs text-slate-500">Empowering municipal wards with verified, accountable civic grievance resolution.</p>
          </div>
        </div>

        <div className="text-center pt-6">
          <button
            onClick={() => navigate('/get-started')}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md cursor-pointer"
          >
            Join NammaDhwani Today
          </button>
        </div>
      </div>
    </div>
  );
};
