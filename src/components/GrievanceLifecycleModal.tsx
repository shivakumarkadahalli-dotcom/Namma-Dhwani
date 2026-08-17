import React from 'react';
import { Complaint } from '../types';
import { 
  X, 
  Sparkles, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  UserCheck, 
  AlertTriangle, 
  Repeat, 
  Calendar, 
  Camera, 
  ArrowRight,
  Building2,
  Phone,
  FileCheck
} from 'lucide-react';

interface GrievanceLifecycleModalProps {
  complaint: Complaint | null;
  onClose: () => void;
}

export const GrievanceLifecycleModal: React.FC<GrievanceLifecycleModalProps> = ({
  complaint,
  onClose,
}) => {
  if (!complaint) return null;

  const isSlaBreached = complaint.slaStatus === 'Breached';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-extrabold text-sm text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-md border border-blue-200">
                {complaint.id}
              </span>
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                complaint.status === 'Resolved' || complaint.status === 'Closed'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : complaint.status === 'Reopened'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {complaint.status}
              </span>
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                isSlaBreached 
                  ? 'bg-rose-600 text-white shadow-xs' 
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              }`}>
                {isSlaBreached ? '⚠️ SLA BREACHED' : '⏱️ WITHIN SLA'}
              </span>
              {complaint.reopened && (
                <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 flex items-center gap-1">
                  <Repeat className="w-3 h-3" /> Reopened ({complaint.reopenCount || 1}x)
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 pt-1">
              {complaint.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Department</span>
              <span className="font-bold text-slate-900">{complaint.department}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Category</span>
              <span className="font-bold text-slate-800">{complaint.category}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Ward & Location</span>
              <span className="font-bold text-slate-800">{complaint.location.ward}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Citizen</span>
              <span className="font-bold text-slate-900">{complaint.citizenName || 'Verified Citizen'}</span>
            </div>
          </div>

          {/* Description & Citizen Photos */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Citizen Grievance Description</h3>
            <p className="text-sm text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
              {complaint.description}
            </p>
            {complaint.photos && complaint.photos.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-500 block mb-1.5">Submitted Field Photographs ({complaint.photos.length})</span>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {complaint.photos.map((p, idx) => (
                    <img
                      key={idx}
                      src={p}
                      alt="Grievance photo"
                      className="w-24 h-24 object-cover rounded-lg border border-slate-200 shrink-0"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Explainable AI Officer Routing Card */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-blue-900 text-xs">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Explainable AI Automated Assignment & Routing</span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-200/80 text-blue-800 rounded-md">
                Confidence: {Math.round(complaint.priorityScore)}%
              </span>
            </div>
            
            <p className="text-xs text-blue-950 leading-relaxed">
              {complaint.assignmentRoutingReason || `Automatically routed to ${complaint.department} department based on classification, assigned to ${complaint.assignedOfficerName || 'Ward Officer'} based on active duty and jurisdictional ward availability.`}
            </p>

            <div className="pt-2 border-t border-blue-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center">
                  👤
                </div>
                <div>
                  <span className="font-bold text-slate-900">{complaint.assignedOfficerName || 'Unassigned'}</span>
                  <span className="text-slate-500 text-[11px] block">{complaint.assignedOfficerDesignation || 'Municipal Officer'}</span>
                </div>
              </div>

              {complaint.recurringAssetId && (
                <div className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold">
                  🔗 Linked Recurring Asset: {complaint.recurringAssetId}
                </div>
              )}
            </div>
          </div>

          {/* Longitudinal Audit Trail & Lifecycle Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Longitudinal Municipal Audit Trail ({complaint.timeline?.length || 0} Events)
            </h3>
            
            <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
              {(complaint.timeline || []).map((ev, idx) => (
                <div key={idx} className="relative flex items-start gap-3 pl-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white text-[10px] font-bold z-10 ${
                    ev.status === 'completed'
                      ? 'bg-emerald-600'
                      : ev.status === 'current'
                      ? 'bg-blue-600'
                      : 'bg-slate-400'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{ev.title || ev.status}</span>
                      <span className="text-[10px] text-slate-400">{ev.timestamp}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{ev.description}</p>
                    {(ev.actor || (ev as any).officerName) && (
                      <span className="text-[11px] text-slate-500 block font-medium">
                        Officer: {ev.actor || (ev as any).officerName}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Created: {new Date(complaint.createdAt).toLocaleString()}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close Case View
          </button>
        </div>

      </div>
    </div>
  );
};
