import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapComponent } from '../components/MapComponent';
import { GrievanceLifecycleModal } from '../components/GrievanceLifecycleModal';
import { Complaint } from '../types';
import { ArrowLeft, Sparkles, Download, Wrench, AlertTriangle, ChevronRight, CheckCircle2, Clock } from 'lucide-react';

export const AdminInsightDetail: React.FC = () => {
  const { recurringAssets, complaints, navigate, showToast } = useApp();

  const pathParts = window.location.pathname.split('/');
  const assetId = pathParts[pathParts.length - 1];

  const asset = recurringAssets.find(a => a.id === assetId) || recurringAssets[0];
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  if (!asset) {
    return (
      <div className="p-12 text-center text-slate-500 font-sans">
        Asset record not found.
      </div>
    );
  }

  // Linked grievances derived dynamically from central dataset
  const linkedGrievances = complaints.filter(c => c.assetId === asset.id);
  const reopenedGrievances = linkedGrievances.filter(c => c.status === 'Reopened' || (c.reopenedCount && c.reopenedCount > 0));

  const handleExportProposal = () => {
    const printWindow = window.open('', '_blank', 'width=850,height=800');
    if (!printWindow) {
      showToast('Popup Blocked', 'Please allow popups to view proposal document.', 'warning');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Municipal Capital Work Proposal — ${asset.assetId}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 30px; color: #0f172a; line-height: 1.5; }
            h1 { font-size: 20px; color: #1e3a8a; margin-bottom: 4px; }
            .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; background: #fee2e2; color: #991b1b; font-size: 11px; font-weight: bold; }
            .section { margin-top: 20px; padding: 15px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; }
            .section-title { font-size: 13px; font-weight: bold; text-transform: uppercase; color: #334155; margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
            th { background: #f1f5f9; }
          </style>
        </head>
        <body>
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 2px solid #cbd5e1; padding-bottom: 12px;">
            <div>
              <div style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase;">CivicLoop Smart City Intelligence</div>
              <h1>Capital Infrastructure Overhaul Proposal</h1>
              <div style="font-size: 13px; color: #475569;">${asset.assetType} — ${asset.locationName} (${asset.ward})</div>
            </div>
            <span class="badge">RISK SCORE ${asset.riskScore}/100</span>
          </div>

          <div class="section">
            <div class="section-title">1. Root Cause Engineering Diagnosis</div>
            <p style="font-size: 13px; margin: 0;">${asset.aiRootCause}</p>
          </div>

          <div class="section">
            <div class="section-title">2. Recommended Capital Preventive Solution</div>
            <p style="font-size: 13px; margin: 0;">${asset.recommendedFix}</p>
          </div>

          <div class="section">
            <div class="section-title">3. Financial & ROI Comparison</div>
            <table>
              <tr><th>Metric</th><th>Amount / Period</th></tr>
              <tr><td>Estimated Capital Outlay</td><td><strong>${asset.estimatedCost}</strong></td></tr>
              <tr><td>Cumulative Reactive Repair Expense</td><td><span style="color:#dc2626;">${asset.estimatedRecurringCost}</span></td></tr>
              <tr><td>Projected Net Municipal Savings</td><td><span style="color:#16a34a; font-weight:bold;">${asset.potentialSavings}</span></td></tr>
              <tr><td>Payback Breakeven Horizon</td><td><strong>${asset.roiPeriod}</strong></td></tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">4. Historical Recurrence & Linked Citizen Grievances (${linkedGrievances.length} Records)</div>
            <table>
              <tr><th>Grievance ID</th><th>Title</th><th>Status</th><th>Assigned Officer</th></tr>
              ${linkedGrievances.map(g => `
                <tr>
                  <td>${g.id}</td>
                  <td>${g.title}</td>
                  <td>${g.status}</td>
                  <td>${g.assignedOfficerName || 'Assigned'}</td>
                </tr>
              `).join('')}
            </table>
          </div>

          <div style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 8px 16px; font-size: 13px; font-weight: bold; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer;">Print Proposal</button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    showToast('Proposal Exported', 'Capital proposal document generated successfully.', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      
      {/* Top Bar */}
      <div className="bg-slate-900 text-white py-6 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => navigate('/admin/insights')}
            className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Asset Insights</span>
          </button>

          <span className="text-xs font-mono bg-slate-800 border border-slate-700 px-3 py-1 rounded-md text-amber-300">
            ASSET RECORD: {asset.id}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Asset Header */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="px-3 py-1 bg-rose-100 text-rose-800 font-extrabold text-xs rounded-md">
              RECURRENCE RISK SCORE {asset.riskScore}/100
            </span>
            <span className="text-xs text-slate-500 font-bold">
              {asset.ward} • Last Inspected {new Date(asset.lastInspected).toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-sans">
            {asset.assetType} — {asset.locationName}
          </h1>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-bold text-[10px] block">LINKED COMPLAINTS</span>
              <span className="text-lg font-bold text-slate-900">{linkedGrievances.length} Reports</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-bold text-[10px] block">REOPENED CASES</span>
              <span className="text-lg font-bold text-rose-600">{reopenedGrievances.length} Times</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-bold text-[10px] block">ESTIMATED CAPITAL FIX</span>
              <span className="text-lg font-bold text-blue-600">{asset.estimatedCost}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-bold text-[10px] block">ROI PAYBACK WINDOW</span>
              <span className="text-lg font-bold text-emerald-600">{asset.roiPeriod}</span>
            </div>
          </div>
        </div>

        {/* Deep Analysis & Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-6">
            
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl space-y-3">
              <h3 className="font-bold text-amber-950 text-sm font-sans flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                AI Deep Diagnosis & Failure Mechanics
              </h3>
              <p className="text-xs text-amber-900 leading-relaxed font-sans">
                {asset.aiRootCause}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl space-y-3">
              <h3 className="font-bold text-blue-950 text-sm font-sans flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                Preventive Capital Action Plan
              </h3>
              <p className="text-xs text-blue-900 leading-relaxed font-sans">
                {asset.recommendedFix}
              </p>
            </div>

            {/* Linked Grievances Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-sans">
                  Linked Citizen Grievance Records ({linkedGrievances.length})
                </h3>
                <span className="text-[11px] text-slate-500 font-bold">
                  Click to inspect grievance lifecycle
                </span>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                {linkedGrievances.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    No individual grievances currently linked to this node.
                  </div>
                ) : (
                  linkedGrievances.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedComplaint(c)}
                      className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-700">{c.id}</span>
                          <span className="text-slate-300">•</span>
                          <span className={`px-2 py-0.2 rounded-md font-bold text-[10px] ${
                            c.status === 'Resolved' || c.status === 'Closed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.status === 'Reopened'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {c.status}
                          </span>
                          <span className="text-slate-500 text-[11px]">{c.submittedDate}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-xs">{c.title}</h4>
                        <p className="text-[11px] text-slate-500">{c.location.address}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <span className="text-[10px] text-slate-400 font-bold block">ASSIGNED TO</span>
                          <span className="font-bold text-slate-800">{c.assignedOfficerName || 'Officer'}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedComplaint(c);
                          }}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Inspect
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Repair & Reopening Timeline */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-sans">
                Maintenance & Reopening Log
              </h3>
              <div className="space-y-3 text-xs">
                {asset.repairHistory.map((rep, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 block">{rep.action}</span>
                      <span className="text-[11px] text-slate-500">{rep.date}</span>
                    </div>
                    <span className="font-bold text-slate-700 bg-white px-2 py-1 rounded-md border border-slate-200">
                      {rep.cost}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans">
                Asset GIS Location
              </h3>
              <MapComponent
                recurringAssets={[asset]}
                center={[asset.lat, asset.lng]}
                zoom={15}
                height="240px"
              />
            </div>

            <button
              onClick={handleExportProposal}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" /> Export Municipal Capital Proposal
            </button>
          </div>

        </div>

      </div>

      {/* Grievance Lifecycle Detail Modal */}
      <GrievanceLifecycleModal
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
      />

    </div>
  );
};
