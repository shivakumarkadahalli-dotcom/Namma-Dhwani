import React from 'react';
import { useApp } from '../context/AppContext';
import { Building2, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigate, t } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg tracking-tight font-sans">NammaDhwani</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('footer.desc', 'AI-powered civic grievance resolution intelligence platform creating a closed-loop ecosystem for transparent governance.')}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full w-fit">
              <ShieldCheck className="w-3.5 h-3.5" /> {t('footer.certified', 'ISO 27001 Certified & WCAG 2.1 AA Compliant')}
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-sans">{t('footer.platform', 'Platform')}</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/features')} className="hover:text-white transition-colors cursor-pointer">
                  {t('nav.features', 'Features Overview')}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/how-it-works')} className="hover:text-white transition-colors cursor-pointer">
                  {t('nav.howItWorks', 'How It Works')}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/get-started')} className="hover:text-white transition-colors cursor-pointer">
                  {t('footer.roleWorkspaces', 'Role Workspaces')}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/admin/map')} className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer">
                  {t('footer.cityMap', 'City Intelligence Map')} <ExternalLink className="w-3 h-3 text-slate-500" />
                </button>
              </li>
            </ul>
          </div>

          {/* Roles & Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-sans">{t('footer.ecosystem', 'Ecosystem')}</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/citizen/report')} className="hover:text-white transition-colors cursor-pointer">
                  {t('citizen.reportNew', 'Report a Grievance')}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/citizen/dashboard')} className="hover:text-white transition-colors cursor-pointer">
                  {t('nav.citizenPortal', 'Citizen Portal')}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/officer/dashboard')} className="hover:text-white transition-colors cursor-pointer">
                  {t('nav.officerPortal', 'Officer Priority Queue')}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/admin/insights')} className="hover:text-white transition-colors cursor-pointer">
                  {t('nav.adminPortal', 'Civic Issue Intelligence')}
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Governance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-sans">{t('footer.governance', 'Governance & Support')}</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors cursor-pointer">
                  {t('footer.privacy', 'Privacy Policy')}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/terms')} className="hover:text-white transition-colors cursor-pointer">
                  {t('footer.terms', 'Terms of Service')}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-white transition-colors cursor-pointer">
                  {t('footer.contact', 'Contact & FAQ')}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-white transition-colors cursor-pointer">
                  {t('nav.about', 'About NammaDhwani')}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Partner Cities Strip */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>{t('footer.copyright', '© 2026 NammaDhwani. All rights reserved. Powered by Google AI Studio & AI Intelligence.')}</p>
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <span>{t('footer.builtForCities', 'Built with precision for 50,000+ citizens across 12 smart cities')}</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
          </div>
        </div>
      </div>
    </footer>
  );
};
