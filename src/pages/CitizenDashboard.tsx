import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ComplaintStatus } from '../types';
import { 
  PlusCircle, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  FileText, 
  ChevronRight, 
  Filter, 
  MapPin, 
  AlertTriangle,
  UserCheck,
  WifiOff,
  RotateCw,
  Save
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { 
    navigate, 
    complaints, 
    currentUser, 
    isOnline, 
    offlineQueueCount, 
    draftsCount, 
    syncOfflineQueueNow,
    t
  } = useApp();
  
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const citizenComplaints = complaints; // All complaints in mock system

  const totalCount = citizenComplaints.length;
  const pendingCount = citizenComplaints.filter(c => c.status === 'Pending' || c.status === 'In Progress').length;
  const resolvedCount = citizenComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
  const reopenedCount = citizenComplaints.filter(c => c.status === 'Reopened' || c.status === 'Verification Failed').length;

  const filteredComplaints = citizenComplaints.filter((c) => {
    const matchesStatus = 
      selectedStatus === 'All' ? true :
      selectedStatus === 'Pending' ? (c.status === 'Pending' || c.status === 'In Progress') :
      selectedStatus === 'Resolved' ? (c.status === 'Resolved' || c.status === 'Closed') :
      selectedStatus === 'Reopened' ? (c.status === 'Reopened' || c.status === 'Verification Failed') : true;

    const matchesSearch = 
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.address.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      
      {/* Top Banner */}
      <div className="bg-white border-b border-slate-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-bold uppercase">
                {t('nav.citizenPortal', 'Citizen Portal')}
              </span>
              <span className="text-slate-400 text-xs">• {currentUser?.ward || 'Ward 18'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans mt-1">
              {t('citizen.welcome', 'Welcome back')}, {currentUser?.name || 'Citizen'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {t('citizen.subtitle', 'Track your reported grievances, confirm officer resolutions, and view nearby community updates.')}
            </p>
          </div>

          <button
            onClick={() => navigate('/citizen/report')}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('citizen.reportNew', 'Report New Issue')}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Offline Sync Banner */}
        {(!isOnline || offlineQueueCount > 0 || draftsCount > 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-amber-900 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700 shrink-0 mt-0.5 sm:mt-0">
                <WifiOff className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm block">
                  {!isOnline ? t('offline.active', 'Offline Caching & Auto-Sync Active') : t('offline.ready', 'Offline Reports Ready for Sync')}
                </span>
                <p className="text-amber-800 text-[11px] mt-0.5">
                  {!isOnline 
                    ? t('offline.desc', 'You are currently browsing offline. Saved grievance drafts and queued reports are securely stored in local storage.')
                    : `You have ${offlineQueueCount} queued report(s) and ${draftsCount} draft(s) stored locally.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
              {draftsCount > 0 && (
                <button
                  onClick={() => navigate('/citizen/report')}
                  className="px-3.5 py-2 bg-white hover:bg-amber-100/60 border border-amber-300 text-amber-900 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  {t('offline.viewDrafts', 'View Drafts')} ({draftsCount})
                </button>
              )}
              {offlineQueueCount > 0 && isOnline && (
                <button
                  onClick={syncOfflineQueueNow}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{t('offline.syncNow', 'Sync Now')} ({offlineQueueCount})</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t('stats.totalComplaints', 'Total Complaints')}</p>
              <p className="text-2xl font-extrabold text-slate-900 font-sans mt-0.5">{totalCount}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t('stats.inProgress', 'In Progress')}</p>
              <p className="text-2xl font-extrabold text-amber-600 font-sans mt-0.5">{pendingCount}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t('stats.resolved', 'Resolved')}</p>
              <p className="text-2xl font-extrabold text-emerald-600 font-sans mt-0.5">{resolvedCount}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t('stats.reopenedFailed', 'Reopened / Failed')}</p>
              <p className="text-2xl font-extrabold text-rose-600 font-sans mt-0.5">{reopenedCount}</p>
            </div>
          </div>
        </div>

        {/* Action Needed Callout if any verification is pending citizen feedback */}
        {citizenComplaints.some(c => c.status === 'Resolved' && !c.verification?.citizenFeedback) && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-amber-950 font-sans">{t('action.verificationRequired', 'Resolution Verification Action Required')}</h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  {t('action.verificationDesc', 'An officer has completed work on your complaint. Please inspect the before/after evidence and confirm if the fix is complete.')}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const target = citizenComplaints.find(c => c.status === 'Resolved' && !c.verification?.citizenFeedback);
                if (target) navigate(`/citizen/complaints/${target.id}`);
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 cursor-pointer"
            >
              {t('action.reviewConfirm', 'Review & Confirm Fix →')}
            </button>
          </div>
        )}

        {/* Complaints List Table / Cards */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* Header Controls */}
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search.placeholder', 'Search by Complaint ID, category, or address...')}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
              {['All', 'Pending', 'Resolved', 'Reopened'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedStatus(tab)}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    selectedStatus === tab ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t(`filter.${tab.toLowerCase()}`, tab)}
                </button>
              ))}
            </div>
          </div>

          {/* Complaints Table */}
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {filteredComplaints.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700 font-sans">{t('complaint.noneFound', 'No complaints found')}</p>
                <p className="text-xs text-slate-400">{t('complaint.adjustFilter', 'Try adjusting your filter or search criteria.')}</p>
              </div>
            ) : (
              filteredComplaints.map((c) => {
                let badgeBg = 'bg-slate-100 text-slate-700';
                if (c.status === 'In Progress') badgeBg = 'bg-amber-100 text-amber-800';
                if (c.status === 'Resolved') badgeBg = 'bg-emerald-100 text-emerald-800';
                if (c.status === 'Reopened' || c.status === 'Verification Failed') badgeBg = 'bg-rose-100 text-rose-800';
                if (c.status === 'Closed') badgeBg = 'bg-blue-100 text-blue-800';

                return (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/citizen/complaints/${c.id}`)}
                    className="p-5 hover:bg-slate-50/80 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-blue-600">{c.id}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-semibold text-slate-800">{c.category} ({c.subcategory})</span>
                        <span className="text-slate-300">•</span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold">
                          {c.department}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${badgeBg}`}>
                          {t(`status.${c.status.toLowerCase().replace(/\s+/g, '')}`, c.status)}
                        </span>
                        {c.isRecurring && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                            ⚠️ {t('status.recurring', 'Recurring')} ({c.recurringCount}x)
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm font-sans group-hover:text-blue-600 transition-colors line-clamp-1">
                        {c.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {c.location.address}
                      </p>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
                      <div className="text-right text-xs">
                        <span className="text-slate-400 block text-[10px]">{t('label.reported', 'REPORTED')}</span>
                        <span className="font-medium text-slate-700">{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-2 text-blue-600 font-bold text-xs group-hover:translate-x-1 transition-transform">
                        <span>{t('btn.details', 'Details')}</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
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
