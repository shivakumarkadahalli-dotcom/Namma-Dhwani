import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Complaint } from '../types';
import { OfficerLoginScreen } from '../components/OfficerLoginScreen';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Search, 
  MapPin, 
  Wrench, 
  ChevronRight, 
  ChevronDown,
  ShieldAlert, 
  User, 
  Lock,
  UserCheck,
  UserX,
  ArrowUpDown,
  Eye,
  ShieldCheck,
  LogOut,
  RefreshCw
} from 'lucide-react';

export const OfficerDashboard: React.FC = () => {
  const { 
    navigate, 
    complaints, 
    currentUser, 
    activeRole,
    isAuthenticated,
    officerRosters, 
    toggleOfficerAvailability, 
    switchOfficer,
    logoutOfficer,
    t
  } = useApp();
  
  const [viewMode, setViewMode] = useState<'my' | 'all'>('my');
  const [selectedTab, setSelectedTab] = useState<'All' | 'Critical' | 'High' | 'Pending' | 'SLA_Risk' | 'Resolved'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [officerDropdownOpen, setOfficerDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOfficerDropdownOpen(false);
      }
    };
    if (officerDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [officerDropdownOpen]);

  // Check if active user is authenticated as an officer
  const isOfficerSession = Boolean(
    isAuthenticated && 
    activeRole === 'officer' && 
    currentUser && 
    currentUser.role === 'officer'
  );

  // If not authenticated as an officer, present the dedicated Officer Authentication screen
  if (!isOfficerSession) {
    return <OfficerLoginScreen initialDepartment={currentUser?.department || 'Roads & Infrastructure'} />;
  }

  const assignedDepartment = currentUser?.department || 'Roads & Infrastructure';

  // Get department officers roster from context
  const currentDepartmentRoster = officerRosters[assignedDepartment] || [];

  // Filter complaints strictly for officer's assigned department
  const departmentComplaints = complaints.filter(c => {
    if (!c.department) return false;
    const deptA = c.department.toLowerCase().trim();
    const deptB = assignedDepartment.toLowerCase().trim();
    return deptA === deptB || deptA.includes(deptB) || deptB.includes(deptA);
  });

  // Strict sorting by Priority/Severity: Critical -> High -> Medium -> Low
  const SEVERITY_ORDER: Record<string, number> = {
    'CRITICAL': 1,
    'Critical': 1,
    'HIGH': 2,
    'High': 2,
    'MEDIUM': 3,
    'Medium': 3,
    'LOW': 4,
    'Low': 4,
  };

  const sortedDepartmentComplaints = [...departmentComplaints].sort((a, b) => {
    const sevA = SEVERITY_ORDER[a.severity] || 3;
    const sevB = SEVERITY_ORDER[b.severity] || 3;
    if (sevA !== sevB) return sevA - sevB; // Critical (1) first
    return (b.priorityScore || 0) - (a.priorityScore || 0);
  });

  // Filter based on view mode (My assigned vs All department)
  const filteredByView = sortedDepartmentComplaints.filter(c => {
    if (viewMode === 'all') return true;
    return c.assignedOfficerId === currentUser?.id;
  });

  const totalCount = sortedDepartmentComplaints.length;
  const myAssignedCount = sortedDepartmentComplaints.filter(c => c.assignedOfficerId === currentUser?.id).length;
  const criticalCount = sortedDepartmentComplaints.filter(c => (c.severity || '').toUpperCase() === 'CRITICAL' || (c.priorityScore || 0) >= 80).length;
  const pendingCount = sortedDepartmentComplaints.filter(c => c.status === 'Pending' || c.status === 'In Progress' || c.status === 'Submitted' || c.status === 'Assigned' || c.status === 'Reopened').length;
  const slaRiskCount = sortedDepartmentComplaints.filter(c => c.slaStatus === 'Breached' || ((c.priorityScore || 0) >= 75 && c.status !== 'Resolved' && c.status !== 'Closed')).length;
  const resolvedCount = sortedDepartmentComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed' || c.citizenVerificationStatus === 'FULLY_FIXED').length;

  const filtered = filteredByView.filter((c) => {
    const matchesTab = 
      selectedTab === 'All' ? true :
      selectedTab === 'Critical' ? ((c.severity || '').toUpperCase() === 'CRITICAL' || (c.priorityScore || 0) >= 80) :
      selectedTab === 'High' ? ((c.severity || '').toUpperCase() === 'HIGH') :
      selectedTab === 'Pending' ? (c.status === 'Pending' || c.status === 'In Progress' || c.status === 'Submitted' || c.status === 'Assigned' || c.status === 'Reopened') :
      selectedTab === 'SLA_Risk' ? (c.slaStatus === 'Breached' || ((c.priorityScore || 0) >= 75 && c.status !== 'Resolved' && c.status !== 'Closed')) :
      selectedTab === 'Resolved' ? (c.status === 'Resolved' || c.status === 'Closed' || c.citizenVerificationStatus === 'FULLY_FIXED') : true;

    const matchesSearch = 
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.assignedOfficerName && c.assignedOfficerName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  const currentOfficerProfile = currentDepartmentRoster.find(o => o.id === currentUser?.id) || currentUser;
  const isCurrentOfficerAvailable = currentOfficerProfile?.isAvailable !== false;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase border border-emerald-500/30 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" /> Municipal Officer Portal
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-xs font-bold uppercase border border-blue-500/30">
                {assignedDepartment}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-xs font-bold uppercase border border-amber-500/30 flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3 text-amber-400" /> Priority: Critical → High → Medium → Low
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-sans flex items-center gap-2">
              <span>{t(assignedDepartment, assignedDepartment)} Officer Workspace</span>
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
              
              {/* Interactive Officer Profile Pill with Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setOfficerDropdownOpen(!officerDropdownOpen)}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700/90 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors text-left cursor-pointer group"
                  id="officer-profile-dropdown-btn"
                  title="Click to view officer account or switch officer"
                >
                  <span className="text-slate-400">Logged-in Officer:</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    {currentUser?.name || 'Engineer Anita Desai'}
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform ${officerDropdownOpen ? 'rotate-180' : ''}`} />
                  </span>
                  <span className="text-slate-400 font-normal hidden sm:inline">
                    ({currentUser?.designation || 'Senior Bituminous Surface Specialist'})
                  </span>
                </button>

                {/* Popover Dropdown Menu */}
                {officerDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                    <div className="pb-3 border-b border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Logged in as:
                      </span>
                      <p className="text-sm font-extrabold text-white">
                        {currentUser?.name}
                      </p>
                      <p className="text-xs text-slate-300 font-medium">
                        {currentUser?.designation}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                          {currentUser?.department}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {currentUser?.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono pt-1">
                        {currentUser?.email}
                      </p>
                    </div>

                    <div className="space-y-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setOfficerDropdownOpen(false);
                          switchOfficer();
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                        id="switch-officer-btn"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Switch Officer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOfficerDropdownOpen(false);
                          logoutOfficer();
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-rose-950/80 hover:text-rose-200 text-slate-300 border border-slate-700 hover:border-rose-800/80 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        id="logout-officer-btn"
                      >
                        <LogOut className="w-3.5 h-3.5 text-slate-400" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Duty Status Indicator */}
              <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                <span className="text-slate-400">Status:</span>
                <span className={`font-bold flex items-center gap-1 ${isCurrentOfficerAvailable ? 'text-emerald-400' : 'text-rose-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${isCurrentOfficerAvailable ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  {isCurrentOfficerAvailable ? 'Active & Available' : 'Off-Duty (Unavailable)'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Logged-in Officer Self Availability Toggle */}
            {currentUser && (
              <button
                onClick={() => toggleOfficerAvailability(currentUser.id)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 shadow-xs cursor-pointer ${
                  isCurrentOfficerAvailable
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
                title="Change your duty availability status"
              >
                {isCurrentOfficerAvailable ? (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Set as Unavailable</span>
                  </>
                ) : (
                  <>
                    <UserX className="w-4 h-4" />
                    <span>Set as Available</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">

        {/* DEPARTMENT OFFICER ROSTER & DUTY STATUS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 font-sans flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>{assignedDepartment} — Officer Roster</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of assigned municipal field personnel. Only your own availability can be modified.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setViewMode('my')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'my' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>My Queue ({myAssignedCount})</span>
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'all' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-amber-600" />
                <span>All Department Queue ({totalCount})</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentDepartmentRoster.map((off) => {
              const isSelected = currentUser?.id === off.id;
              const isAvail = off.isAvailable !== false;
              const assignedToThisOfficerCount = sortedDepartmentComplaints.filter(c => c.assignedOfficerId === off.id).length;

              return (
                <div
                  key={off.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                    isSelected 
                      ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20 shadow-xs' 
                      : 'bg-slate-50/60 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-slate-900">{off.name}</span>
                        {isSelected && (
                          <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded uppercase tracking-wider">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 block">{off.designation}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">{off.id}</span>
                    </div>

                    {/* Self toggle for current user, read-only badge for other officers */}
                    {isSelected ? (
                      <button
                        onClick={() => toggleOfficerAvailability(off.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${
                          isAvail
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                        title="Click to toggle your duty availability"
                      >
                        {isAvail ? (
                          <>
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            <span>AVAILABLE</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3 text-rose-600" />
                            <span>UNAVAILABLE</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 shrink-0 select-none ${
                          isAvail
                            ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50/80 text-rose-700 border-rose-200'
                        }`}
                        title="Officer availability status is read-only"
                      >
                        {isAvail ? (
                          <>
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            <span>AVAILABLE</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3 text-rose-600" />
                            <span>UNAVAILABLE</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/60 text-xs">
                    <span className="text-slate-600 font-semibold text-[11px]">
                      Assigned: <strong className="text-slate-900">{assignedToThisOfficerCount} tickets</strong>
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-blue-600" /> Current Officer
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Officer Metrics Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Total Dept Queue</p>
              <p className="text-xl font-extrabold text-slate-900 font-sans mt-0.5">{totalCount}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Critical Priority</p>
              <p className="text-xl font-extrabold text-rose-600 font-sans mt-0.5">{criticalCount}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Pending Field Work</p>
              <p className="text-xl font-extrabold text-amber-600 font-sans mt-0.5">{pendingCount}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">At SLA Breach Risk</p>
              <p className="text-xl font-extrabold text-orange-600 font-sans mt-0.5">{slaRiskCount}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 col-span-2 lg:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Resolved & Verified</p>
              <p className="text-xl font-extrabold text-emerald-600 font-sans mt-0.5">{resolvedCount}</p>
            </div>
          </div>
        </div>

        {/* Dispatch Queue Table Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* Header Controls */}
          <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket ID, officer name, category, or address..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            {/* Severity & Status Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
              {[
                { label: 'All Queue', key: 'All' },
                { label: '🔥 Critical', key: 'Critical' },
                { label: '⚡ High', key: 'High' },
                { label: '⏳ Pending Work', key: 'Pending' },
                { label: '⚠️ SLA Risk', key: 'SLA_Risk' },
                { label: '✅ Resolved', key: 'Resolved' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key as any)}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    selectedTab === tab.key ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

          </div>

          {/* Queue List */}
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {filtered.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs space-y-2">
                <p className="font-bold text-slate-600">No tickets match the active view & filter.</p>
                <p className="text-slate-400">
                  {viewMode === 'my' ? 'Switch to "All Department Queue" to view all department tickets.' : 'Try adjusting search term or status tabs.'}
                </p>
              </div>
            ) : (
              filtered.map((c) => {
                const sevUpper = (c.severity || 'MEDIUM').toUpperCase();
                let badgeBg = 'bg-slate-100 text-slate-700 border-slate-200';
                if (sevUpper === 'CRITICAL') badgeBg = 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse';
                else if (sevUpper === 'HIGH') badgeBg = 'bg-orange-100 text-orange-800 border-orange-300';
                else if (sevUpper === 'MEDIUM') badgeBg = 'bg-amber-100 text-amber-800 border-amber-200';

                const assignedDateFormatted = c.assignedAt 
                  ? new Date(c.assignedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : 'Assigned';

                const isAssignedToMe = c.assignedOfficerId === currentUser?.id;

                return (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/officer/complaints/${c.id}`)}
                    className={`p-5 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group ${
                      isAssignedToMe ? 'bg-blue-50/20' : ''
                    }`}
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-blue-600">{c.id}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-bold text-slate-800">{c.category}</span>
                        <span className="text-slate-300">•</span>
                        
                        {/* SEVERITY BADGE */}
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border ${badgeBg}`}>
                          {sevUpper} PRIORITY (Score {c.priorityScore || 65}/100)
                        </span>

                        {c.isRecurring && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                            ⚠️ RECURRING ({c.recurringCount}x)
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm font-sans group-hover:text-blue-600 transition-colors line-clamp-1">
                        {c.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1 text-slate-600 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {c.location.address} {c.location.ward ? `(${c.location.ward})` : ''}
                        </span>

                        {/* ASSIGNED OFFICER INFO */}
                        <span className="flex items-center gap-1.5 bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md text-[11px] font-semibold border border-slate-200">
                          <User className="w-3 h-3 text-blue-600" />
                          <span>Assigned To: <strong>{c.assignedOfficerName || 'Unassigned'}</strong></span>
                          <span className="text-[10px] text-slate-400 font-mono">({assignedDateFormatted})</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
                      <div className="text-right text-xs">
                        <span className="text-slate-400 block text-[10px] font-bold">STATUS</span>
                        <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          c.status === 'Resolved' || c.status === 'Closed' || c.citizenVerificationStatus === 'FULLY_FIXED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : c.status === 'Awaiting Verification'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {c.status}
                        </span>
                      </div>

                      <button className="px-3.5 py-2 bg-blue-600 group-hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer">
                        <span>Inspect & Fix</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>
    </div>
  );
};


