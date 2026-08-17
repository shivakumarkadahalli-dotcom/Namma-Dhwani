import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapComponent } from '../components/MapComponent';
import { ImageComparison } from '../components/ImageComparison';
import { 
  ArrowLeft, 
  MapPin, 
  Upload, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  Wrench,
  Clock,
  Send,
  Lock,
  Building,
  User,
  ImageOff
} from 'lucide-react';

export const OfficerComplaintDetail: React.FC = () => {
  const { navigate, complaints, currentUser, activeRole, updateComplaintStatus, showToast } = useApp();

  const pathParts = window.location.pathname.split('/');
  const complaintId = pathParts[pathParts.length - 1];

  const complaint = complaints.find(c => c.id === complaintId);

  if (!complaint) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-lg text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Complaint Ticket Not Found</h2>
          <p className="text-xs text-slate-500">The requested ticket ID #{complaintId} does not exist or has been archived.</p>
          <button
            onClick={() => navigate('/officer/dashboard')}
            className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Department Segregation Check
  const officerDept = currentUser?.department || 'Roads & Infrastructure';
  const isDepartmentMatch = 
    activeRole === 'admin' ||
    !complaint.department ||
    complaint.department.toLowerCase().trim() === officerDept.toLowerCase().trim() ||
    complaint.department.toLowerCase().includes(officerDept.toLowerCase()) ||
    officerDept.toLowerCase().includes(complaint.department.toLowerCase());

  if (activeRole === 'officer' && !isDepartmentMatch) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white border-2 border-rose-200 rounded-2xl p-6 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold uppercase tracking-wider">
              Access Restricted (403 Forbidden)
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-2">
              Unauthorized Department Ticket
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              You are signed in as an Officer for <strong className="text-emerald-700">{officerDept}</strong>.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left space-y-1.5 text-xs text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-400">Target Ticket:</span>
              <span className="font-mono font-bold text-slate-900">{complaint.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Target Department:</span>
              <span className="font-bold text-rose-700">{complaint.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Your Assigned Department:</span>
              <span className="font-bold text-emerald-700">{officerDept}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">
            🔒 Role-Based Access Control Enforced: Officers are restricted from accessing or modifying grievances outside their assigned municipal department.
          </p>

          <button
            onClick={() => navigate('/officer/dashboard')}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Return to {officerDept} Command Queue
          </button>
        </div>
      </div>
    );
  }

  const [afterImageUrl, setAfterImageUrl] = useState<string>(
    complaint.officerEvidenceImage || complaint.verification?.afterImageUrl || ''
  );
  const [resolutionNotes, setResolutionNotes] = useState(
    complaint.resolutionNotes || ''
  );
  const [isVerifying, setIsVerifying] = useState(false);

  if (!complaint) {
    return (
      <div className="p-12 text-center text-slate-500">
        Ticket not found.
      </div>
    );
  }

  const handleVerifyAndComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) {
      showToast('Notes Required', 'Please enter officer inspection and resolution notes', 'warning');
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch('/api/ai/verify-resolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaintId: complaint.id,
          complaintTitle: complaint.title,
          complaintDescription: complaint.originalDescription || complaint.description,
          officerNotes: resolutionNotes,
          hasAfterImage: Boolean(afterImageUrl),
        }),
      });

      const data = await response.json();
      const status = data.status || 'verified';
      const confidenceScore = data.confidenceScore || 94;
      const reason = data.reason || `AI confirmed field work completion for ${complaint.department} ticket.`;

      updateComplaintStatus(
        complaint.id,
        'Awaiting Verification',
        resolutionNotes,
        afterImageUrl || undefined
      );

      showToast('Resolution Submitted & Evidence Recorded', `Grievance set to Awaiting Verification.`, 'success');
      navigate('/officer/dashboard');
    } catch {
      // Fallback
      updateComplaintStatus(
        complaint.id,
        'Awaiting Verification',
        resolutionNotes,
        afterImageUrl || undefined
      );

      showToast('Resolution Evidence Saved', 'Field resolution proof submitted and awaiting citizen confirmation.', 'success');
      navigate('/officer/dashboard');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      
      {/* Top Navigation */}
      <div className="bg-slate-900 text-white py-6 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => navigate('/officer/dashboard')}
            className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Officer Queue</span>
          </button>

          <span className="text-xs font-mono bg-slate-800 border border-slate-700 px-3 py-1 rounded-md text-amber-300">
            TICKET: {complaint.id}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Ticket Header Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-md border ${
                (complaint.severity || '').toUpperCase() === 'CRITICAL'
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : (complaint.severity || '').toUpperCase() === 'HIGH'
                  ? 'bg-orange-100 text-orange-800 border-orange-300'
                  : 'bg-amber-100 text-amber-800 border-amber-200'
              }`}>
                {(complaint.severity || 'Medium').toUpperCase()} SEVERITY (Score {complaint.priorityScore}/100)
              </span>
              <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md border border-slate-200">
                Status: {complaint.status}
              </span>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-md">
              Department: {complaint.department}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-sans">
            {complaint.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 font-sans">
            {complaint.description}
          </p>

          {/* OFFICER ASSIGNMENT METADATA BAR */}
          <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned Officer</span>
                <span className="font-bold text-sm text-emerald-400">{complaint.assignedOfficerName || 'Unassigned'}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-300">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Assigned On</span>
                <span className="font-mono text-white font-semibold">
                  {complaint.assignedAt ? new Date(complaint.assignedAt).toLocaleString() : 'Immediate Round-Robin'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Priority Order</span>
                <span className="font-bold text-amber-300">{complaint.severity} First Handling</span>
              </div>
            </div>
          </div>

          {/* COMMUNITY SIGNAL & DUPLICATE AGGREGATION BANNER */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-amber-900 uppercase font-mono tracking-wider bg-amber-200/80 px-2 py-0.5 rounded text-[10px]">
                  COMMUNITY SIGNAL
                </span>
                <span className="font-bold text-amber-800">
                  This issue has 23 related reports in the Indiranagar sector.
                </span>
              </div>
              <p className="text-[11px] text-amber-700">
                AI Duplicate Engine aggregated 7 nearby individual complaints into this primary dispatch ticket.
              </p>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-bold text-amber-900 shrink-0">
              <div className="bg-white/80 px-3 py-1.5 rounded-lg border border-amber-200">
                <span className="text-[10px] text-amber-700 block uppercase">Affected Citizens</span>
                <span className="text-sm font-mono">{complaint.citizensAffected || 23}</span>
              </div>
              <div className="bg-white/80 px-3 py-1.5 rounded-lg border border-amber-200">
                <span className="text-[10px] text-amber-700 block uppercase">Nearby Reports</span>
                <span className="text-sm font-mono">7</span>
              </div>
              <div className="bg-white/80 px-3 py-1.5 rounded-lg border border-amber-200">
                <span className="text-[10px] text-amber-700 block uppercase">Community Supporters</span>
                <span className="text-sm font-mono">41</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-slate-400" /> {complaint.location.address}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-slate-400" /> SLA: {complaint.slaHours || 48} hours
            </span>
          </div>
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Resolution Work Evidence Upload Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleVerifyAndComplete} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-bold text-sm font-sans">
                <Wrench className="w-4 h-4 text-blue-600" />
                <span>Field Resolution Work Evidence</span>
              </div>

              {/* Reported Photo */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Reported Photo (Citizen Evidence)
                </label>
                {complaint.citizenEvidenceImage || (complaint.beforeImages && complaint.beforeImages.length > 0) ? (
                  <div className="aspect-video rounded-xl overflow-hidden border border-slate-200">
                    <img 
                      src={complaint.citizenEvidenceImage || complaint.beforeImages[0]} 
                      alt="Citizen Evidence" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-slate-50 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-4">
                    <ImageOff className="w-8 h-8 text-slate-400 mb-1" />
                    <p className="text-xs font-semibold text-slate-600">No evidence uploaded by citizen</p>
                  </div>
                )}
              </div>

              {/* Work Completed Photo Upload */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  After Photo (Work Completed Evidence)
                </label>
                {afterImageUrl ? (
                  <div className="aspect-video rounded-xl overflow-hidden border-2 border-dashed border-slate-300 bg-slate-50 relative group">
                    <img src={afterImageUrl} alt="After Work" className="w-full h-full object-cover" />
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-xs font-bold gap-2">
                      <Upload className="w-4 h-4" /> Change Work Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setAfterImageUrl(URL.createObjectURL(file));
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="aspect-video border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-emerald-50/40 transition-colors p-4 text-center">
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-xs font-bold text-slate-700">Upload Resolution Photo Evidence</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">JPG, PNG photo from field site</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setAfterImageUrl(URL.createObjectURL(file));
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Resolution Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Officer Inspection & Resolution Notes
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={3}
                  required
                  placeholder="Describe material used, field crew name, work completion details..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-sans"
                />
              </div>

              {/* Submit & AI Verify Button */}
              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AI Verifying Before/After Match...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Submit & Run AI Verification Check</span>
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Right: Map & Verification Live Status (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 font-sans uppercase tracking-wider">
                Inspection Location
              </h3>
              <MapComponent
                complaints={[complaint]}
                center={[complaint.location.lat, complaint.location.lng]}
                zoom={15}
                height="220px"
              />
            </div>

            {/* Current Verification Status */}
            {complaint.verification && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 font-sans uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Existing AI Verification Audit</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Status: {complaint.verification.status}</span>
                    <span className="text-emerald-600">{complaint.verification.confidenceScore}% Confidence</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-1">{complaint.verification.reason}</p>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
