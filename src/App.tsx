import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { CiviAssistant } from './components/CiviAssistant';

// Pages
import { LandingPage } from './pages/LandingPage';
import { GetStartedPage } from './pages/GetStartedPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { AboutPage } from './pages/AboutPage';

// Auth Pages
import { AuthLoginPage } from './pages/AuthLoginPage';
import { AuthRegisterPage } from './pages/AuthRegisterPage';
import { AuthResetPage } from './pages/AuthResetPage';

// Citizen Pages
import { CitizenDashboard } from './pages/CitizenDashboard';
import { CitizenReportPage } from './pages/CitizenReportPage';
import { CitizenComplaintDetail } from './pages/CitizenComplaintDetail';
import { CitizenProfilePage } from './pages/CitizenProfilePage';
import { CitizenNotificationsPage } from './pages/CitizenNotificationsPage';

// Officer Pages
import { OfficerDashboard } from './pages/OfficerDashboard';
import { OfficerComplaintDetail } from './pages/OfficerComplaintDetail';

// Admin Pages
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminMapPage } from './pages/AdminMapPage';
import { AdminInsightsPage } from './pages/AdminInsightsPage';
import { AdminInsightDetail } from './pages/AdminInsightDetail';
import { AdminAlertsPage } from './pages/AdminAlertsPage';

// Static Pages
import { PrivacyPage, TermsPage, ContactPage, NotFoundPage } from './pages/StaticPages';

const AppRouter: React.FC = () => {
  const { currentPath, isAuthenticated, activeRole } = useApp();

  const renderRoute = () => {
    const path = currentPath.split('?')[0];

    // Check if path is a protected role route
    const isCitizenRoute = path.startsWith('/citizen');
    const isOfficerRoute = path.startsWith('/officer');
    const isAdminRoute = path.startsWith('/admin');

    // Route Protection: Unauthenticated users attempting to access role dashboards are redirected to login
    if (!isAuthenticated && (isCitizenRoute || isOfficerRoute || isAdminRoute)) {
      const targetRole = isCitizenRoute ? 'citizen' : isOfficerRoute ? 'officer' : 'admin';
      return <AuthLoginPage defaultRole={targetRole} />;
    }

    // Role Enforcement: Authenticated users must match the route role
    if (isAuthenticated && activeRole) {
      if (isCitizenRoute && activeRole !== 'citizen') {
        return <AuthLoginPage defaultRole="citizen" />;
      }
      if (isOfficerRoute && activeRole !== 'officer') {
        return <AuthLoginPage defaultRole="officer" />;
      }
      if (isAdminRoute && activeRole !== 'admin') {
        return <AuthLoginPage defaultRole="admin" />;
      }
    }

    // Public Routes
    if (path === '/' || path === '') return <LandingPage />;
    if (path === '/get-started') return <GetStartedPage />;
    if (path === '/features') return <FeaturesPage />;
    if (path === '/how-it-works') return <HowItWorksPage />;
    if (path === '/about') return <AboutPage />;

    // Auth Routes
    if (path === '/auth/login') return <AuthLoginPage />;
    if (path === '/auth/register') return <AuthRegisterPage />;
    if (path === '/auth/reset-password') return <AuthResetPage />;

    // Citizen Routes
    if (path === '/citizen/dashboard') return <CitizenDashboard />;
    if (path === '/citizen/report') return <CitizenReportPage />;
    if (path.startsWith('/citizen/complaints/')) return <CitizenComplaintDetail />;
    if (path === '/citizen/profile') return <CitizenProfilePage />;
    if (path === '/citizen/notifications') return <CitizenNotificationsPage />;

    // Officer Routes
    if (path === '/officer/dashboard') return <OfficerDashboard />;
    if (path.startsWith('/officer/complaints/')) return <OfficerComplaintDetail />;

    // Admin Routes
    if (path === '/admin/dashboard') return <AdminDashboard />;
    if (path === '/admin/map') return <AdminMapPage />;
    if (path === '/admin/insights') return <AdminInsightsPage />;
    if (path.startsWith('/admin/insights/')) return <AdminInsightDetail />;
    if (path === '/admin/alerts') return <AdminAlertsPage />;

    // Legal / Contact Routes
    if (path === '/privacy') return <PrivacyPage />;
    if (path === '/terms') return <TermsPage />;
    if (path === '/contact') return <ContactPage />;

    return <NotFoundPage />;
  };

  // ASK CIVI must be rendered in the DOM ONLY for authenticated citizens inside the Citizen Portal
  const isCitizenPortal = Boolean(
    isAuthenticated && 
    activeRole === 'citizen' && 
    currentPath.startsWith('/citizen')
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      <Header />
      <main className="flex-1">
        {renderRoute()}
      </main>
      <Footer />
      <ToastContainer />
      {isCitizenPortal && <CiviAssistant />}
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}

export default App;
