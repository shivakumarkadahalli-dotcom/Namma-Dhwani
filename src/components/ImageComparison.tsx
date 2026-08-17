import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, ImageOff, Clock, Camera } from 'lucide-react';
import { VerificationResult, CitizenVerificationStatus } from '../types';

interface ImageComparisonProps {
  beforeImages?: string[];
  citizenEvidenceImage?: string | null;
  officerEvidenceImage?: string | null;
  verification?: VerificationResult;
  resolutionNotes?: string;
  citizenVerificationStatus?: CitizenVerificationStatus;
  onCitizenConfirm?: (feedback: 'fully_fixed' | 'partially_fixed' | 'not_fixed', notes?: string) => void;
  isOfficerMode?: boolean;
}

export const ImageComparison: React.FC<ImageComparisonProps> = ({
  beforeImages = [],
  citizenEvidenceImage,
  officerEvidenceImage,
  verification,
  resolutionNotes,
  citizenVerificationStatus,
  onCitizenConfirm,
  isOfficerMode = false,
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [activeTab, setActiveTab] = useState<'side_by_side' | 'slider'>('side_by_side');
  const [rebuttalNotes, setRebuttalNotes] = useState('');
  const [showRebuttalInput, setShowRebuttalInput] = useState(false);

  // Derive genuine before and after image URLs
  const beforeUrl = citizenEvidenceImage || (beforeImages && beforeImages.length > 0 ? beforeImages[0] : null);
  const afterUrl = officerEvidenceImage || verification?.afterImageUrl || null;

  const hasBothImages = Boolean(beforeUrl && afterUrl);

  const effectiveVerificationStatus = citizenVerificationStatus || (
    verification?.citizenFeedback === 'fully_fixed' ? 'FULLY_FIXED' :
    verification?.citizenFeedback === 'partially_fixed' ? 'PARTIALLY_FIXED' :
    verification?.citizenFeedback === 'not_fixed' ? 'STILL_NOT_FIXED' : null
  );

  const isAlreadyVerified = effectiveVerificationStatus !== null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-900 text-sm font-sans flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            AI Evidence & Verification Comparison
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare reported issue before resolution vs officer completed work photos
          </p>
        </div>

        {/* View Mode Toggle */}
        {hasBothImages && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0">
            <button
              onClick={() => setActiveTab('side_by_side')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'side_by_side' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setActiveTab('slider')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'slider' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Interactive Overlay
            </button>
          </div>
        )}
      </div>

      {/* Side-by-Side View */}
      {(activeTab === 'side_by_side' || !hasBothImages) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Before Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Before (Reported Issue)</span>
              <span className="text-[10px] text-slate-400 font-medium">Citizen Evidence</span>
            </div>
            {beforeUrl ? (
              <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative group">
                <img src={beforeUrl} alt="Citizen Evidence" className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold rounded-md">
                  ORIGINAL CITIZEN EVIDENCE
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-slate-50 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-4 space-y-1">
                <ImageOff className="w-8 h-8 text-slate-400" />
                <p className="text-xs font-semibold text-slate-700">No evidence uploaded</p>
                <p className="text-[11px] text-slate-400">No photo was attached during initial report</p>
              </div>
            )}
          </div>

          {/* After Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">After (Officer Evidence)</span>
              <span className="text-[10px] text-emerald-600 font-medium">Field Resolution Proof</span>
            </div>
            {afterUrl ? (
              <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative group">
                <img src={afterUrl} alt="Officer Resolution Evidence" className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 px-2 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-md">
                  OFFICER RESOLUTION PROOF
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-slate-50 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-4 space-y-1.5">
                <Clock className="w-8 h-8 text-amber-500" />
                <p className="text-xs font-bold text-slate-700">Evidence not yet uploaded by assigned officer</p>
                <p className="text-[11px] text-slate-500 max-w-xs">Resolution photo will be uploaded once field crew inspects and completes the repair.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Interactive Overlay Slider */}
      {activeTab === 'slider' && hasBothImages && (
        <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 select-none">
          <img src={afterUrl!} alt="After Work" className="absolute inset-0 w-full h-full object-cover" />
          
          <div
            className="absolute inset-y-0 left-0 overflow-hidden"
            style={{ width: `${sliderPos}%` }}
          >
            <img
              src={beforeUrl!}
              alt="Before Work"
              className="absolute inset-0 max-w-none h-full object-cover"
              style={{ width: '100%', height: '100%' }}
            />
          </div>

          {/* Slider Line */}
          <div
            className="absolute inset-y-0 w-1 bg-white shadow-lg cursor-ew-resize flex items-center justify-center z-20"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="w-7 h-7 bg-white rounded-full shadow-md border border-slate-300 flex items-center justify-center text-slate-700 text-xs font-bold">
              ↔
            </div>
          </div>

          {/* Range Input Overlay */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
          />

          <div className="absolute top-3 left-3 bg-black/60 text-white px-2.5 py-1 rounded-md text-[10px] font-bold">
            BEFORE ({sliderPos}%)
          </div>
          <div className="absolute top-3 right-3 bg-emerald-600 text-white px-2.5 py-1 rounded-md text-[10px] font-bold">
            AFTER ({100 - sliderPos}%)
          </div>
        </div>
      )}

      {/* Officer Resolution Notes */}
      {typeof resolutionNotes === 'string' && resolutionNotes.trim() !== '' && (
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Officer Resolution Notes:</span>
          <p className="text-slate-800 leading-relaxed font-sans">{resolutionNotes}</p>
        </div>
      )}

      {/* Citizen Confirmation Status Banner */}
      {isAlreadyVerified && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 ${
          effectiveVerificationStatus === 'FULLY_FIXED'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
            : effectiveVerificationStatus === 'PARTIALLY_FIXED'
            ? 'bg-amber-50 border-amber-200 text-amber-950'
            : 'bg-rose-50 border-rose-200 text-rose-950'
        }`}>
          {effectiveVerificationStatus === 'FULLY_FIXED' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
          {effectiveVerificationStatus === 'PARTIALLY_FIXED' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
          {effectiveVerificationStatus === 'STILL_NOT_FIXED' && <RefreshCw className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}

          <div className="flex-1 min-w-0 text-xs">
            <span className="font-bold uppercase tracking-wider block">
              Citizen Confirmation Logged: {
                effectiveVerificationStatus === 'FULLY_FIXED' ? 'Fully Fixed' :
                effectiveVerificationStatus === 'PARTIALLY_FIXED' ? 'Partially Fixed' :
                'Still Not Fixed'
              }
            </span>
            <p className="mt-1 opacity-90 leading-relaxed">
              {effectiveVerificationStatus === 'FULLY_FIXED' && 'Thank you! You confirmed this grievance is fully resolved.'}
              {effectiveVerificationStatus === 'PARTIALLY_FIXED' && 'Your feedback for partial resolution has been recorded for municipal follow-up.'}
              {effectiveVerificationStatus === 'STILL_NOT_FIXED' && 'This issue has been reopened and escalated back to the municipal team.'}
            </p>
            {verification?.citizenRebuttalNotes && (
              <p className="mt-1.5 font-medium bg-white/80 p-2 rounded-lg border border-current/20">
                Citizen Feedback: {verification.citizenRebuttalNotes}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Citizen Feedback Controls: Only rendered when officer evidence exists and not yet verified */}
      {!isOfficerMode && (
        <div className="pt-3 border-t border-slate-100">
          {!afterUrl ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3 text-xs text-slate-600">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Awaiting officer resolution evidence. Citizen verification buttons will appear after evidence is uploaded.</span>
            </div>
          ) : !isAlreadyVerified && onCitizenConfirm ? (
            <div className="space-y-3">
              <span className="font-bold text-xs text-slate-900 block font-sans">
                Citizen Confirmation: Has this grievance been fixed to your satisfaction?
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowRebuttalInput(false);
                    onCitizenConfirm('fully_fixed');
                  }}
                  className="px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> ✅ Fully Fixed
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onCitizenConfirm('partially_fixed', rebuttalNotes || 'Citizen reported work partially complete');
                  }}
                  className="px-3 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4" /> ⚠️ Partially Fixed
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowRebuttalInput(true);
                    if (rebuttalNotes.trim()) {
                      onCitizenConfirm('not_fixed', rebuttalNotes);
                    } else {
                      onCitizenConfirm('not_fixed', 'Citizen reported issue is still not fixed');
                    }
                  }}
                  className="px-3 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> ❌ Still Not Fixed
                </button>
              </div>

              {showRebuttalInput && (
                <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl space-y-2 text-xs">
                  <span className="font-bold text-rose-900 block">Provide Feedback Details (Optional)</span>
                  <textarea
                    value={rebuttalNotes}
                    onChange={(e) => setRebuttalNotes(e.target.value)}
                    placeholder="Describe why the issue is still unresolved or what part remains unfixed..."
                    className="w-full p-2.5 bg-white border border-rose-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRebuttalInput(false)}
                      className="px-3 py-1.5 bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        onCitizenConfirm('not_fixed', rebuttalNotes || 'Citizen reported issue still not fixed');
                        setShowRebuttalInput(false);
                      }}
                      className="px-4 py-1.5 bg-rose-600 text-white font-bold rounded-lg text-xs hover:bg-rose-700 cursor-pointer"
                    >
                      Submit & Reopen
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
