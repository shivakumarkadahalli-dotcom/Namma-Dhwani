import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export const CitizenNotificationsPage: React.FC = () => {
  const { notifications, markNotificationRead, navigate } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      <div className="bg-white border-b border-slate-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-extrabold text-slate-900 font-sans">Activity & Status Alerts</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time status updates, AI verification alerts, and officer dispatch notifications.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No notifications at this time.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  markNotificationRead(n.id);
                  if (n.linkUrl) navigate(n.linkUrl);
                }}
                className={`p-5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-4 ${
                  !n.read ? 'bg-blue-50/40' : ''
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 font-sans">{n.title}</h4>
                    <span className="text-[10px] text-slate-400">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">{n.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
