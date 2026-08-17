import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Sparkles, 
  Mic, 
  Globe2, 
  MapPin, 
  Users, 
  TrendingUp, 
  BarChart3, 
  CheckCircle2, 
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  const { navigate, t } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      {/* Hero */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Platform Capabilities
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-sans">
            Features That Make NammaDhwani Unique
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Bridging the gap between citizen reporting, officer resolution, and predictive municipal governance with AI.
          </p>
        </div>
      </section>

      {/* Alternating Feature Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        
        {/* Feature A: AI-Verified Resolution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans">
              AI-Verified Resolution Evidence
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Don't just trust 'Resolved' button clicks. When an officer marks a grievance completed, NammaDhwani's AI evaluates before and after photo evidence, verifies location telemetry matches original GPS coordinates, and requires citizen confirmation.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Automatic before/after image similarity match</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>GPS telemetry & timestamp audit log</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Citizen feedback loop with rebuttal photo upload</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800">Verification Result Card</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                🟢 VERIFIED (96% MATCH)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-100 p-2 rounded-xl text-center">
                <span className="text-[10px] font-bold text-slate-500 block">BEFORE (REPORT)</span>
                <img src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&auto=format&fit=crop&q=80" alt="Before" className="h-28 w-full object-cover rounded-lg mt-1" />
              </div>
              <div className="bg-emerald-50 p-2 rounded-xl text-center border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-700 block">AFTER (WORK COMPLETE)</span>
                <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&auto=format&fit=crop&q=80" alt="After" className="h-28 w-full object-cover rounded-lg mt-1" />
              </div>
            </div>
            <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              AI Reason: <em>"After-photo confirms asphalt leveling at GPS 12.9784, 77.6408. Water drainage restored."</em>
            </p>
          </div>
        </div>

        {/* Feature B: Civic Issue Intelligence */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center lg:flex-row-reverse">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-3 order-2 lg:order-1">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800">Recurring Asset Alert: DR-092</span>
              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-md">
                HIGH RISK (SCORE 92/100)
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 bg-slate-50 p-2 rounded-lg">
                <span>Total Complaints Logged: <strong>17</strong></span>
                <span>Reopened: <strong>5 times</strong></span>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-950 space-y-1">
                <span className="font-bold block text-[11px] flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> AI Root Cause Insight:
                </span>
                <p className="text-[11px]">
                  "71% of drainage blockages occur following rain &gt;15mm/hr. Repeated surface clearing fails due to deeper silt accumulation."
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 order-1 lg:order-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans">
              Civic Issue Intelligence & Prevention
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Detect recurring infrastructure failures instead of treating symptoms repeatedly. NammaDhwani aggregates grievance history across geographic nodes to identify assets requiring capital upgrade rather than quick surface patches.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Automatic asset recurrence detection</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Root-cause hypothesis generation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Preventive engineering recommendations</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Feature C: Multilingual & Accessible */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Globe2 className="w-5 h-5" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans">
              Multilingual & Voice-First Input
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Break language and literacy barriers. Citizens can speak or type in English, Hindi, Kannada, Tamil, Telugu, Bengali, or Marathi. AI parses speech transcripts, extracts grievance context, and maps it to municipal departments.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Mic className="w-4 h-4 text-rose-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-800">Voice Input in Kannada / Hindi</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block">SPEECH TRANSCRIPTION</span>
              <p className="text-slate-800 font-medium font-sans">
                "नजदीक के ड्रेन में कचरा जमा हो गया है और पानी रास्ते पर आ रहा है..."
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl text-xs space-y-1 border border-blue-200">
              <span className="text-[10px] text-blue-600 font-bold block">AI PARSED RESULT</span>
              <p className="text-slate-900 font-bold font-sans">Category: Drainage (Critical)</p>
              <p className="text-slate-600 text-[11px]">Suggested Department: Stormwater & Drainage Dept</p>
            </div>
          </div>
        </div>

      </div>

      {/* CTA */}
      <div className="text-center pt-8">
        <button
          onClick={() => navigate('/get-started')}
          className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg transition-colors cursor-pointer"
        >
          Start Using NammaDhwani Today →
        </button>
      </div>
    </div>
  );
};
