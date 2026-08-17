import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Language, Role } from '../types';
import { LANGUAGE_LABELS } from '../utils/translations';
import { 
  Building2, 
  Bell, 
  Globe, 
  User, 
  LogOut, 
  ChevronDown, 
  Check, 
  Sparkles,
  ShieldAlert,
  UserCheck,
  Building,
  Menu,
  X,
  Wifi,
  WifiOff,
  RotateCw,
  RotateCcw,
  FileText
} from 'lucide-react';

const getInitials = (name?: string) => {
  if (!name) return 'ND';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export const Header: React.FC = () => {
  const { 
    currentPath, 
    navigate, 
    isAuthenticated,
    currentUser, 
    activeRole, 
    switchRole, 
    logout,
    resetDemoData,
    language, 
    setLanguage, 
    t,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    isOnline,
    offlineQueueCount,
    draftsCount,
    syncOfflineQueueNow,
  } = useApp();

  const [langDropdown, setLangDropdown] = useState(false);
  const [roleDropdown, setRoleDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [notifDropdown, setNotifDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isSessionActive = isAuthenticated && currentUser !== null && activeRole !== null;
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleWorkspaceSwitch = (targetRole: Role) => {
    setRoleDropdown(false);
    setMobileMenuOpen(false);
    if (targetRole === activeRole && isAuthenticated) {
      handleNavClick(`/${targetRole}/dashboard`);
    } else {
      handleNavClick(`/auth/login?role=${targetRole}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('/')}>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 font-sans">NammaDhwani</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
                  <Sparkles className="w-2.5 h-2.5" /> {t('app.tagline', 'AI Civic Intelligence')}
                </span>
              </div>
            </div>
          </div>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {/* If in Admin Workspace (activeRole === 'admin' or currentPath starts with /admin) */}
            {activeRole === 'admin' || currentPath.startsWith('/admin') ? (
              <>
                <button
                  onClick={() => handleNavClick('/admin/dashboard')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    currentPath === '/admin/dashboard' || currentPath === '/admin' ? 'text-blue-700 bg-blue-50/80 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => handleNavClick('/admin/departments')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    currentPath === '/admin/departments' ? 'text-blue-700 bg-blue-50/80 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  Departments
                </button>
                <button
                  onClick={() => handleNavClick('/admin/officers')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    currentPath === '/admin/officers' ? 'text-blue-700 bg-blue-50/80 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  Officers
                </button>
                <button
                  onClick={() => handleNavClick('/admin/insights')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    currentPath.startsWith('/admin/insights') ? 'text-blue-700 bg-blue-50/80 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  Recurring Issues
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavClick('/features')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    currentPath === '/features' ? 'text-blue-600 bg-blue-50/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  {t('nav.features', 'Features')}
                </button>
                <button
                  onClick={() => handleNavClick('/how-it-works')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    currentPath === '/how-it-works' ? 'text-blue-600 bg-blue-50/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  {t('nav.howItWorks', 'How It Works')}
                </button>
                <button
                  onClick={() => handleNavClick('/about')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    currentPath === '/about' ? 'text-blue-600 bg-blue-50/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  {t('nav.about', 'About')}
                </button>

                {/* Role Portal Link - ONLY rendered when authenticated and not admin */}
                {isSessionActive && (
                  <>
                    <div className="h-4 w-px bg-slate-200 mx-2" />

                    {activeRole === 'citizen' && (
                      <button
                        onClick={() => handleNavClick('/citizen/dashboard')}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                          currentPath.startsWith('/citizen') ? 'text-blue-700 bg-blue-100/70' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {t('nav.citizenPortal', 'Citizen Portal')}
                      </button>
                    )}

                    {activeRole === 'officer' && (
                      <button
                        onClick={() => handleNavClick('/officer/dashboard')}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                          currentPath.startsWith('/officer') ? 'text-blue-700 bg-blue-100/70' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {t('nav.officerPortal', 'Officer Command')}
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </nav>

          {/* Right Action Tools & Auth */}
          <div className="hidden md:flex items-center space-x-3">
            
            {/* Role Switcher Pill - ONLY rendered when authenticated */}
            {isSessionActive && (
              <div className="relative">
                <button
                  onClick={() => setRoleDropdown(!roleDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors"
                  title="Switch role view"
                >
                  {activeRole === 'citizen' && <UserCheck className="w-3.5 h-3.5 text-blue-600" />}
                  {activeRole === 'officer' && <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />}
                  {activeRole === 'admin' && <Building className="w-3.5 h-3.5 text-amber-600" />}
                  <span className="capitalize">{t(`role.${activeRole}`, activeRole)} {t('common.view', 'View')}</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>

                {roleDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('nav.switchRole', 'Switch Workspace Role')}
                    </div>
                    <button
                      onClick={() => handleWorkspaceSwitch('citizen')}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 cursor-pointer ${
                        activeRole === 'citizen' ? 'font-bold text-blue-600 bg-blue-50/50' : 'text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">👤 {t('role.citizen', 'Citizen Workspace')}</span>
                      {activeRole === 'citizen' && <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleWorkspaceSwitch('officer')}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 cursor-pointer ${
                        activeRole === 'officer' ? 'font-bold text-emerald-600 bg-emerald-50/50' : 'text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">👮 {t('role.officer', 'Officer Workspace')}</span>
                      {activeRole === 'officer' && <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleWorkspaceSwitch('admin')}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 cursor-pointer ${
                        activeRole === 'admin' ? 'font-bold text-amber-600 bg-amber-50/50' : 'text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">🏛️ {t('role.admin', 'Admin Intelligence')}</span>
                      {activeRole === 'admin' && <Check className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Network / Offline Sync Badge */}
            <div className="flex items-center gap-1.5">
              {!isOnline ? (
                <div 
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-300 shadow-xs animate-pulse cursor-pointer"
                  title="Offline Mode active. Grievance reports will save locally and sync when back online."
                  onClick={() => navigate('/citizen/report')}
                >
                  <WifiOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{t('offline.active', 'Offline')}</span>
                  {offlineQueueCount > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 bg-amber-600 text-white text-[10px] rounded-full font-bold">
                      {offlineQueueCount} {t('offline.queued', 'queued')}
                    </span>
                  )}
                </div>
              ) : offlineQueueCount > 0 ? (
                <button
                  onClick={syncOfflineQueueNow}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs hover:bg-emerald-100 transition-all cursor-pointer"
                  title="Click to sync offline queued grievance reports"
                >
                  <RotateCw className="w-3.5 h-3.5 text-emerald-600 animate-spin shrink-0" />
                  <span>{t('offline.syncing', 'Syncing')} ({offlineQueueCount})</span>
                </button>
              ) : null}
            </div>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdown(!langDropdown)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
                aria-label="Select language"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>{(LANGUAGE_LABELS[language] || LANGUAGE_LABELS['en']).native}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdown && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 max-h-64 overflow-y-auto">
                  {(Object.keys(LANGUAGE_LABELS) as Language[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        setLanguage(key);
                        setLangDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 ${
                        language === key ? 'font-bold text-blue-600 bg-blue-50/60' : 'text-slate-700'
                      }`}
                    >
                      <span>{LANGUAGE_LABELS[key].native} <span className="text-slate-400 font-normal">({LANGUAGE_LABELS[key].name})</span></span>
                      {language === key && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell Dropdown - ONLY rendered when authenticated */}
            {isSessionActive && (
              <div className="relative">
                <button
                  onClick={() => setNotifDropdown(!notifDropdown)}
                  className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                      <span className="font-bold text-sm text-slate-900">{t('nav.notifications', 'Notifications')}</span>
                      {notifications.length > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {t('nav.clearAll', 'Clear all')}
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500">
                          {t('nav.noNotifications', 'No notifications yet.')}
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markNotificationRead(n.id);
                              if (n.linkUrl) handleNavClick(n.linkUrl);
                              setNotifDropdown(false);
                            }}
                            className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                              !n.read ? 'bg-blue-50/40 font-medium' : 'text-slate-600'
                            }`}
                          >
                            <div className="font-semibold text-slate-900 flex items-center justify-between">
                              <span>{t(n.title, n.title)}</span>
                              <span className="text-[10px] text-slate-400 font-normal">{n.timestamp}</span>
                            </div>
                            <p className="text-slate-600 mt-1">{t(n.message, n.message)}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Auth User Profile or Public Get Started Button */}
            {isSessionActive && currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 transition-colors border border-slate-200 cursor-pointer"
                >
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-xs">
                      {getInitials(currentUser.name)}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-800 max-w-[110px] truncate">{currentUser.name || 'Citizen'}</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>

                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50">
                    <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-3">
                      {currentUser.avatarUrl ? (
                        <img
                          src={currentUser.avatarUrl}
                          alt={currentUser.name}
                          className="w-9 h-9 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {getInitials(currentUser.name)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name || 'Citizen'}</p>
                        <p className="text-[11px] text-slate-500 truncate">{currentUser.email || ''}</p>
                        <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-100 text-blue-800 uppercase">
                          {activeRole}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdown(false);
                        handleNavClick(`/${activeRole}/profile`);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left cursor-pointer"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>{t('nav.profile', 'Profile & Settings')}</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdown(false);
                        handleNavClick('/get-started');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left cursor-pointer"
                    >
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span>{t('nav.switchRole', 'Switch Account Role')}</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdown(false);
                        resetDemoData();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-amber-700 hover:bg-amber-50 text-left cursor-pointer font-medium"
                      title="Restore the initial 27 seed grievances"
                    >
                      <RotateCcw className="w-4 h-4 text-amber-600" />
                      <span>Reset Demo Data</span>
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        setUserDropdown(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left font-medium cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('nav.logout', 'Log Out')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleNavClick('/get-started')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-colors"
                >
                  {t('nav.signUp', 'Get Started')}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
          {isSessionActive && (
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase">{t('nav.switchRole', 'Role Mode')}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => handleWorkspaceSwitch('citizen')}
                  className={`px-2 py-1 text-xs rounded-md cursor-pointer ${activeRole === 'citizen' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
                >
                  {t('role.citizen', 'Citizen')}
                </button>
                <button
                  onClick={() => handleWorkspaceSwitch('officer')}
                  className={`px-2 py-1 text-xs rounded-md cursor-pointer ${activeRole === 'officer' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
                >
                  {t('role.officer', 'Officer')}
                </button>
                <button
                  onClick={() => handleWorkspaceSwitch('admin')}
                  className={`px-2 py-1 text-xs rounded-md cursor-pointer ${activeRole === 'admin' ? 'bg-amber-600 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
                >
                  {t('role.admin', 'Admin')}
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            {activeRole === 'admin' || currentPath.startsWith('/admin') ? (
              <>
                <button
                  onClick={() => handleNavClick('/admin/dashboard')}
                  className={`text-left py-2 px-3 text-sm font-medium rounded-lg ${
                    currentPath === '/admin/dashboard' || currentPath === '/admin' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => handleNavClick('/admin/departments')}
                  className={`text-left py-2 px-3 text-sm font-medium rounded-lg ${
                    currentPath === '/admin/departments' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  Departments
                </button>
                <button
                  onClick={() => handleNavClick('/admin/officers')}
                  className={`text-left py-2 px-3 text-sm font-medium rounded-lg ${
                    currentPath === '/admin/officers' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  Officers
                </button>
                <button
                  onClick={() => handleNavClick('/admin/insights')}
                  className={`text-left py-2 px-3 text-sm font-medium rounded-lg ${
                    currentPath.startsWith('/admin/insights') ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  Recurring Issues
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavClick('/')}
                  className="text-left py-2 px-3 text-sm font-medium text-slate-800 rounded-lg hover:bg-slate-100"
                >
                  {t('nav.home', 'Home')}
                </button>
                <button
                  onClick={() => handleNavClick('/features')}
                  className="text-left py-2 px-3 text-sm font-medium text-slate-800 rounded-lg hover:bg-slate-100"
                >
                  {t('nav.features', 'Features')}
                </button>
                <button
                  onClick={() => handleNavClick('/how-it-works')}
                  className="text-left py-2 px-3 text-sm font-medium text-slate-800 rounded-lg hover:bg-slate-100"
                >
                  {t('nav.howItWorks', 'How It Works')}
                </button>
                <button
                  onClick={() => handleNavClick('/about')}
                  className="text-left py-2 px-3 text-sm font-medium text-slate-800 rounded-lg hover:bg-slate-100"
                >
                  {t('nav.about', 'About')}
                </button>

                {isSessionActive && activeRole && (
                  <button
                    onClick={() => handleNavClick(`/${activeRole}/dashboard`)}
                    className="text-left py-2 px-3 text-sm font-bold text-blue-600 bg-blue-50 rounded-lg"
                  >
                    {t(`nav.${activeRole}Portal`, `Go to ${activeRole.toUpperCase()} Dashboard`)}
                  </button>
                )}
              </>
            )}

            {!isSessionActive ? (
              <button
                onClick={() => handleNavClick('/get-started')}
                className="text-center py-2.5 px-4 text-sm font-bold text-white bg-blue-600 rounded-xl"
              >
                {t('nav.signUp', 'Get Started')}
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="text-center py-2.5 px-4 text-sm font-bold text-rose-600 bg-rose-50 rounded-xl"
              >
                {t('nav.logout', 'Log Out')}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
