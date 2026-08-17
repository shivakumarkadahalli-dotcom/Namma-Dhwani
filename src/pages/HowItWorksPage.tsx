import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  MapPin, 
  FileSearch, 
  Layers, 
  Wrench, 
  ShieldCheck, 
  Sparkles, 
  ArrowDown, 
  CheckCircle2, 
  Bot 
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const { navigate, t } = useApp();

  const steps = [
    {
      num: '1',
      title: 'Report Grievance',
      subtitle: 'Citizen Input',
      desc: 'Citizen reports an issue via text, voice speech, or photo/video with auto-captured GPS coordinates in any of 7 regional languages.',
      icon: <MapPin className="w-6 h-6 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200',
    },
    {
      num: '2',
      title: 'Understand & Classify',
      subtitle: 'AI Parsing',
      desc: 'AI interprets the citizen report, extracts category (Roads, Drainage, Water, Waste), assesses severity level (Low to Critical), and calculates priority score.',
      icon: <FileSearch className="w-6 h-6 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-200',
    },
    {
      num: '3',
      title: 'Route to Department',
      subtitle: 'Intelligent SLA Triage',
      desc: 'The complaint is routed directly to the appropriate municipal department officer queue with SLA cutoffs and community duplicate clustering.',
      icon: <Layers className="w-6 h-6 text-amber-600" />,
      color: 'bg-amber-50 border-amber-200',
    },
    {
      num: '4',
      title: 'Field Resolution',
      subtitle: 'Officer Action',
      desc: 'Municipal field crew resolves the issue on-site and uploads before/after completion evidence photos through the officer portal.',
      icon: <Wrench className="w-6 h-6 text-purple-600" />,
      color: 'bg-purple-50 border-purple-200',
    },
    {
      num: '5',
      title: 'Verify Resolution',
      subtitle: 'AI Evidence Check & Citizen Feedback',
      desc: 'AI compares before/after photos, verifies location match, and sends confirmation prompt to the citizen (Fully Fixed / Partially Fixed / Not Fixed).',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-200',
    },
    {
      num: '6',
      title: 'Learn & Prevent',
      subtitle: 'Civic Intelligence Loop',
      desc: 'NammaDhwani analyzes recurring complaint clusters at the asset level to flag systemic failures and recommend preventive capital infrastructure repairs.',
      icon: <Sparkles className="w-6 h-6 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      {/* Hero */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Closed-Loop System Architecture
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-sans">
            How NammaDhwani Works
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            A step-by-step breakdown of how AI transforms citizen reports into verified resolutions and preventive civic action.
          </p>
        </div>
      </section>

      {/* Vertical Timeline */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        {steps.map((step, idx) => (
          <div key={idx} className="relative">
            <div className={`p-6 rounded-2xl border ${step.color} bg-white shadow-xs flex flex-col md:flex-row items-start md:items-center gap-6`}>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                {step.icon}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Step {step.num}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-semibold text-blue-600">{step.subtitle}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-sans">{step.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">{step.desc}</p>
              </div>
            </div>

            {idx < steps.length - 1 && (
              <div className="flex justify-center my-3 text-slate-300">
                <ArrowDown className="w-5 h-5 animate-bounce" />
              </div>
            )}
          </div>
        ))}

        {/* CTA */}
        <div className="text-center pt-8">
          <button
            onClick={() => navigate('/get-started')}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg transition-colors cursor-pointer"
          >
            Experience NammaDhwani Now →
          </button>
        </div>
      </div>
    </div>
  );
};
