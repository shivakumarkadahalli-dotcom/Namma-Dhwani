import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, AlertTriangle, Bell, CheckCircle2 } from 'lucide-react';

export const AdminAlertsPage: React.FC = () => {
  const { notifications, navigate } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto space-y-2">
          <span className="px-3 py-1 bg-rose-500/20 text-rose-300 text-xs font-bold rounded-full border border-rose-500/30">
            System Operational Alerts
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-sans">
            Critical Alerts & SLA Breaches
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time monitoring of complaint volume surges, verification failures, and municipal SLA delays.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-4">
        
        <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl flex items-start gap-4">
          <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-rose-950 text-sm font-sans">Water Supply Surge in Ward 18</h3>
            <p className="text-xs text-rose-800 leading-relaxed">
              14 new complaints logged in the past 3 hours following main line valve pressure drop on 100 Feet Road.
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-amber-950 text-sm font-sans">SLA Target Breach Risk — Stormwater Drainage</h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              3 tickets have &lt; 6 hours remaining before SLA target expiration. Dispatched warning to officer queue.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-sans">System Telemetry Log</h3>
          <div className="divide-y divide-slate-100 text-xs text-slate-600 space-y-3 pt-1">
            <p className="pt-2">🟢 Vision AI API Latency: 420ms (Normal)</p>
            <p className="pt-2">🟢 Leaflet GIS Tile Server: 100% Uptime</p>
            <p className="pt-2">🟢 Multilingual Translation Engine: 7/7 Regional languages operational</p>
          </div>
        </div>

      </div>
    </div>
  );
};
