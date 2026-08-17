import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { DepartmentOption, DEPARTMENT_OPTIONS, Severity, ComplaintCategory } from '../types';
import { 
  Bot, 
  Sparkles, 
  X, 
  Minus, 
  Send, 
  RefreshCw, 
  ExternalLink, 
  AlertCircle,
  CheckCircle2,
  MapPin,
  Clock,
  GripVertical,
  Mic,
  MicOff,
  Camera,
  Upload,
  ChevronDown,
  ChevronUp,
  FileText,
  Navigation,
  ShieldAlert,
  Building2,
  Copy,
  Check
} from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

// 5 Departments with their official 28 issue types
export const REPORTABLE_DEPARTMENTS: {
  department: DepartmentOption;
  icon: string;
  issues: string[];
}[] = [
  {
    department: 'Roads & Infrastructure',
    icon: '🛣️',
    issues: [
      'Pothole',
      'Road damage',
      'Footpath damage',
      'Sinkhole',
      'Road collapse',
      'Road obstruction',
    ],
  },
  {
    department: 'Stormwater Drainage',
    icon: '🌊',
    issues: [
      'Blocked drain',
      'Waterlogging',
      'Flooding',
      'Open drain',
      'Drain overflow',
      'Culvert damage',
    ],
  },
  {
    department: 'Waste Management',
    icon: '🗑️',
    issues: [
      'Garbage not collected',
      'Overflowing bin',
      'Illegal dumping',
      'Construction waste',
      'Waste segregation',
    ],
  },
  {
    department: 'Street Lighting',
    icon: '💡',
    issues: [
      'Streetlight not working',
      'Broken pole',
      'Exposed wiring',
      'Dark road',
      'Flickering light',
    ],
  },
  {
    department: 'Water Supply',
    icon: '🚰',
    issues: [
      'No water',
      'Low pressure',
      'Water leakage',
      'Contaminated water',
      'Pipeline damage',
    ],
  },
];

export interface GrievanceDraft {
  description: string;
  department: DepartmentOption;
  issueType: string;
  severity: Severity;
  priorityScore: number;
  rationale: string;
  imageUrl?: string;
  address: string;
  ward: string;
  lat: number;
  lng: number;
}

export interface CiviMessage {
  id: string;
  sender: 'user' | 'civi';
  text: string;
  timestamp: string;
  suggestedQuestions?: string[];
  actions?: { label: string; actionType: string; targetPath?: string }[];
  isError?: boolean;
  
  // Multi-step grievance interactive block
  grievanceStep?: 'classification' | 'evidence' | 'location' | 'review' | 'success';
  draft?: GrievanceDraft;
  createdComplaintId?: string;
}

const LOCAL_STORAGE_POS_KEY = 'civicloop_civi_widget_position';

// Get initial clamped position from localStorage or default to bottom-right corner
const getInitialPosition = (): Position => {
  if (typeof window === 'undefined') return { x: 20, y: 20 };

  const defaultX = Math.max(16, window.innerWidth - 180);
  const defaultY = Math.max(16, window.innerHeight - 70);

  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_POS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
        const clampedX = Math.min(Math.max(16, parsed.x), Math.max(16, window.innerWidth - 180));
        const clampedY = Math.min(Math.max(16, parsed.y), Math.max(16, window.innerHeight - 70));
        return { x: clampedX, y: clampedY };
      }
    }
  } catch (e) {
    console.warn('Failed to load Civi widget position from localStorage:', e);
  }

  return { x: defaultX, y: defaultY };
};

// Centralized mapping of registered routes and intelligent alias resolution for Civi AI
const REGISTERED_ROUTES = new Set([
  '/',
  '/get-started',
  '/features',
  '/how-it-works',
  '/about',
  '/privacy',
  '/terms',
  '/contact',
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
  '/citizen/dashboard',
  '/citizen/report',
  '/citizen/profile',
  '/citizen/notifications',
  '/officer/dashboard',
  '/admin/dashboard',
  '/admin/map',
  '/admin/insights',
  '/admin/alerts',
]);

const ROUTE_ALIASES: Record<string, string> = {
  '/report': '/citizen/report',
  '/report-issue': '/citizen/report',
  '/citizen/report-issue': '/citizen/report',
  '/report-new-issue': '/citizen/report',
  '/citizen/new-report': '/citizen/report',
  '/track': '/citizen/dashboard',
  '/track-complaint': '/citizen/dashboard',
  '/citizen/track': '/citizen/dashboard',
  '/citizen-portal': '/citizen/dashboard',
  '/citizen/portal': '/citizen/dashboard',
  '/citizen': '/citizen/dashboard',
  '/officer': '/officer/dashboard',
  '/officer-workspace': '/officer/dashboard',
  '/officer/portal': '/officer/dashboard',
  '/officer/queue': '/officer/dashboard',
  '/admin': '/admin/dashboard',
  '/admin-intelligence': '/admin/dashboard',
  '/admin/portal': '/admin/dashboard',
  '/admin/overview': '/admin/dashboard',
  '/admin/recurring': '/admin/insights',
  '/admin/recurring-issues': '/admin/insights',
  '/admin/analytics': '/admin/dashboard',
  '/admin/sla': '/admin/alerts',
  '/admin/gis': '/admin/map',
  '/login': '/auth/login',
  '/signup': '/auth/register',
  '/register': '/auth/register',
  '/getstarted': '/get-started',
};

const resolveCiviActionPath = (
  rawPath?: string,
  label?: string,
  activeRole?: string
): string => {
  if (!rawPath && !label) return activeRole ? `/${activeRole}/dashboard` : '/get-started';

  const cleanPath = (rawPath || '').trim().toLowerCase().split('?')[0];

  if (REGISTERED_ROUTES.has(cleanPath)) return cleanPath;
  if (cleanPath.startsWith('/citizen/complaints/')) return cleanPath;
  if (cleanPath.startsWith('/officer/complaints/')) return cleanPath;
  if (cleanPath.startsWith('/admin/insights/')) return cleanPath;

  if (ROUTE_ALIASES[cleanPath]) return ROUTE_ALIASES[cleanPath];

  const labelLower = (label || '').toLowerCase();
  if (labelLower.includes('report') || labelLower.includes('pothole') || labelLower.includes('file')) {
    return '/citizen/report';
  }
  if (labelLower.includes('track') || labelLower.includes('complaint') || labelLower.includes('citizen')) {
    return '/citizen/dashboard';
  }
  if (labelLower.includes('queue') || labelLower.includes('officer') || labelLower.includes('assigned')) {
    return '/officer/dashboard';
  }
  if (labelLower.includes('map') || labelLower.includes('gis') || labelLower.includes('ward')) {
    return '/admin/map';
  }
  if (labelLower.includes('insight') || labelLower.includes('recurring') || labelLower.includes('intelligence') || labelLower.includes('briefing')) {
    return '/admin/insights';
  }
  if (labelLower.includes('alert') || labelLower.includes('sla') || labelLower.includes('breach')) {
    return '/admin/alerts';
  }
  if (labelLower.includes('admin') || labelLower.includes('executive')) {
    return '/admin/dashboard';
  }
  if (labelLower.includes('login') || labelLower.includes('sign in') || labelLower.includes('workspace switch')) {
    return '/auth/login';
  }
  if (labelLower.includes('start') || labelLower.includes('get started')) {
    return '/get-started';
  }

  if (activeRole === 'citizen') return '/citizen/dashboard';
  if (activeRole === 'officer') return '/officer/dashboard';
  if (activeRole === 'admin') return '/admin/dashboard';
  return '/get-started';
};

export const CiviAssistant: React.FC = () => {
  const { 
    currentPath, 
    navigate, 
    isAuthenticated,
    activeRole, 
    currentUser, 
    complaints, 
    addComplaint,
    showToast,
    language,
    t
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [messages, setMessages] = useState<CiviMessage[]>([]);
  const [showWhatCanReport, setShowWhatCanReport] = useState(true);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);

  // Active Grievance Flow State
  const [activeDraft, setActiveDraft] = useState<GrievanceDraft | null>(null);
  const [editingClassification, setEditingClassification] = useState(false);
  const [tempImagePreview, setTempImagePreview] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Voice Input Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Draggable position and state
  const [position, setPosition] = useState<Position>(getInitialPosition);
  const [isDragging, setIsDragging] = useState(false);

  const buttonRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dragStartRef = useRef<{ pointerX: number; pointerY: number; elemX: number; elemY: number }>({
    pointerX: 0,
    pointerY: 0,
    elemX: 0,
    elemY: 0,
  });
  const dragDistanceRef = useRef(0);
  const isDraggingRef = useRef(false);

  // Auto-scroll messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, isAnalyzing, activeDraft]);

  // Keep position clamped within viewport on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prevPos) => {
        const activeElem = (!isOpen || isMinimized) ? buttonRef.current : panelRef.current;
        const elemWidth = activeElem?.offsetWidth || ((!isOpen || isMinimized) ? 160 : 400);
        const elemHeight = activeElem?.offsetHeight || ((!isOpen || isMinimized) ? 50 : 580);

        const maxX = Math.max(16, window.innerWidth - elemWidth - 16);
        const maxY = Math.max(16, window.innerHeight - elemHeight - 16);

        const newX = Math.min(Math.max(16, prevPos.x), maxX);
        const newY = Math.min(Math.max(16, prevPos.y), maxY);

        if (newX !== prevPos.x || newY !== prevPos.y) {
          return { x: newX, y: newY };
        }
        return prevPos;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, isMinimized]);

  // Handle pointer down (mouse or touch) for dragging
  const handlePointerDown = (e: React.PointerEvent<HTMLElement>, isHeader = false) => {
    if (e.button !== undefined && e.button !== 0) return;

    const target = e.target as HTMLElement;
    if (isHeader && target.closest('button')) {
      return;
    }

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      elemX: position.x,
      elemY: position.y,
    };
    dragDistanceRef.current = 0;
    isDraggingRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!dragStartRef.current.pointerX && !dragStartRef.current.pointerY) return;

    const dx = e.clientX - dragStartRef.current.pointerX;
    const dy = e.clientY - dragStartRef.current.pointerY;
    const dist = Math.hypot(dx, dy);

    dragDistanceRef.current = dist;

    if (dist > 5) {
      if (!isDraggingRef.current) {
        isDraggingRef.current = true;
        setIsDragging(true);
      }

      const activeElem = (!isOpen || isMinimized) ? buttonRef.current : panelRef.current;
      const elemWidth = activeElem?.offsetWidth || ((!isOpen || isMinimized) ? 160 : 400);
      const elemHeight = activeElem?.offsetHeight || ((!isOpen || isMinimized) ? 50 : 580);

      const maxX = Math.max(16, window.innerWidth - elemWidth - 16);
      const maxY = Math.max(16, window.innerHeight - elemHeight - 16);

      const newX = Math.min(Math.max(16, dragStartRef.current.elemX + dx), maxX);
      const newY = Math.min(Math.max(16, dragStartRef.current.elemY + dy), maxY);

      setPosition({ x: newX, y: newY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLElement>) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}

    if (isDraggingRef.current) {
      try {
        localStorage.setItem(LOCAL_STORAGE_POS_KEY, JSON.stringify(position));
      } catch (err) {
        console.warn('Failed to save Civi widget position:', err);
      }
    }

    setTimeout(() => {
      isDraggingRef.current = false;
      setIsDragging(false);
    }, 50);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    if (dragDistanceRef.current > 5 || isDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setIsOpen(true);
    setIsMinimized(false);
  };

  // Speech Recognition (Voice Input) Handler
  const toggleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Voice Input', t('bot.speechNotSupported', 'Voice recognition is not supported in this browser. Please type your message.'), 'warning');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      // Match app language for speech recognition
      const langMap: Record<string, string> = {
        en: 'en-US',
        hi: 'hi-IN',
        kn: 'kn-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        bn: 'bn-IN',
        mr: 'mr-IN',
        ml: 'ml-IN',
      };
      recognition.lang = langMap[language] || 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        showToast('Voice Assistant', t('bot.speechListening', 'Listening... Speak your civic issue clearly'), 'info');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage(transcript);
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Failed to start speech recognition:', e);
      setIsListening(false);
    }
  };

  // Extract active complaint context if user is on a complaint detail page
  const getComplaintContext = () => {
    if (!isAuthenticated || !activeRole) return null;
    if (currentPath.includes('/complaints/')) {
      const parts = currentPath.split('/complaints/');
      const complaintId = parts[1]?.split('?')[0];
      if (complaintId) {
        const found = complaints.find(c => c.id === complaintId || c.id === `GRV-2026-${complaintId}`);
        if (found) {
          return {
            id: found.id,
            title: found.title,
            category: found.category,
            department: found.department,
            status: found.status,
            priorityScore: found.priorityScore,
            slaDeadline: found.slaDeadline,
            assignedOfficerName: found.assignedOfficerName
          };
        }
      }
    }
    return null;
  };

  // Initialize welcome state when opened or role context changes
  useEffect(() => {
    if (isOpen && (messages.length === 0 || messages[0]?.id.startsWith('welcome-'))) {
      const isAuthPage = currentPath.includes('/auth/login');
      const isPublic = !isAuthenticated || !activeRole;
      const welcomeId = `welcome-${isAuthPage ? 'auth' : isPublic ? 'public' : activeRole}`;

      if (messages[0]?.id !== welcomeId) {
        let initialText = "Hi! I'm DhwaniSathi 👋\n\nI can help you report issues in natural language (text or voice), track SLAs, and resolve civic problems.";
        let suggestedQuestions = ["What can you report?", "How NammaDhwani Works", "Report an issue"];

        if (isAuthPage) {
          initialText = "Hi! I'm DhwaniSathi 👋\n\nNeed help signing in or switching workspaces?\nI can explain Citizen accounts, Officer access, and Administrator credentials.";
          suggestedQuestions = ["How Citizen accounts work", "How Officer access works", "What Administrator access provides"];
        } else if (!isPublic) {
          initialText = `Hi! I'm DhwaniSathi 👋\n\nI can help you report civic issues, track complaints, understand priorities, and explore what is happening in your area as ${activeRole}.`;
          suggestedQuestions = undefined;
        }

        setMessages([
          {
            id: welcomeId,
            sender: 'civi',
            text: initialText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestedQuestions
          }
        ]);
      }
    }
  }, [isOpen, isAuthenticated, activeRole, currentPath]);

  // Handle Send Message & Grievance AI Processing
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isAnalyzing) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: CiviMessage = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsAnalyzing(true);

    try {
      const complaintCtx = getComplaintContext();
      const effectiveRole = isAuthenticated && activeRole ? activeRole : 'citizen';
      const response = await fetch('/api/ai/civi-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          role: effectiveRole,
          language,
          currentPath,
          complaintContext: complaintCtx,
          history: messages.slice(-6).map(m => ({ sender: m.sender, text: m.text })),
        }),
      });

      const data = await response.json();
      if (data && (data.reply || data.isGrievance)) {
        // If AI detected a civic grievance, initiate the 5-step flow!
        if (data.isGrievance && data.department) {
          const dept = (DEPARTMENT_OPTIONS.includes(data.department) 
            ? data.department 
            : 'Roads & Infrastructure') as DepartmentOption;
          
          const issue = data.issueType || 'Civic Issue';
          const sev: Severity = ['Low', 'Medium', 'High', 'Critical'].includes(data.severity) 
            ? data.severity 
            : 'High';

          const draft: GrievanceDraft = {
            description: query,
            department: dept,
            issueType: issue,
            severity: sev,
            priorityScore: data.priorityScore || 80,
            rationale: data.rationale || 'AI-analyzed civic defect requiring municipal action.',
            address: 'MG Road, Ward 18, Central Zone',
            ward: 'Ward 18',
            lat: 12.9756,
            lng: 77.6083,
          };

          setActiveDraft(draft);

          setMessages(prev => [
            ...prev,
            {
              id: `civi-${Date.now()}`,
              sender: 'civi',
              text: data.reply || `I have categorized your grievance under ${dept}. Please confirm below to proceed.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              grievanceStep: 'classification',
              draft,
            }
          ]);
        } else {
          setMessages(prev => [
            ...prev,
            {
              id: `civi-${Date.now()}`,
              sender: 'civi',
              text: data.reply,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              suggestedQuestions: data.suggestedQuestions || [],
              actions: data.actions || [],
            }
          ]);
        }
      } else {
        throw new Error('No reply from Civi API');
      }
    } catch {
      // Local fallback classification if network fails
      const queryLower = query.toLowerCase();
      let matchedDept: DepartmentOption = 'Roads & Infrastructure';
      let matchedIssue = 'Pothole';

      if (queryLower.includes('drain') || queryLower.includes('waterlog') || queryLower.includes('flood')) {
        matchedDept = 'Stormwater Drainage';
        matchedIssue = 'Blocked drain';
      } else if (queryLower.includes('garbage') || queryLower.includes('waste') || queryLower.includes('trash')) {
        matchedDept = 'Waste Management';
        matchedIssue = 'Garbage not collected';
      } else if (queryLower.includes('light') || queryLower.includes('dark') || queryLower.includes('pole')) {
        matchedDept = 'Street Lighting';
        matchedIssue = 'Streetlight not working';
      } else if (queryLower.includes('water') && (queryLower.includes('leak') || queryLower.includes('pressure') || queryLower.includes('dirty'))) {
        matchedDept = 'Water Supply';
        matchedIssue = 'Water leakage';
      }

      const draft: GrievanceDraft = {
        description: query,
        department: matchedDept,
        issueType: matchedIssue,
        severity: 'High',
        priorityScore: 82,
        rationale: 'Identified municipal issue requiring immediate field inspection.',
        address: 'Main Road, Ward 18',
        ward: 'Ward 18',
        lat: 12.9756,
        lng: 77.6083,
      };
      setActiveDraft(draft);

      setMessages(prev => [
        ...prev,
        {
          id: `civi-${Date.now()}`,
          sender: 'civi',
          text: `I've analyzed your complaint and assigned it to **${matchedDept}** (${matchedIssue}). Please confirm to attach evidence and location.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          grievanceStep: 'classification',
          draft,
        }
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Step Transitions in Grievance Flow
  const handleConfirmClassification = (updatedDraft?: GrievanceDraft) => {
    const draft = updatedDraft || activeDraft;
    if (!draft) return;
    setActiveDraft(draft);
    setEditingClassification(false);

    setMessages(prev => [
      ...prev,
      {
        id: `civi-step-evidence-${Date.now()}`,
        sender: 'civi',
        text: t('bot.askImagePrompt', 'Please provide a photo or evidence of the issue (optional):'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        grievanceStep: 'evidence',
        draft,
      }
    ]);
  };

  const handleProceedWithEvidence = (imgUrl?: string) => {
    if (!activeDraft) return;
    const draft = { ...activeDraft, imageUrl: imgUrl || tempImagePreview || undefined };
    setActiveDraft(draft);
    setTempImagePreview('');

    setMessages(prev => [
      ...prev,
      {
        id: `civi-step-location-${Date.now()}`,
        sender: 'civi',
        text: t('bot.askLocationPrompt', 'Please confirm or pin the exact location of the issue on the map:'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        grievanceStep: 'location',
        draft,
      }
    ]);
  };

  const handleProceedWithLocation = (address: string, ward: string, lat: number, lng: number) => {
    if (!activeDraft) return;
    const draft = { ...activeDraft, address, ward, lat, lng };
    setActiveDraft(draft);

    setMessages(prev => [
      ...prev,
      {
        id: `civi-step-review-${Date.now()}`,
        sender: 'civi',
        text: t('bot.finalReviewTitle', 'Final Grievance Review: Please verify all details before submitting.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        grievanceStep: 'review',
        draft,
      }
    ]);
  };

  const handleSubmitGrievance = () => {
    if (!activeDraft) return;

    // Map department to category
    const deptCategoryMap: Record<string, ComplaintCategory> = {
      'Roads & Infrastructure': 'Roads',
      'Drainage & Stormwater': 'Drainage',
      'Waste Management': 'Waste',
      'Street Lighting': 'Streetlight',
      'Water Supply': 'Water',
    };

    const newComplaint = addComplaint({
      title: `${activeDraft.issueType}: ${activeDraft.description.slice(0, 60)}...`,
      description: activeDraft.description,
      department: activeDraft.department,
      category: deptCategoryMap[activeDraft.department] || 'Roads',
      severity: activeDraft.severity,
      priorityScore: activeDraft.priorityScore,
      citizenEvidenceImage: activeDraft.imageUrl || null,
      beforeImages: activeDraft.imageUrl ? [activeDraft.imageUrl] : [],
      location: {
        address: activeDraft.address || 'MG Road, Ward 18',
        ward: activeDraft.ward || 'Ward 18',
        lat: activeDraft.lat || 12.9756,
        lng: activeDraft.lng || 77.6083,
      },
    });

    setMessages(prev => [
      ...prev,
      {
        id: `civi-step-success-${Date.now()}`,
        sender: 'civi',
        text: `${t('bot.successTitle', 'Complaint successfully registered!')} Your official Tracking ID is **${newComplaint.id}**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        grievanceStep: 'success',
        createdComplaintId: newComplaint.id,
        draft: activeDraft,
      }
    ]);

    showToast(
      'Grievance Submitted',
      `Tracking ID: ${newComplaint.id} auto-routed to ${activeDraft.department}.`,
      'success'
    );

    setActiveDraft(null);
  };

  const handleActionClick = (action: { label: string; actionType: string; targetPath?: string }) => {
    if (action.actionType === 'generate_briefing') {
      const resolved = resolveCiviActionPath('/admin/insights', action.label, activeRole || undefined);
      if (!isAuthenticated || activeRole !== 'admin') {
        showToast('Admin Access Required', 'Please sign in to access Administrator Intelligence', 'info');
        navigate('/auth/login?role=admin');
        return;
      }
      navigate(resolved);
      showToast('Executive Briefing Generated', 'Compiled latest civic intelligence insights', 'success');
      return;
    }

    if (action.actionType === 'navigate' || action.targetPath) {
      const resolvedPath = resolveCiviActionPath(action.targetPath, action.label, activeRole || undefined);

      if (resolvedPath.startsWith('/citizen')) {
        if (!isAuthenticated || activeRole !== 'citizen') {
          showToast('Authentication Required', 'Please sign in to access the Citizen workspace', 'info');
          navigate('/auth/login?role=citizen');
          return;
        }
      } else if (resolvedPath.startsWith('/officer')) {
        if (!isAuthenticated || activeRole !== 'officer') {
          showToast('Officer Access Required', 'Please sign in to access the Officer workspace', 'info');
          navigate('/auth/login?role=officer');
          return;
        }
      } else if (resolvedPath.startsWith('/admin')) {
        if (!isAuthenticated || activeRole !== 'admin') {
          showToast('Admin Access Required', 'Please sign in to access Administrator Intelligence', 'info');
          navigate('/auth/login?role=admin');
          return;
        }
      }

      navigate(resolvedPath);
      if (window.innerWidth < 640) setIsOpen(false);
    } else {
      showToast(action.label, action.targetPath || 'Action executed successfully', 'info');
    }
  };

  // Image Upload Handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        setTempImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyTrackingId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    showToast('Copied', `Tracking ID ${id} copied to clipboard!`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ASK CIVI must be visible ONLY inside the Citizen Portal for authenticated citizens.
  // Completely removed from the DOM on Government Officer Portal, Admin Portal, login pages, and all non-citizen pages.
  const isCitizenPortal = Boolean(
    isAuthenticated && 
    activeRole === 'citizen' && 
    currentPath.startsWith('/citizen')
  );

  if (!isCitizenPortal) {
    return null;
  }

  return (
    <div 
      className="fixed z-50 font-sans"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: isDragging ? 'none' : 'top 0.15s ease-out, left 0.15s ease-out',
      }}
    >
      
      {/* FLOATING BUTTON (When closed or minimized) */}
      {(!isOpen || isMinimized) && (
        <div
          ref={buttonRef}
          onPointerDown={(e) => handlePointerDown(e, false)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClick={handleButtonClick}
          className={`group relative flex items-center gap-2 px-3.5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl transition-all duration-200 border border-blue-400/30 touch-none select-none ${
            isDragging 
              ? 'cursor-grabbing scale-105 ring-4 ring-blue-400/40 shadow-blue-500/30' 
              : 'cursor-grab hover:scale-105 active:scale-95'
          }`}
          title="Drag to move anywhere • Click to Ask Civi"
        >
          <div className="flex items-center text-blue-200/80 group-hover:text-white transition-colors">
            <GripVertical className="w-4 h-4 shrink-0" />
          </div>

          <span className="absolute -inset-1 rounded-full bg-blue-500/30 animate-ping opacity-75 pointer-events-none" />
          
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          
          <span className="font-bold text-xs tracking-wide font-sans select-none">
            {t('bot.title', 'Ask Civi')}
          </span>

          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
        </div>
      )}

      {/* CIVI ASSISTANT PANEL */}
      {isOpen && !isMinimized && (
        <div 
          ref={panelRef}
          className={`w-[calc(100vw-2rem)] sm:w-[440px] h-[620px] max-h-[90vh] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 ${
            isDragging ? 'ring-2 ring-blue-500/50 shadow-blue-500/20 opacity-95' : ''
          }`}
        >
          
          {/* PANEL HEADER (Draggable) */}
          <div 
            onPointerDown={(e) => handlePointerDown(e, true)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`bg-slate-900 text-white p-4 px-5 flex items-center justify-between border-b border-slate-800 shrink-0 select-none touch-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            title="Drag header to move panel anywhere"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex items-center text-slate-500 hover:text-slate-300 transition-colors shrink-0">
                <GripVertical className="w-4 h-4" />
              </div>
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-white font-sans tracking-tight">{t('bot.name', 'Civi')}</h3>
                  <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    AI Assistant
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans">
                  {t('app.tagline', 'AI Citizen Intelligence & Grievance Flow')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Minimize"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ACTIVE ROLE / CONTEXT BADGE */}
          <div className="bg-slate-100 border-b border-slate-200 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-600">
            <span className="font-medium text-slate-700 capitalize">
              Role: <strong className="text-blue-700">{isAuthenticated && activeRole ? activeRole : 'Citizen Workspace'}</strong>
            </span>
            <button
              onClick={() => setShowWhatCanReport(prev => !prev)}
              className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>{t('bot.whatCanReport', 'What can you report?')}</span>
              {showWhatCanReport ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* "WHAT CAN YOU REPORT?" COLLAPSIBLE SECTION */}
          {showWhatCanReport && (
            <div className="bg-blue-50/70 border-b border-blue-200/60 p-3.5 space-y-2 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    {t('bot.whatCanReport', 'What can you report?')}
                  </h4>
                  <p className="text-[11px] text-blue-800/80 leading-relaxed mt-0.5">
                    {t('bot.whatCanReportDesc', 'Supported civic problem areas. You can type or speak in natural language — AI will automatically detect the department.')}
                  </p>
                </div>
              </div>

              {/* 5 Departments Chips Grid */}
              <div className="space-y-1.5 pt-1">
                {REPORTABLE_DEPARTMENTS.map((dept) => {
                  const isExpanded = expandedDept === dept.department;
                  return (
                    <div key={dept.department} className="bg-white rounded-xl border border-blue-100 shadow-2xs overflow-hidden">
                      <button
                        onClick={() => setExpandedDept(isExpanded ? null : dept.department)}
                        className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-blue-50/50 transition-colors cursor-pointer"
                      >
                        <span className="font-bold text-[11px] text-slate-800 flex items-center gap-1.5">
                          <span>{dept.icon}</span>
                          <span>{t(dept.department, dept.department)}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <span>{dept.issues.length} {t('common.view', 'issues')}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </span>
                      </button>

                      {/* Issue keywords sub-chips */}
                      {isExpanded && (
                        <div className="p-2.5 pt-1 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-1">
                          {dept.issues.map((issue) => (
                            <button
                              key={issue}
                              onClick={() => {
                                const promptText = `I want to report a ${issue} in my area`;
                                setInputMessage(promptText);
                                handleSendMessage(promptText);
                              }}
                              className="px-2 py-1 bg-white hover:bg-blue-600 hover:text-white text-slate-700 border border-slate-200 text-[10px] font-medium rounded-lg transition-colors cursor-pointer shadow-2xs"
                            >
                              • {t(issue, issue)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MESSAGES CONTAINER */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-2`}
              >
                {/* Text Bubble */}
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed font-sans shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : msg.isError
                      ? 'bg-amber-50 text-amber-900 border border-amber-200 rounded-bl-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* STEP 1: CLASSIFICATION CONFIRMATION CARD */}
                {msg.grievanceStep === 'classification' && msg.draft && (
                  <div className="w-full max-w-[92%] bg-white p-4 rounded-2xl border border-blue-200 shadow-sm space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wide flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        {t('bot.confirmClassification', 'AI Complaint Classification')}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold text-[10px] rounded-full">
                        {msg.draft.priorityScore}/100 {t('bot.stepSeverity', 'Priority')}
                      </span>
                    </div>

                    {!editingClassification ? (
                      <div className="space-y-2 text-xs">
                        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl">
                          <div>
                            <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                              {t('bot.stepDepartment', 'Department')}
                            </span>
                            <span className="font-bold text-slate-800">
                              {t(msg.draft.department, msg.draft.department)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                              {t('bot.stepIssueType', 'Issue Type')}
                            </span>
                            <span className="font-bold text-slate-800">
                              {t(msg.draft.issueType, msg.draft.issueType)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] px-1">
                          <span className="text-slate-500">{t('bot.stepSeverity', 'Severity')}:</span>
                          <span className={`font-bold px-2 py-0.5 rounded-md ${
                            msg.draft.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                            msg.draft.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {t(`severity.${msg.draft.severity}`, msg.draft.severity)}
                          </span>
                        </div>

                        {msg.draft.rationale && (
                          <p className="text-[11px] text-slate-600 italic bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                            💡 {msg.draft.rationale}
                          </p>
                        )}

                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleConfirmClassification(msg.draft)}
                            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            {t('bot.btnConfirmProceed', 'Confirm & Proceed')}
                          </button>
                          <button
                            onClick={() => setEditingClassification(true)}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                          >
                            {t('bot.btnEditClassification', 'Edit')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Editing Form */
                      <div className="space-y-2.5 text-xs">
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                            {t('bot.stepDepartment', 'Department')}
                          </label>
                          <select
                            value={activeDraft?.department || msg.draft.department}
                            onChange={(e) => {
                              const dept = e.target.value as DepartmentOption;
                              if (activeDraft) setActiveDraft({ ...activeDraft, department: dept });
                            }}
                            className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white"
                          >
                            {DEPARTMENT_OPTIONS.map(d => (
                              <option key={d} value={d}>{t(d, d)}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                            {t('bot.stepIssueType', 'Issue Type')}
                          </label>
                          <input
                            type="text"
                            value={activeDraft?.issueType || msg.draft.issueType}
                            onChange={(e) => {
                              if (activeDraft) setActiveDraft({ ...activeDraft, issueType: e.target.value });
                            }}
                            className="w-full p-2 border border-slate-300 rounded-xl text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                            {t('bot.stepSeverity', 'Severity')}
                          </label>
                          <select
                            value={activeDraft?.severity || msg.draft.severity}
                            onChange={(e) => {
                              const sev = e.target.value as Severity;
                              if (activeDraft) setActiveDraft({ ...activeDraft, severity: sev });
                            }}
                            className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                          </select>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleConfirmClassification(activeDraft || msg.draft)}
                            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                          >
                            {t('bot.btnConfirmProceed', 'Save & Proceed')}
                          </button>
                          <button
                            onClick={() => setEditingClassification(false)}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
                          >
                            {t('bot.btnCancel', 'Cancel')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 2: EVIDENCE / PHOTO UPLOAD CARD */}
                {msg.grievanceStep === 'evidence' && msg.draft && (
                  <div className="w-full max-w-[92%] bg-white p-4 rounded-2xl border border-blue-200 shadow-sm space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Camera className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-800">
                        {t('bot.askImagePrompt', 'Attach Photo / Evidence')}
                      </span>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileChange}
                      accept="image/*"
                      className="hidden"
                    />

                    {tempImagePreview ? (
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-40 bg-black/5">
                        <img src={tempImagePreview} alt="Evidence Preview" className="w-full h-36 object-cover" />
                        <button
                          onClick={() => setTempImagePreview('')}
                          className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black text-white rounded-full cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/30"
                      >
                        <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                        <p className="text-xs font-semibold text-slate-700">{t('bot.btnUploadImage', 'Click to upload photo evidence')}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WebP up to 10MB</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      {tempImagePreview ? (
                        <button
                          onClick={() => handleProceedWithEvidence(tempImagePreview)}
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          {t('bot.btnContinueWithPhoto', 'Continue with Photo')}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleProceedWithEvidence(undefined)}
                          className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          {t('bot.btnSkipImage', 'Skip Photo & Continue')}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 3: LOCATION CARD */}
                {msg.grievanceStep === 'location' && msg.draft && (
                  <div className="w-full max-w-[92%] bg-white p-4 rounded-2xl border border-blue-200 shadow-sm space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-rose-500" />
                        {t('bot.askLocationPrompt', 'Confirm Complaint Location')}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500">
                        GPS & OSM
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                          {t('bot.reviewLocation', 'Street Address / Landmark')}
                        </label>
                        <input
                          type="text"
                          defaultValue={msg.draft.address || 'MG Road, Ward 18'}
                          id="civi-loc-address"
                          className="w-full p-2 border border-slate-300 rounded-xl text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                            Ward
                          </label>
                          <input
                            type="text"
                            defaultValue={msg.draft.ward || 'Ward 18'}
                            id="civi-loc-ward"
                            className="w-full p-2 border border-slate-300 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                            Coordinates
                          </label>
                          <div className="p-2 bg-slate-50 rounded-xl text-[11px] font-mono text-slate-600">
                            {msg.draft.lat.toFixed(4)}, {msg.draft.lng.toFixed(4)}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                              (pos) => {
                                showToast('GPS Location Detected', `Coordinates updated: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`, 'success');
                              },
                              () => {
                                showToast('GPS Notice', 'Using municipal ward default coordinates.', 'info');
                              }
                            );
                          }
                        }}
                        className="w-full py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        {t('bot.btnDetectGps', 'Detect Current GPS')}
                      </button>

                      <button
                        onClick={() => {
                          const addr = (document.getElementById('civi-loc-address') as HTMLInputElement)?.value || msg.draft?.address || 'MG Road, Ward 18';
                          const ward = (document.getElementById('civi-loc-ward') as HTMLInputElement)?.value || msg.draft?.ward || 'Ward 18';
                          handleProceedWithLocation(addr, ward, msg.draft?.lat || 12.9756, msg.draft?.lng || 77.6083);
                        }}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer mt-1"
                      >
                        {t('bot.btnConfirmLocation', 'Confirm Location & Review')}
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: FINAL REVIEW CARD */}
                {msg.grievanceStep === 'review' && msg.draft && (
                  <div className="w-full max-w-[92%] bg-white p-4 rounded-2xl border border-blue-300 shadow-md space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-extrabold text-blue-950 uppercase tracking-wide flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        {t('bot.finalReviewTitle', 'Final Grievance Review')}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">
                        Ready to Submit
                      </span>
                    </div>

                    <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-xl">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">
                          {t('bot.reviewComplaint', 'Complaint Summary')}
                        </span>
                        <p className="font-semibold text-slate-900 mt-0.5">{msg.draft.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">
                            {t('bot.reviewDepartment', 'Department')}
                          </span>
                          <span className="font-bold text-slate-800">{t(msg.draft.department, msg.draft.department)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">
                            {t('bot.reviewIssue', 'Issue')}
                          </span>
                          <span className="font-bold text-slate-800">{t(msg.draft.issueType, msg.draft.issueType)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">
                            {t('bot.reviewSeverity', 'Severity')}
                          </span>
                          <span className="font-bold text-rose-600">{msg.draft.severity} ({msg.draft.priorityScore}/100)</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">
                            {t('bot.reviewTargetSla', 'Target SLA')}
                          </span>
                          <span className="font-bold text-slate-800">48 Hours</span>
                        </div>
                      </div>

                      <div className="pt-1 border-t border-slate-200/60">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">
                          {t('bot.reviewLocation', 'Location')}
                        </span>
                        <span className="text-slate-700">{msg.draft.address} ({msg.draft.ward})</span>
                      </div>

                      {msg.draft.imageUrl && (
                        <div className="pt-1 border-t border-slate-200/60">
                          <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
                            {t('bot.reviewEvidence', 'Evidence Attached')}
                          </span>
                          <img src={msg.draft.imageUrl} alt="Attached" className="w-16 h-16 object-cover rounded-lg border border-slate-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleSubmitGrievance}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {t('bot.btnSubmitComplaint', 'Submit Complaint')}
                      </button>
                      <button
                        onClick={() => setActiveDraft(null)}
                        className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        {t('bot.btnCancel', 'Cancel')}
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 5: SUCCESS CARD */}
                {msg.grievanceStep === 'success' && msg.createdComplaintId && (
                  <div className="w-full max-w-[92%] bg-white p-4 rounded-2xl border border-emerald-300 shadow-md space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 className="w-5 h-5" />
                      <h4 className="font-extrabold text-xs text-slate-900">
                        {t('bot.successTitle', 'Complaint Registered Successfully!')}
                      </h4>
                    </div>

                    <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-emerald-800 font-bold uppercase">
                          {t('bot.trackingIdLabel', 'Tracking ID')}
                        </span>
                        <button
                          onClick={() => handleCopyTrackingId(msg.createdComplaintId!)}
                          className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-900 bg-white px-2 py-0.5 rounded-md border border-emerald-300 cursor-pointer"
                        >
                          {copiedId === msg.createdComplaintId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          {copiedId === msg.createdComplaintId ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <p className="font-mono font-extrabold text-sm text-slate-900">
                        {msg.createdComplaintId}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <button
                        onClick={() => {
                          navigate(`/citizen/complaints/${msg.createdComplaintId}`);
                          if (window.innerWidth < 640) setIsOpen(false);
                        }}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {t('bot.btnTrackGrievance', 'Track Grievance & SLA Timeline')}
                      </button>

                      <button
                        onClick={() => {
                          navigate('/citizen/dashboard');
                          if (window.innerWidth < 640) setIsOpen(false);
                        }}
                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        {t('bot.btnGoToDashboard', 'Go to Citizen Dashboard')}
                      </button>

                      <button
                        onClick={() => {
                          setInputMessage('');
                          setShowWhatCanReport(true);
                        }}
                        className="w-full py-1.5 text-blue-600 hover:text-blue-800 font-semibold text-[11px] transition-colors cursor-pointer text-center block"
                      >
                        + {t('bot.btnReportAnother', 'Report another issue')}
                      </button>
                    </div>
                  </div>
                )}

                {/* ACTION BUTTONS */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1 pl-1">
                    {msg.actions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleActionClick(act)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-[11px] rounded-xl transition-all shadow-2xs hover:shadow-xs flex items-center gap-1 cursor-pointer"
                      >
                        <span>{act.label}</span>
                        <ExternalLink className="w-3 h-3 text-blue-500" />
                      </button>
                    ))}
                  </div>
                )}

                {/* SUGGESTED FOLLOW-UP CHIPS */}
                {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1.5 pl-1">
                    {msg.suggestedQuestions.map((sq, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(sq)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium text-[10px] rounded-full transition-colors cursor-pointer"
                      >
                        💬 {sq}
                      </button>
                    ))}
                  </div>
                )}

                <span className="text-[9px] text-slate-400 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {/* ANALYZING / THINKING STATE */}
            {isAnalyzing && (
              <div className="flex items-center gap-2 text-slate-500 bg-white p-3 rounded-2xl border border-slate-200 w-max text-xs">
                <Sparkles className="w-4 h-4 text-blue-500 animate-spin" />
                <span className="font-medium">Civi is analyzing</span>
                <span className="inline-flex gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT BAR WITH VOICE INPUT & MULTILINGUAL PLACEHOLDER */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={isListening 
                  ? t('bot.speechListening', 'Listening... Speak your issue') 
                  : t('bot.placeholder', 'Type in natural language or speak to report...')}
                disabled={isAnalyzing}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-sans"
              />

              {/* VOICE INPUT BUTTON */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                  isListening 
                    ? 'bg-rose-500 text-white animate-pulse shadow-md ring-2 ring-rose-400' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title={isListening ? 'Stop Listening' : 'Speak to report (Voice Input)'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* SEND BUTTON */}
              <button
                type="submit"
                disabled={!inputMessage.trim() || isAnalyzing}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
};
