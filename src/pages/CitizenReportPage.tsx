import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Language, Category, Complaint, DEPARTMENT_OPTIONS, DepartmentOption, ComplaintCategory } from '../types';
import { SimilarComplaintCard, SimilarComplaintItem } from '../components/SimilarComplaintCard';
import { 
  saveDraft, 
  getAllDrafts, 
  deleteDraft, 
  addToOfflineQueue, 
  GrievanceDraft, 
  getOfflineQueue,
  QueuedComplaint
} from '../utils/draftSyncStore';
import { 
  Sparkles, 
  MapPin, 
  Mic, 
  MicOff, 
  Upload, 
  Image as ImageIcon, 
  AlertTriangle, 
  CheckCircle2, 
  Bot, 
  ArrowRight, 
  RefreshCw,
  Building,
  Save,
  FileText,
  CloudOff,
  Trash2,
  FolderOpen,
  WifiOff,
  RotateCw,
  Clock,
  Check,
  Wifi,
  X,
  Search,
  Navigation
} from 'lucide-react';

const BENGALURU_PRESETS = [
  {
    name: '12th Main Road Junction, Indiranagar, Bengaluru',
    landmark: '12th Main Culvert & Commercial Junction',
    ward: 'Ward 18 - Indiranagar',
    lat: 12.9772,
    lng: 77.6425,
  },
  {
    name: '100 Feet Rd, Indiranagar 1st Stage, Bengaluru 560038',
    landmark: '100ft Road Metro Exit 1',
    ward: 'Ward 18 - Indiranagar',
    lat: 12.9750,
    lng: 77.6380,
  },
  {
    name: 'CMH Road Junction, Indiranagar, Bengaluru 560038',
    landmark: 'Chinmaya Mission Hospital Crossing',
    ward: 'Ward 18 - Indiranagar',
    lat: 12.9790,
    lng: 77.6440,
  },
  {
    name: 'Double Road, Shanthi Nagar, Bengaluru 560027',
    landmark: 'Shanthi Nagar Bus Station Signal',
    ward: 'Ward 112 - Shanthi Nagar',
    lat: 12.9550,
    lng: 77.5920,
  },
  {
    name: '80 Feet Road, 5th Block, Koramangala, Bengaluru 560095',
    landmark: 'Sony World Signal Junction',
    ward: 'Ward 151 - Koramangala',
    lat: 12.9352,
    lng: 77.6245,
  },
  {
    name: 'MG Road Metro Station, Shivaji Nagar, Bengaluru 560001',
    landmark: 'MG Road Boulevard',
    ward: 'Ward 111 - Shantala Nagar',
    lat: 12.9756,
    lng: 77.6066,
  },
  {
    name: 'Commercial Street Entrance, Tasker Town, Bengaluru 560001',
    landmark: 'Commercial St Pedestrian Plaza',
    ward: 'Ward 110 - Sampangirama Nagar',
    lat: 12.9822,
    lng: 77.6083,
  },
  {
    name: 'Outer Ring Road, Bellandur Junction, Bengaluru 560103',
    landmark: 'EcoSpace Flyover Underpass',
    ward: 'Ward 150 - Bellandur',
    lat: 12.9260,
    lng: 77.6762,
  },
  {
    name: 'Whitefield Main Road, Hope Farm Junction, Bengaluru 560066',
    landmark: 'Hope Farm Circle',
    ward: 'Ward 84 - Hagadur',
    lat: 12.9830,
    lng: 77.7510,
  },
];

export const CitizenReportPage: React.FC = () => {
  const { 
    navigate, 
    addComplaint, 
    showToast, 
    language: currentLanguage,
    setLanguage,
    isOnline,
    syncOfflineQueueNow,
    refreshDraftsAndQueue,
    currentUser,
    t
  } = useApp();

  // Form State
  const [reportMethod, setReportMethod] = useState<'text' | 'voice'>('text');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(currentLanguage);
  
  // Natural language raw text input
  const [rawTextInput, setRawTextInput] = useState('');

  // Selected Department (Roads & Infrastructure, Drainage & Stormwater, Waste Management, Street Lighting, Water Supply)
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentOption>('Roads & Infrastructure');
  
  // Voice Recording simulation
  const [isRecording, setIsRecording] = useState(false);
  const [voiceAudioBlob, setVoiceAudioBlob] = useState<string | null>(null);

  // File/Photo Uploads
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  // Location state (Option A: Auto-Detect GPS, Option B: Enter Location Manually)
  const [locationMode, setLocationMode] = useState<'gps' | 'manual'>('gps');
  const [address, setAddress] = useState('100 Feet Rd, Indiranagar 1st Stage, Bengaluru 560038');
  const [ward, setWard] = useState('Ward 18 - Indiranagar');
  const [lat, setLat] = useState(12.9750);
  const [lng, setLng] = useState(77.6380);
  const [isLocating, setIsLocating] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');

  // AI Processing State
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiParsedData, setAiParsedData] = useState<{
    category: Category;
    subcategory: string;
    issueType: string;
    title: string;
    summary: string;
    aiAnalysis: string;
    priorityScore: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    suggestedDepartment: string;
  } | null>(null);

  // Drafts & Offline Queue State
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [savedDrafts, setSavedDrafts] = useState<GrievanceDraft[]>(() => getAllDrafts(currentUser?.id));
  const [offlineQueue, setOfflineQueue] = useState<QueuedComplaint[]>(() => getOfflineQueue());
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [lastAutoSaveText, setLastAutoSaveText] = useState<string | null>(null);

  // Auto-save draft when rawTextInput changes and length > 5
  useEffect(() => {
    if (!rawTextInput.trim() || rawTextInput.trim().length < 5) return;
    const timeout = setTimeout(() => {
      const saved = saveDraft({
        id: activeDraftId || undefined,
        userId: currentUser?.id,
        title: rawTextInput.slice(0, 40) + '...',
        description: rawTextInput,
        category: aiParsedData?.category || 'Roads',
        subcategory: aiParsedData?.subcategory || 'General Issue',
        severity: aiParsedData?.severity || 'MEDIUM',
        department: selectedDepartment,
        address,
        lat,
        lng,
        uploadedPhotos,
        reportMethod,
        language: selectedLanguage,
      });
      if (!activeDraftId) setActiveDraftId(saved.id);
      setSavedDrafts(getAllDrafts(currentUser?.id));
      refreshDraftsAndQueue();
      setLastAutoSaveText(`Auto-saved draft at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    }, 1500);

    return () => clearTimeout(timeout);
  }, [rawTextInput, address, lat, lng, uploadedPhotos, selectedLanguage, activeDraftId, aiParsedData, reportMethod, refreshDraftsAndQueue, currentUser, selectedDepartment]);

  // Manual Save Draft handler
  const handleSaveDraftManual = () => {
    if (!rawTextInput.trim()) {
      showToast('Input Required', 'Please enter a description to save as draft', 'warning');
      return;
    }
    const saved = saveDraft({
      id: activeDraftId || undefined,
      userId: currentUser?.id,
      title: rawTextInput.slice(0, 40) + '...',
      description: rawTextInput,
      category: aiParsedData?.category || 'Roads',
      subcategory: aiParsedData?.subcategory || 'General Issue',
      severity: aiParsedData?.severity || 'MEDIUM',
      department: selectedDepartment,
      address,
      lat,
      lng,
      uploadedPhotos,
      reportMethod,
      language: selectedLanguage,
    });
    setActiveDraftId(saved.id);
    setSavedDrafts(getAllDrafts(currentUser?.id));
    refreshDraftsAndQueue();
    showToast('Draft Saved Offline', 'Your grievance report was saved locally on your device.', 'success');
  };

  // Load a Draft into form
  const handleLoadDraft = (draft: GrievanceDraft) => {
    setActiveDraftId(draft.id);
    setRawTextInput(draft.description);
    setAddress(draft.address);
    setLat(draft.lat);
    setLng(draft.lng);
    setUploadedPhotos(draft.uploadedPhotos || []);
    setReportMethod(draft.reportMethod || 'text');
    if (draft.department && (DEPARTMENT_OPTIONS as readonly string[]).includes(draft.department)) {
      setSelectedDepartment(draft.department as DepartmentOption);
    }
    setSelectedLanguage((draft.language as Language) || currentLanguage);
    setShowDraftsModal(false);
    showToast('Draft Restored', 'Form populated with saved draft details.', 'info');
  };

  // Delete a Draft
  const handleDeleteDraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteDraft(id);
    if (activeDraftId === id) setActiveDraftId(null);
    setSavedDrafts(getAllDrafts(currentUser?.id));
    refreshDraftsAndQueue();
    showToast('Draft Removed', 'Saved draft deleted', 'info');
  };

  // Similar Complaints State
  const [similarComplaintsData, setSimilarComplaintsData] = useState<{
    hasSimilar: boolean;
    similarComplaint: 'Yes' | 'No';
    similarityReason: string;
    similarComplaints: SimilarComplaintItem[];
    clusterInfo?: {
      clusterName: string;
      totalReportsInCluster: number;
      locationsCount: number;
      summary: string;
    };
  } | null>(null);

  // Step state: 1 = Input & Photo, 2 = AI Parsed Review & Similar Check, 3 = Confirmation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Auto detect location on mount if permitted
  React.useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          setAddress(`Live GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
      );
    }
  }, []);

  // Trigger GPS Geolocation
  const handleDetectLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          setAddress(`Live GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
          setIsLocating(false);
          showToast('GPS Location Tagged', 'Accurate device coordinates captured for municipal dispatch', 'info');
        },
        (err) => {
          setIsLocating(false);
          let errMsg = 'Current location unavailable.';
          if (err.code === err.PERMISSION_DENIED) errMsg = 'Location permission was denied. Please enable location access in your browser.';
          if (err.code === err.POSITION_UNAVAILABLE) errMsg = 'Your location could not be determined. Please try again.';
          if (err.code === err.TIMEOUT) errMsg = 'Location detection timed out. Please try again.';
          showToast('Location Detection Failed', errMsg, 'warning');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setIsLocating(false);
      showToast('Not Supported', 'Geolocation is not supported by your browser.', 'error');
    }
  };

  // Toggle Voice Recording
  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setRawTextInput('There is a large pothole and broken water pipe causing flooding near 100 Feet Road exit.');
        showToast('Voice Recorded & Transcribed', 'Speech converted to text via AI Voice Service', 'success');
      }, 3500);
    } else {
      setIsRecording(false);
    }
  };

  // Run AI Parse & Similar Complaints API Call
  const handleAnalyzeWithAI = async () => {
    if (!rawTextInput.trim()) {
      showToast('Input Required', 'Please enter or speak a description of the issue', 'warning');
      return;
    }

    setIsAiProcessing(true);
    try {
      // 1. AI Parse Endpoint Call
      const parseRes = await fetch('/api/ai/parse-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: rawTextInput,
          language: selectedLanguage,
          lat,
          lng,
        }),
      });

      const data = await parseRes.json();
      let parsedDept: DepartmentOption = selectedDepartment;
      let parsedIssueType = 'Civic Infrastructure Problem';
      let parsedCategory: Category = 'Roads';
      let parsedSubcategory = 'General Maintenance';
      let parsedTitle = rawTextInput.slice(0, 50);
      let parsedSummary = rawTextInput;
      let parsedAnalysis = 'AI analysis classified this issue based on root cause.';
      let parsedPriority = 75;
      let parsedSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';

      if (data.department && (DEPARTMENT_OPTIONS as readonly string[]).includes(data.department)) {
        parsedDept = data.department as DepartmentOption;
        setSelectedDepartment(parsedDept);
      }
      if (data.issueType) parsedIssueType = data.issueType;
      if (data.category) parsedCategory = data.category as Category;
      if (data.subcategory) parsedSubcategory = data.subcategory;
      if (data.aiSummary) parsedSummary = data.aiSummary;
      if (data.aiAnalysis) parsedAnalysis = data.aiAnalysis;
      if (data.priorityScore) parsedPriority = data.priorityScore;
      if (data.severity) parsedSeverity = data.severity.toUpperCase() as any;

      setAiParsedData({
        category: parsedCategory,
        subcategory: parsedSubcategory,
        issueType: parsedIssueType,
        title: parsedTitle,
        summary: parsedSummary,
        aiAnalysis: parsedAnalysis,
        priorityScore: parsedPriority,
        severity: parsedSeverity,
        suggestedDepartment: parsedDept,
      });

      // 2. Fetch Similar Complaints using parsed department & issue context
      try {
        const simRes = await fetch('/api/ai/find-similar-complaints', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rawText: rawTextInput,
            category: parsedCategory,
            department: parsedDept,
            lat,
            lng,
          }),
        });
        const simData = await simRes.json();
        setSimilarComplaintsData({
          hasSimilar: !!simData.hasSimilar,
          similarComplaint: simData.hasSimilar ? 'Yes' : 'No',
          similarityReason: simData.similarityReason || (simData.hasSimilar ? 'Matched nearby active grievance.' : `No similar active complaints found in ${parsedDept}.`),
          similarComplaints: simData.similarComplaints || [],
          clusterInfo: simData.clusterDetails,
        });
      } catch {
        setSimilarComplaintsData({
          hasSimilar: false,
          similarComplaint: 'No',
          similarityReason: `No similar active complaints found in ${parsedDept}.`,
          similarComplaints: [],
        });
      }

      setCurrentStep(2);
      showToast('AI Analysis Complete', 'Category, SLA route, and similarity check completed', 'success');
    } catch {
      // Local fallback
      setAiParsedData({
        category: 'Roads',
        subcategory: 'Surface Damage',
        issueType: 'Road Infrastructure Issue',
        title: rawTextInput.slice(0, 50),
        summary: rawTextInput,
        aiAnalysis: 'Grievance parsed and dispatched to designated municipal department.',
        priorityScore: 70,
        severity: 'MEDIUM',
        suggestedDepartment: selectedDepartment,
      });
      setSimilarComplaintsData({
        hasSimilar: false,
        similarComplaint: 'No',
        similarityReason: `No similar active complaints found in ${selectedDepartment}.`,
        similarComplaints: [],
      });
      setCurrentStep(2);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Final Submit Complaint
  const handleSubmitGrievance = () => {
    if (!aiParsedData) return;

    const mappedSeverity = 
      aiParsedData.severity === 'CRITICAL' ? 'Critical' :
      aiParsedData.severity === 'HIGH' ? 'High' :
      aiParsedData.severity === 'MEDIUM' ? 'Medium' : 'Low';

    const complaintData: Partial<Complaint> = {
      title: aiParsedData.title,
      description: rawTextInput,
      originalDescription: rawTextInput,
      issueType: aiParsedData.issueType || 'General Civic Issue',
      category: (aiParsedData.category as ComplaintCategory) || 'Roads',
      subcategory: aiParsedData.subcategory,
      priorityScore: aiParsedData.priorityScore,
      severity: mappedSeverity,
      status: 'Pending',
      location: {
        address,
        lat,
        lng,
        ward: ward || 'Ward 18 - Indiranagar',
      },
      citizenEvidenceImage: uploadedPhotos.length > 0 ? uploadedPhotos[0] : null,
      officerEvidenceImage: null,
      beforeImages: uploadedPhotos,
      aiSummary: aiParsedData.summary,
      slaHours: mappedSeverity === 'Critical' ? 24 : mappedSeverity === 'High' ? 48 : mappedSeverity === 'Medium' ? 48 : 72,
      department: selectedDepartment,
      assignedOfficerName: 'Officer Rajesh Kumar',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      citizensAffected: 1,
      isRecurring: false,
      recurringCount: 1,
    };

    if (!isOnline) {
      // Save directly to offline submission queue
      addToOfflineQueue(complaintData, activeDraftId || undefined);
      if (activeDraftId) {
        deleteDraft(activeDraftId);
        setActiveDraftId(null);
      }
      setSavedDrafts(getAllDrafts());
      setOfflineQueue(getOfflineQueue());
      refreshDraftsAndQueue();
      showToast('Saved to Offline Queue', 'Your grievance report will auto-sync as soon as network returns.', 'success');
      setCurrentStep(3);
      return;
    }

    const created = addComplaint(complaintData);
    if (activeDraftId) {
      deleteDraft(activeDraftId);
      setActiveDraftId(null);
    }
    setSavedDrafts(getAllDrafts());
    refreshDraftsAndQueue();

    showToast('Grievance Successfully Filed!', `Complaint ID ${created.id} assigned to ${aiParsedData.suggestedDepartment}`, 'success');
    navigate('/citizen/dashboard');
  };

  // Queue report offline directly when offline without AI call
  const handleQueueOfflineDirectly = () => {
    if (!rawTextInput.trim()) {
      showToast('Input Required', 'Please enter a description of the issue', 'warning');
      return;
    }

    const complaintData: Partial<Complaint> = {
      title: rawTextInput.slice(0, 45) + (rawTextInput.length > 45 ? '...' : ''),
      description: rawTextInput,
      category: 'Roads',
      subcategory: 'Unclassified (Pending Offline Sync)',
      priorityScore: 70,
      severity: 'Medium',
      status: 'Pending',
      location: {
        address,
        lat,
        lng,
        ward: ward || 'Ward 18 - Indiranagar',
      },
      beforeImages: uploadedPhotos,
      department: selectedDepartment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addToOfflineQueue(complaintData, activeDraftId || undefined);
    if (activeDraftId) {
      deleteDraft(activeDraftId);
      setActiveDraftId(null);
    }
    setSavedDrafts(getAllDrafts());
    setOfflineQueue(getOfflineQueue());
    refreshDraftsAndQueue();

    showToast('Offline Report Saved!', 'Report added to queue. Will automatically submit & classify when online.', 'success');
    setCurrentStep(3);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      {/* Header */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>{t('report.aiBadge', 'Smart AI Complaint Builder')}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-sans">
            {t('report.heading', 'Report a Civic Grievance')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {t('report.subheading', 'Speak or type in your native language. AI will format, prioritize, and route your request.')}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-8">
          
          {/* Offline Mode & Saved Drafts Banner */}
          <div className="space-y-3">
            {!isOnline && (
              <div className="flex items-center justify-between p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                <div className="flex items-center gap-2">
                  <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Offline Mode Active</span>
                    <span className="text-amber-700">You can draft and queue grievance reports locally. They will auto-sync when online.</span>
                  </div>
                </div>
                {offlineQueue.length > 0 && (
                  <span className="px-2 py-1 bg-amber-600 text-white rounded-lg font-bold text-[10px]">
                    {offlineQueue.length} Queued
                  </span>
                )}
              </div>
            )}

            {savedDrafts.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    <strong className="font-bold">{savedDrafts.length} Saved Offline Draft{savedDrafts.length > 1 ? 's' : ''}</strong> available on this device.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDraftsModal(true)}
                  className="px-3 py-1 bg-blue-600 text-white font-bold text-[11px] rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <FolderOpen className="w-3 h-3" />
                  <span>View Drafts</span>
                </button>
              </div>
            )}
          </div>

          {/* Step Indicator */}
          <div className="grid grid-cols-3 gap-2 pb-6 border-b border-slate-100 text-xs font-bold font-sans">
            <div className={`flex items-center gap-2 p-2 rounded-xl ${currentStep === 1 ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-400'}`}>
              <span className="w-6 h-6 rounded-full bg-current/10 flex items-center justify-center shrink-0">1</span>
              <span>{t('report.step1', 'Input & Media')}</span>
            </div>
            <div className={`flex items-center gap-2 p-2 rounded-xl ${currentStep === 2 ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-400'}`}>
              <span className="w-6 h-6 rounded-full bg-current/10 flex items-center justify-center shrink-0">2</span>
              <span>{t('report.step2', 'AI Verification')}</span>
            </div>
            <div className={`flex items-center gap-2 p-2 rounded-xl ${currentStep === 3 ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-400'}`}>
              <span className="w-6 h-6 rounded-full bg-current/10 flex items-center justify-center shrink-0">3</span>
              <span>{t('report.step3', 'Filing Complete')}</span>
            </div>
          </div>

          {/* STEP 1: INPUT FORM */}
          {currentStep === 1 && (
            <div className="space-y-6">
              
              {/* Language Selection */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold text-xs text-slate-800 uppercase block">Input Language</span>
                  <p className="text-[11px] text-slate-500">Report in any regional language; AI auto-translates for officers.</p>
                </div>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as Language)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs bg-white font-medium"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="kn">ಕನ್ನಡ (Kannada)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="te">తెలుగు (Telugu)</option>
                  <option value="bn">বাংলা (Bengali)</option>
                  <option value="mr">मराठी (Marathi)</option>
                </select>
              </div>

              {/* Department Selection */}
              <div className="space-y-2">
                <label htmlFor="department-select" className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {t('report.department', 'Department')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    id="department-select"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value as DepartmentOption)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
                  >
                    {DEPARTMENT_OPTIONS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Input Mode Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Describe the Issue
                  </label>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setReportMethod('text')}
                      className={`px-3 py-1 rounded-md transition-colors ${reportMethod === 'text' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
                    >
                      Text
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportMethod('voice')}
                      className={`px-3 py-1 rounded-md transition-colors ${reportMethod === 'voice' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600'}`}
                    >
                      🎤 Voice
                    </button>
                  </div>
                </div>

                {reportMethod === 'text' ? (
                  <textarea
                    value={rawTextInput}
                    onChange={(e) => setRawTextInput(e.target.value)}
                    rows={4}
                    placeholder="Describe what happened, location landmarks, severity, or hazards (e.g. 'Deep pothole near 100 Feet Road exit causing accidents')..."
                    className="w-full p-4 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-sans"
                  />
                ) : (
                  <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                      {isRecording ? <MicOff className="w-8 h-8 animate-pulse" /> : <Mic className="w-8 h-8" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm font-sans">
                        {isRecording ? 'Listening... Speak clearly now' : 'Click microphone to start voice recording'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Speech transcription powered by AI Audio
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={toggleRecording}
                      className={`px-6 py-2.5 font-bold text-xs rounded-xl text-white shadow-md transition-colors ${
                        isRecording ? 'bg-rose-600 hover:bg-rose-700 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isRecording ? 'Stop Recording' : 'Start Voice Recording'}
                    </button>

                    {rawTextInput && (
                      <div className="bg-white p-3 rounded-xl border text-left text-xs text-slate-800 space-y-1">
                        <span className="font-bold text-emerald-600 uppercase text-[10px]">Transcribed Text:</span>
                        <p>{rawTextInput}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Photo Evidence Upload */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Photo Evidence
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {uploadedPhotos.map((img, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-300 group">
                      <img src={img} alt="Evidence" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded-full text-xs font-bold flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  <label className="aspect-video border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-slate-50 transition-colors">
                    <Upload className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-[10px] font-bold text-slate-600">Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setUploadedPhotos([...uploadedPhotos, url]);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Location Selector (Option A: Auto-Detect GPS vs Option B: Manual Location) */}
              <div className="space-y-4 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Grievance Location
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Specify the location of the civic issue (can be your current spot or reported from elsewhere)
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                    {ward}
                  </span>
                </div>

                {/* Option Selection: Radio Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* OPTION A: AUTO-DETECT GPS */}
                  <label
                    onClick={() => setLocationMode('gps')}
                    className={`relative p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      locationMode === 'gps'
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="locationMode"
                          checked={locationMode === 'gps'}
                          onChange={() => setLocationMode('gps')}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-900 block font-sans">
                            Auto-Detect My GPS
                          </span>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            Uses your current location
                          </span>
                        </div>
                      </div>
                      <MapPin className={`w-4 h-4 ${locationMode === 'gps' ? 'text-blue-600' : 'text-slate-400'}`} />
                    </div>

                    {locationMode === 'gps' && (
                      <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-[11px]">
                        <span className="font-mono text-slate-600 font-medium">
                          📍 {lat.toFixed(4)}, {lng.toFixed(4)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDetectLocation();
                          }}
                          disabled={isLocating}
                          className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                          <span>{isLocating ? 'Locating...' : 'Refresh GPS'}</span>
                        </button>
                      </div>
                    )}
                  </label>

                  {/* OPTION B: ENTER LOCATION MANUALLY */}
                  <label
                    onClick={() => setLocationMode('manual')}
                    className={`relative p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      locationMode === 'manual'
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="locationMode"
                          checked={locationMode === 'manual'}
                          onChange={() => setLocationMode('manual')}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-900 block font-sans">
                            Enter Location Manually
                          </span>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            Search for an area, landmark or address
                          </span>
                        </div>
                      </div>
                      <Search className={`w-4 h-4 ${locationMode === 'manual' ? 'text-blue-600' : 'text-slate-400'}`} />
                    </div>

                    {locationMode === 'manual' && (
                      <div className="pt-2 border-t border-blue-100 text-[11px] text-blue-800 font-medium flex items-center gap-1">
                        <span>Site-specific reporting mode</span>
                      </div>
                    )}
                  </label>
                </div>

                {/* MANUAL LOCATION INPUT & SEARCH PANEL */}
                {locationMode === 'manual' ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3.5 animate-in fade-in duration-200">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Search Landmark / Area
                      </label>
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={locationSearchQuery}
                          onChange={(e) => {
                            const q = e.target.value;
                            setLocationSearchQuery(q);
                            if (q.trim()) {
                              const match = BENGALURU_PRESETS.find(p => 
                                p.name.toLowerCase().includes(q.toLowerCase()) || 
                                p.landmark.toLowerCase().includes(q.toLowerCase())
                              );
                              if (match) {
                                setAddress(match.name);
                                setWard(match.ward);
                                setLat(match.lat);
                                setLng(match.lng);
                              } else {
                                setAddress(q);
                              }
                            }
                          }}
                          placeholder="Search for area or landmark (e.g. 12th Main Road Junction, Indiranagar)..."
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Suggested Quick-Pick Landmark Chips */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Popular Civic Areas & Landmarks:
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                        {BENGALURU_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              setAddress(preset.name);
                              setWard(preset.ward);
                              setLat(preset.lat);
                              setLng(preset.lng);
                              setLocationSearchQuery(preset.name);
                            }}
                            className={`px-2.5 py-1 text-[11px] rounded-lg border text-left transition-colors cursor-pointer ${
                              address === preset.name
                                ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            📍 {preset.landmark}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Editable Address Text Input */}
                    <div className="space-y-1.5 pt-1">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Address of Civic Issue
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAddress(val);
                          const match = BENGALURU_PRESETS.find(p => val.toLowerCase().includes(p.name.toLowerCase()));
                          if (match) {
                            setLat(match.lat);
                            setLng(match.lng);
                            setWard(match.ward);
                          }
                        }}
                        placeholder="Enter full street address (e.g. 12th Main Road Junction, Indiranagar, Bengaluru)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-sans"
                      />
                    </div>

                    {/* Ward & Coordinates Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Ward</label>
                        <input
                          type="text"
                          value={ward}
                          onChange={(e) => setWard(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Latitude</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={lat}
                          onChange={(e) => setLat(parseFloat(e.target.value) || lat)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Longitude</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={lng}
                          onChange={(e) => setLng(parseFloat(e.target.value) || lng)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Selected Location Confirmation Bar */}
                    <div className="bg-blue-50/90 border border-blue-200 rounded-xl p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="text-blue-950 font-medium">
                          <strong>Location Pinned for Dispatch:</strong> {address} ({lat.toFixed(4)}, {lng.toFixed(4)})
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* AUTO-DETECT GPS DISPLAY */
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Detected Current Location
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold">
                        GPS Fixed: {lat.toFixed(4)}, {lng.toFixed(4)}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                )}
              </div>

              {/* Auto-save & Action Buttons */}
              <div className="pt-4 space-y-3">
                {lastAutoSaveText && (
                  <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                    <span className="flex items-center gap-1">
                      <Save className="w-3 h-3 text-slate-400" />
                      {lastAutoSaveText}
                    </span>
                    {activeDraftId && (
                      <span className="text-blue-600 font-medium">Active Draft ID: {activeDraftId.slice(-8)}</span>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleSaveDraftManual}
                    className="sm:w-1/3 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
                  >
                    <Save className="w-4 h-4 text-slate-600" />
                    <span>Save Offline Draft</span>
                  </button>

                  {!isOnline ? (
                    <button
                      type="button"
                      onClick={handleQueueOfflineDirectly}
                      className="flex-1 py-3.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <WifiOff className="w-4 h-4" />
                      <span>Queue Offline Report for Auto-Sync →</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAnalyzeWithAI}
                      disabled={isAiProcessing}
                      className="flex-1 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isAiProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>AI Analyzing & Categorizing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Analyze & Structure with AI →</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* STEP 2: AI REVIEW, DUPLICATE CHECK & CONFIRM */}
          {currentStep === 2 && aiParsedData && (
            <div className="space-y-8">
              
              {/* IF SIMILAR ISSUE DETECTED, SHOW DUPLICATE RESOLUTION CARD FIRST */}
              {similarComplaintsData?.hasSimilar && (
                <SimilarComplaintCard
                  currentReportLocation={{ lat, lng, address }}
                  similarComplaints={similarComplaintsData.similarComplaints}
                  clusterInfo={similarComplaintsData.clusterInfo}
                  onSupportExisting={(id) => {
                    // Handled internally in SimilarComplaintCard
                  }}
                  onCreateNewConfirmed={() => {
                    handleSubmitGrievance();
                  }}
                  onCancelNew={() => {
                    setCurrentStep(1);
                  }}
                />
              )}

              {/* AI CLASSIFICATION & ROUTE SUMMARY */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm font-sans">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <span>AI Complaint Classification & Similarity Analysis</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Field 1: Department */}
                  <div className="bg-white p-3.5 rounded-xl border border-blue-100 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('report.department', 'Department Dispatch')}</span>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => {
                        const newDept = e.target.value as DepartmentOption;
                        setSelectedDepartment(newDept);
                        if (aiParsedData) {
                          setAiParsedData({ ...aiParsedData, suggestedDepartment: newDept });
                        }
                      }}
                      className="w-full text-xs font-extrabold text-blue-800 bg-blue-50/50 border border-blue-200 rounded-lg p-1.5 font-sans cursor-pointer focus:ring-2 focus:ring-blue-500"
                    >
                      {DEPARTMENT_OPTIONS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Field 2: Issue Type */}
                  <div className="bg-white p-3.5 rounded-xl border border-blue-100 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Issue Type</span>
                    <span className="font-extrabold text-slate-900 font-sans text-xs block truncate">{aiParsedData.issueType || aiParsedData.subcategory}</span>
                    <span className="text-[10px] text-slate-500 font-medium block">{aiParsedData.category} &bull; {aiParsedData.subcategory}</span>
                  </div>

                  {/* Field 3: AI Analysis */}
                  <div className="bg-white p-3.5 rounded-xl border border-blue-100 sm:col-span-2 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">AI Rationale Analysis</span>
                    <p className="text-slate-800 text-xs font-sans leading-relaxed">{aiParsedData.aiAnalysis}</p>
                  </div>

                  {/* Field 4: Similar Complaint */}
                  <div className="bg-white p-3.5 rounded-xl border border-blue-100 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Similar Complaint Detected</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold font-sans ${similarComplaintsData?.hasSimilar ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}`}>
                        {similarComplaintsData?.similarComplaint || (similarComplaintsData?.hasSimilar ? 'Yes' : 'No')}
                      </span>
                      <span className="text-[10px] text-slate-500 font-sans font-medium">
                        {similarComplaintsData?.hasSimilar ? 'Active nearby report' : 'Unique issue'}
                      </span>
                    </div>
                  </div>

                  {/* Field 5: Similarity Reason */}
                  <div className="bg-white p-3.5 rounded-xl border border-blue-100 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Similarity Rationale</span>
                    <p className="text-slate-700 text-[11px] font-sans leading-snug">
                      {similarComplaintsData?.similarityReason || `No similar active complaints found in ${selectedDepartment}.`}
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-blue-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Priority & SLA Route</span>
                    <span className={`font-extrabold font-sans text-xs ${aiParsedData.priorityScore >= 80 ? 'text-rose-600' : 'text-amber-600'}`}>
                      {aiParsedData.priorityScore}/100 Priority ({aiParsedData.severity} Severity)
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-blue-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Target SLA Window</span>
                    <span className="font-bold text-slate-900 font-sans text-xs">48 Hours Standard Resolution</span>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-blue-100 text-xs space-y-1">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">AI Executive Summary</span>
                  <p className="text-slate-800 leading-relaxed font-sans">{aiParsedData.summary}</p>
                </div>
              </div>

              {!similarComplaintsData?.hasSimilar && (
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    ← Edit Report
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitGrievance}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Submit Grievance</span>
                  </button>
                </div>
              )}

            </div>
          )}

          {/* STEP 3: FILING COMPLETE / QUEUED */}
          {currentStep === 3 && (
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-xl font-extrabold text-slate-900 font-sans">
                  {!isOnline || offlineQueue.length > 0 ? 'Saved to Offline Sync Queue!' : 'Grievance Successfully Registered!'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {!isOnline || offlineQueue.length > 0
                    ? 'Your grievance report is safely stored in your browser local storage. CivicLoop will automatically transmit it to municipal officers as soon as your internet connection is restored.'
                    : 'Your grievance report has been dispatched to municipal officers and assigned an SLA resolution route.'}
                </p>
              </div>

              {!isOnline && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl max-w-md mx-auto text-left text-xs space-y-2 text-amber-900">
                  <div className="flex items-center gap-2 font-bold">
                    <WifiOff className="w-4 h-4 text-amber-600" />
                    <span>Background Sync Active</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Service Worker is registered and monitoring network connectivity. You can close or navigate freely—sync triggers automatically.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    setRawTextInput('');
                    setActiveDraftId(null);
                    setCurrentStep(1);
                  }}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Report Another Grievance
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/citizen/dashboard')}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  View Citizen Dashboard →
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Saved Drafts Modal */}
      {showDraftsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-5 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base font-sans">
                <FolderOpen className="w-5 h-5 text-blue-600" />
                <span>Saved Offline Grievance Drafts</span>
              </div>
              <button
                onClick={() => setShowDraftsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3 pr-1">
              {savedDrafts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No offline drafts saved yet.
                </div>
              ) : (
                savedDrafts.map((draft) => (
                  <div
                    key={draft.id}
                    onClick={() => handleLoadDraft(draft)}
                    className="p-4 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-xl cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 font-sans group-hover:text-blue-700">
                        {draft.title || 'Untitled Grievance'}
                      </span>
                      <button
                        onClick={(e) => handleDeleteDraft(draft.id, e)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete draft"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {draft.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(draft.updatedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-blue-600 font-bold group-hover:underline">Resume Draft →</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowDraftsModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
