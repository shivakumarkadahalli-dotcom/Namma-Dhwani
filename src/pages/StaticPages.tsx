import React from 'react';

export const PrivacyPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 font-sans space-y-6">
    <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
      At CivicLoop, we protect citizen privacy and secure location telemetry. Personal identifying details (PII) are stored with ISO 27001-compliant encryption and accessed solely for municipal grievance dispatch.
    </p>
  </div>
);

export const TermsPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 font-sans space-y-6">
    <h1 className="text-3xl font-extrabold text-slate-900">Terms of Service</h1>
    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
      CivicLoop provides an AI-assisted platform for civic grievance reporting. Users agree to submit truthful evidence photos and location tags.
    </p>
  </div>
);

export const ContactPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 font-sans space-y-6">
    <h1 className="text-3xl font-extrabold text-slate-900">Contact & Support</h1>
    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
      Need help or municipal partnership inquiries? Email support@civicloop.gov.in or reach out to your local Ward Council Office.
    </p>
  </div>
);

export const NotFoundPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-24 text-center font-sans space-y-4">
    <h1 className="text-5xl font-extrabold text-slate-900">404</h1>
    <p className="text-slate-600 text-sm">The requested page or grievance route was not found.</p>
    <a href="/" className="inline-block px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl">
      Return Home
    </a>
  </div>
);
