import React from 'react';
import { useApp } from '../context/AppContext';
import { MapComponent } from '../components/MapComponent';
import { ImageComparison } from '../components/ImageComparison';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Heart, 
  Share2,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export const CitizenComplaintDetail: React.FC = () => {
  const { navigate, complaints, confirmResolution, supportComplaint, showToast, t } = useApp();

  // Extract ID from path
  const pathParts = window.location.pathname.split('/');
  const complaintId = pathParts[pathParts.length - 1];

  const complaint = complaints.find(c => c.id === complaintId) || complaints[0];

  if (!complaint) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-slate-600">Grievance not found.</p>
        <button onClick={() => navigate('/citizen/dashboard')} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleCitizenConfirmFix = (feedback: 'fully_fixed' | 'partially_fixed' | 'not_fixed', notes?: string) => {
    try {
      confirmResolution(complaint.id, feedback, notes);
    } catch (err) {
      console.error('Resolution confirmation error:', err);
      showToast('Action Failed', 'Something went wrong while recording your response. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      
      {/* Top Header Navigation */}
      <div className="bg-white border-b border-slate-200 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => navigate('/citizen/dashboard')}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Complaints</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                supportComplaint(complaint.id);
                showToast('Community Support Logged', 'Your support increases priority weight', 'info');
              }}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 flex items-center gap-1.5 cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 text-blue-600 fill-blue-600/20" />
              <span>Support Issue ({complaint.citizensAffected})</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Main Title Header */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                {complaint.id}
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-bold text-slate-700">{complaint.category}</span>
              <span className="text-slate-300">•</span>
              <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-bold">{complaint.department}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                complaint.status === 'Resolved' || complaint.status === 'Closed' ? 'bg-emerald-100 text-emerald-800' :
                complaint.status === 'Partially Resolved' ? 'bg-amber-100 text-amber-800' :
                complaint.status === 'Reopened' || complaint.status === 'Verification Failed' ? 'bg-rose-100 text-rose-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {complaint.status}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                Priority Score: {complaint.priorityScore}/100
              </span>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-sans">
            {complaint.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
            {complaint.description}
          </p>

          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{complaint.location.address}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Reported on {new Date(complaint.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>SLA Target: {complaint.slaHours || 48} hrs</span>
            </div>
          </div>
        </div>

        {/* Grid: Left Detailed Comparison & Gallery, Right Map & Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (8 cols): Evidence Comparison */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* AI Evidence & Resolution Comparison Card */}
            <ImageComparison
              beforeImages={complaint.beforeImages}
              citizenEvidenceImage={complaint.citizenEvidenceImage || (complaint.beforeImages && complaint.beforeImages[0])}
              officerEvidenceImage={complaint.officerEvidenceImage || complaint.verification?.afterImageUrl}
              verification={complaint.verification}
              resolutionNotes={complaint.officerResolutionNote || complaint.resolutionNotes}
              citizenVerificationStatus={complaint.citizenVerificationStatus}
              onCitizenConfirm={handleCitizenConfirmFix}
              isOfficerMode={false}
            />

            {/* Recurring Asset Alert Banner if Applicable */}
            {complaint.isRecurring && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Recurring Infrastructure Failure Detected</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  NammaDhwani AI identified that this location has experienced {complaint.recurringCount} complaints in 12 months. Municipal engineering team has been notified for capital drain overhaul.
                </p>
              </div>
            )}

          </div>

          {/* Right Column (4 cols): GIS Location Map & Timeline */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Location Map */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 font-sans uppercase tracking-wider">
                  GIS Location Pin
                </h3>
                <span className="text-[10px] text-slate-500">{complaint.location.ward}</span>
              </div>
              <MapComponent
                complaints={[complaint]}
                center={[complaint.location.lat, complaint.location.lng]}
                zoom={15}
                height="220px"
              />
            </div>

            {/* Status Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 font-sans uppercase tracking-wider">
                Grievance Timeline
              </h3>

              <div className="space-y-4 relative pl-4 border-l-2 border-slate-200">
                {complaint.timeline && complaint.timeline.length > 0 ? (
                  complaint.timeline.map((item, idx) => {
                    let dotColor = 'bg-slate-300';
                    if (item.status === 'completed') dotColor = 'bg-emerald-500';
                    if (item.status === 'current') dotColor = 'bg-blue-600';
                    if (complaint.status === 'Reopened' && idx === complaint.timeline.length - 1) dotColor = 'bg-rose-500';
                    if (complaint.status === 'Partially Resolved' && idx === complaint.timeline.length - 1) dotColor = 'bg-amber-500';

                    return (
                      <div key={idx} className="relative">
                        <div className={`w-2.5 h-2.5 rounded-full ${dotColor} absolute -left-[21px] top-1`} />
                        <span className="text-[10px] font-bold text-slate-400 block">
                          {item.timestamp}
                        </span>
                        <p className="text-xs font-bold text-slate-800 font-sans">{item.title}</p>
                        <p className="text-[11px] text-slate-500">{item.description}</p>
                      </div>
                    );
                  })
                ) : (
                  <div className="relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600 absolute -left-[21px] top-1" />
                    <span className="text-[10px] font-bold text-slate-400 block">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                    <p className="text-xs font-bold text-slate-800 font-sans">Complaint Submitted</p>
                    <p className="text-[11px] text-slate-500">Auto-routed to {complaint.department}</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
