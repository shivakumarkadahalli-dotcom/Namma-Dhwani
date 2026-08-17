import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Globe2, 
  Users, 
  ArrowRight, 
  AlertCircle, 
  Layers, 
  MapPin, 
  FileSearch, 
  Wrench, 
  BarChart3, 
  Bot,
  MessageSquare,
  Cpu,
  CheckCircle2,
  FileEdit,
  Play
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigate } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eaf3ff] via-[#f1f7ff] to-white text-slate-900 pt-8 pb-14 md:pt-12 md:pb-18 border-b border-blue-100/80">
        {/* Subtle background ambiance */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(191,219,254,0.35),transparent_70%)] pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left Column Copy */}
            <div className="lg:col-span-6 space-y-5 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-200/90 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>AI-POWERED • TRANSPARENT • ACCOUNTABLE</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] xl:text-[46px] font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                From Complaints to Prevention —<br />
                <span className="text-blue-600 block mt-1">AI-Powered Civic Intelligence</span>
              </h1>

              {/* Supporting Text */}
              <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Report civic issues in any language. Our AI verifies resolution evidence, detects recurring infrastructure failures, and helps build a better, safer Bengaluru.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-1">
                <button
                  onClick={() => navigate('/citizen/lodge')}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <FileEdit className="w-4 h-4" />
                  <span>Report an Issue</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/how-it-works')}
                  className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-blue-50/60 text-blue-700 border border-blue-200 font-bold text-sm rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                  <span>See How It Works</span>
                </button>
              </div>

              {/* Quick Sub-feature steps (Report Issues, AI Classifies & Routes, Track Progress, Verify Resolution) */}
              <div className="pt-5 grid grid-cols-4 gap-2 border-t border-blue-100/80 max-w-lg mx-auto lg:mx-0">
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-1">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 leading-tight">Report Issues</span>
                </div>

                <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-1">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 leading-tight">AI Classifies & Routes</span>
                </div>

                <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-1">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 leading-tight">Track Progress</span>
                </div>

                <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-1">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 leading-tight">Verify Resolution</span>
                </div>
              </div>

            </div>

            {/* Right Column Visual — Bengaluru Civic Intelligence Landmark & AI Network */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-lg lg:max-w-none rounded-2xl overflow-hidden shadow-xl border border-blue-100/90 bg-white/90">
                
                {/* Background Civic Landmark Architecture */}
                <div className="relative aspect-[16/10] sm:aspect-[16/10] w-full overflow-hidden bg-slate-100">
                  <img 
                    src="/images/vidhana_soudha_hero.jpg" 
                    alt="Bengaluru Vidhana Soudha Civic Intelligence Hub" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center transform hover:scale-102 transition-transform duration-700"
                  />
                  
                  {/* Daylight Sky Soft Overlay & Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 via-transparent to-sky-100/20 pointer-events-none" />
                  
                  {/* AI Connection Arc Overlay (SVG) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 320">
                    <defs>
                      <linearGradient id="civicBlueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                        <stop offset="50%" stopColor="#2563eb" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.6" />
                      </linearGradient>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Sweeping Connection Arcs */}
                    <path 
                      d="M 60 140 Q 160 50, 270 90 T 440 120" 
                      fill="none" 
                      stroke="url(#civicBlueGradient)" 
                      strokeWidth="2.2" 
                      strokeDasharray="4 4"
                      className="opacity-75"
                    />
                    <path 
                      d="M 80 180 Q 250 20, 420 130" 
                      fill="none" 
                      stroke="#ffffff" 
                      strokeWidth="1.8" 
                      strokeDasharray="3 3"
                      className="opacity-70"
                    />
                    <path 
                      d="M 120 220 Q 250 140, 380 200" 
                      fill="none" 
                      stroke="#93c5fd" 
                      strokeWidth="1.5" 
                      className="opacity-60"
                    />

                    {/* Pulsing Grid Points */}
                    <circle cx="160" cy="90" r="3.5" fill="#38bdf8" filter="url(#glow)" />
                    <circle cx="270" cy="90" r="4.5" fill="#2563eb" filter="url(#glow)" />
                    <circle cx="370" cy="100" r="3.5" fill="#60a5fa" filter="url(#glow)" />
                    <circle cx="210" cy="180" r="3" fill="#ffffff" />
                  </svg>

                  {/* Node 1: Grievance/Report Node (Top Left) */}
                  <div className="absolute top-[16%] left-[12%] transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-10 h-10 rounded-full bg-white/90 border-2 border-blue-400 shadow-lg shadow-blue-500/20 backdrop-blur-md flex items-center justify-center text-blue-600 hover:scale-110 transition-transform">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Node 2: AI Neural Classification & Routing Node (Center Top) */}
                  <div className="absolute top-[28%] left-[28%] transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-11 h-11 rounded-full bg-blue-600 border-2 border-white shadow-xl shadow-blue-600/30 backdrop-blur-md flex items-center justify-center text-white hover:scale-110 transition-transform">
                      <Cpu className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Node 3: Verification Shield Node (Top Right) */}
                  <div className="absolute top-[24%] right-[22%] transform translate-x-1/2 -translate-y-1/2">
                    <div className="w-11 h-11 rounded-full bg-white/95 border-2 border-blue-500 shadow-xl shadow-blue-500/25 backdrop-blur-md flex items-center justify-center text-blue-600 hover:scale-110 transition-transform">
                      <ShieldCheck className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>

                  {/* Node 4: Analytics & Telemetry Node (Far Right) */}
                  <div className="absolute top-[38%] right-[8%] transform translate-x-1/2 -translate-y-1/2">
                    <div className="w-9 h-9 rounded-full bg-blue-50/90 border border-blue-300 shadow-md backdrop-blur-md flex items-center justify-center text-blue-700 hover:scale-110 transition-transform">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Location Pin Indicator (Bottom Center) */}
                  <div className="absolute bottom-[18%] left-[48%] transform -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-slate-900/80 text-white rounded-full text-[11px] font-semibold backdrop-blur-md border border-white/20 shadow-md">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>Bengaluru Municipal Network</span>
                  </div>

                </div>

                {/* Sub-card footer: Live AI Governance Status */}
                <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between text-xs border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="font-semibold text-slate-200 text-[11px]">NammaDhwani Civic Intelligence Hub</span>
                  </div>
                  <span className="text-[10px] font-mono text-blue-300 bg-blue-900/60 px-2 py-0.5 rounded border border-blue-700/50">
                    BBMP & Municipal Wards Active
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PROBLEM STATEMENT SECTION */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 font-sans">The Challenge</h2>
            <p className="text-3xl font-extrabold text-slate-900 font-sans mt-2">
              Why Traditional Civic Complaint Systems Break Down
            </p>
            <p className="text-slate-600 text-sm mt-3">
              Most municipal portals collect complaints, but lack verification, feedback loops, and intelligence to fix underlying infrastructure issues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200/80 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-sans">Citizens Struggle to Report</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Language barriers, complex municipal category drop-downs, lack of GPS auto-tagging, and zero visibility after filing a grievance.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200/80 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-sans">Officers Overwhelmed</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Manual triage, unprioritized ticket backlogs, lack of SLA risk alerts, and reliance on unverified 'Resolved' status button clicks.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200/80 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-sans">Recurring Issues Unnoticed</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                The same pothole or drainage segment fails 10 times a year. Money is wasted on surface quick-fixes instead of preventive capital upgrades.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTION SECTION */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600 font-sans">The NammaDhwani Solution</h2>
            <p className="text-3xl font-extrabold text-slate-900 font-sans mt-2">
              A Complete Closed-Loop Intelligence Platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-sans">AI-Verified Resolution</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                We don't just trust 'Resolved' buttons. AI compares before & after photo evidence, checks GPS consistency, and requests citizen confirmation.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-sans">Civic Issue Intelligence</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Detect recurring infrastructure failures. AI alerts administrators: <em>"17 complaints at this location, 5 reopened. Replace culvert pipe instead of surface desilting."</em>
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-sans">Multilingual & Accessible</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Citizens report grievances in English, Hindi, Kannada, Tamil, Telugu, Bengali, or Marathi via text, voice speech, or photos with auto-GPS.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (6-STEP TIMELINE) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 font-sans">Closed-Loop Workflow</h2>
            <p className="text-3xl font-extrabold text-slate-900 font-sans mt-2">
              How NammaDhwani Works in 6 Steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 relative">
            {[
              { num: '1', title: 'Report', desc: 'Voice, photo, text + auto GPS in 7 languages', icon: <MapPin className="w-5 h-5 text-blue-600" /> },
              { num: '2', title: 'Understand', desc: 'AI extracts category, severity, and summary', icon: <FileSearch className="w-5 h-5 text-emerald-600" /> },
              { num: '3', title: 'Route', desc: 'Auto-routed to ward officer with priority score', icon: <Layers className="w-5 h-5 text-amber-600" /> },
              { num: '4', title: 'Resolve', desc: 'Officer fixes issue and uploads after-photos', icon: <Wrench className="w-5 h-5 text-purple-600" /> },
              { num: '5', title: 'Verify', desc: 'AI verifies evidence + citizen confirms fix', icon: <ShieldCheck className="w-5 h-5 text-emerald-600" /> },
              { num: '6', title: 'Learn & Prevent', desc: 'AI detects recurring patterns & advises capital plan', icon: <Sparkles className="w-5 h-5 text-blue-600" /> },
            ].map((step, idx) => (
              <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center space-y-3 relative">
                <div className="w-10 h-10 rounded-full bg-white border-2 border-blue-600 text-blue-600 font-bold flex items-center justify-center mx-auto text-sm shadow-xs">
                  {step.num}
                </div>
                <h4 className="font-bold text-slate-900 text-sm font-sans">{step.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-700 to-indigo-800 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-sans">
            Ready to Transform Civic Governance in Your City?
          </h2>
          <p className="text-blue-100 text-sm max-w-2xl mx-auto leading-relaxed">
            Join thousands of active citizens, officers, and municipal administrators building accountable, data-driven communities with NammaDhwani.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/get-started')}
              className="px-8 py-3.5 bg-white text-blue-700 font-bold text-sm rounded-xl hover:bg-blue-50 shadow-lg transition-colors cursor-pointer"
            >
              Get Started Free
            </button>
            <button
              onClick={() => navigate('/features')}
              className="px-8 py-3.5 bg-blue-800/60 text-white border border-blue-400/40 font-semibold text-sm rounded-xl hover:bg-blue-800 transition-colors cursor-pointer"
            >
              Explore All Features
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
