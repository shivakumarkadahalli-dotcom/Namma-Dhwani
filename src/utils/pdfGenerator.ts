import { RecurringAssetInsight, DepartmentSummary } from '../types';

export function generateExecutiveSummaryPDF(
  departments: DepartmentSummary[],
  recurringAssets: RecurringAssetInsight[],
  stats: {
    activeCount: number;
    resolvedCount: number;
    totalCount: number;
    slaBreaches: number;
    recurringCount: number;
    resolutionRatePct: number;
  }
) {
  let printWindow: Window | null = null;
  try {
    printWindow = window.open('', '_blank', 'width=900,height=800');
  } catch (e) {
    console.warn('Unable to open print window:', e);
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const departmentRows = departments
    .map(
      (dept) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 12px; font-weight: 600; color: #1e293b;">${dept.name}</td>
        <td style="padding: 10px 12px; text-align: center; color: #3b82f6; font-weight: 600;">${dept.active}</td>
        <td style="padding: 10px 12px; text-align: center; color: #10b981; font-weight: 600;">${dept.resolved}</td>
        <td style="padding: 10px 12px; text-align: center; color: #64748b;">${dept.resolutionRate}%</td>
        <td style="padding: 10px 12px; text-align: center; color: ${dept.slaBreaches > 0 ? '#ef4444' : '#10b981'}; font-weight: 600;">${dept.slaBreaches}</td>
        <td style="padding: 10px 12px; text-align: center; color: #f59e0b; font-weight: 600;">${dept.historicalReopened}</td>
        <td style="padding: 10px 12px; text-align: center;">
          <span style="display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; background: ${
            dept.status === 'Stable' ? '#dcfce7; color: #15803d;' : dept.status === 'Critical' ? '#fee2e2; color: #b91c1c;' : '#fef3c7; color: #b45309;'
          }">
            ${dept.status}
          </span>
        </td>
      </tr>
    `
    )
    .join('');

  const recurringRows = recurringAssets
    .map(
      (asset) => `
      <div style="margin-bottom: 16px; padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <div>
            <span style="font-weight: 700; color: #1e40af; font-size: 14px;">${asset.assetId} — ${asset.assetType}</span>
            <span style="margin-left: 8px; color: #64748b; font-size: 12px;">(${asset.locationName}, ${asset.ward})</span>
          </div>
          <span style="background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">
            Risk Score: ${asset.riskScore}/100
          </span>
        </div>
        <div style="font-size: 12px; color: #334155; margin-bottom: 6px;">
          <strong>Historical Complaints:</strong> ${asset.totalComplaints} &nbsp;|&nbsp; 
          <strong>Reopened Cases:</strong> ${asset.reopenedCount} &nbsp;|&nbsp; 
          <strong>Potential Savings:</strong> <span style="color: #15803d; font-weight: 600;">${asset.potentialSavings}</span>
        </div>
        <div style="font-size: 12px; color: #475569; line-height: 1.4;">
          <strong>AI Preventive Recommendation:</strong> ${asset.recommendedFix}
        </div>
      </div>
    `
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>CivicLoop Executive Municipal Operations Report</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            padding: 30px;
            background: #ffffff;
            margin: 0;
          }
          @media print {
            body { padding: 15px; }
            .no-print { display: none; }
          }
          .header-badge {
            background: #eff6ff;
            color: #1d4ed8;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; padding: 12px 18px; background: #1e293b; color: #fff; border-radius: 8px;">
          <div>
            <strong>Municipal Operations Executive Summary (PDF Mode)</strong>
            <div style="font-size: 12px; color: #94a3b8;">Click below to save as PDF or send to municipal printer.</div>
          </div>
          <div>
            <button onclick="window.print()" style="background: #2563eb; color: #fff; border: none; padding: 8px 18px; border-radius: 6px; font-weight: 600; cursor: pointer; margin-right: 8px;">
              Print / Save as PDF
            </button>
            <button onclick="window.close()" style="background: #475569; color: #fff; border: none; padding: 8px 14px; border-radius: 6px; font-weight: 600; cursor: pointer;">
              Close
            </button>
          </div>
        </div>

        <!-- Municipal Header -->
        <div style="border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <span class="header-badge">City Municipal Corporation</span>
            <h1 style="margin: 8px 0 4px 0; font-size: 24px; color: #0f172a; letter-spacing: -0.5px;">CivicLoop City Intelligence Operations Summary</h1>
            <p style="margin: 0; color: #64748b; font-size: 13px;">Automated Cross-Department Grievance & Preventive Infrastructure Report</p>
          </div>
          <div style="text-align: right; font-size: 12px; color: #475569;">
            <div><strong>Report Date:</strong> ${currentDate}</div>
            <div><strong>Report Cycle:</strong> Q3 Real-Time Demo Cycle</div>
            <div><strong>Auth Level:</strong> Executive Municipal Directorate</div>
          </div>
        </div>

        <!-- Citywide Metrics Grid -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px;">
          <div style="padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase;">Active Grievances</div>
            <div style="font-size: 26px; font-weight: 700; color: #2563eb; margin-top: 4px;">${stats.activeCount}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Citywide open cases</div>
          </div>
          <div style="padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase;">SLA Breaches</div>
            <div style="font-size: 26px; font-weight: 700; color: #ef4444; margin-top: 4px;">${stats.slaBreaches}</div>
            <div style="font-size: 11px; color: #ef4444; margin-top: 2px;">Overdue resolution window</div>
          </div>
          <div style="padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase;">Resolution Rate</div>
            <div style="font-size: 26px; font-weight: 700; color: #10b981; margin-top: 4px;">${stats.resolutionRatePct}%</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${stats.resolvedCount} of ${stats.totalCount} total cases</div>
          </div>
          <div style="padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase;">Recurring Issues</div>
            <div style="font-size: 26px; font-weight: 700; color: #f59e0b; margin-top: 4px;">${stats.recurringCount}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Chronic infrastructure nodes</div>
          </div>
        </div>

        <!-- Department Performance Table -->
        <h2 style="font-size: 16px; color: #0f172a; margin: 0 0 12px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
          1. Department Performance & SLA Breakdown
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px;">
          <thead>
            <tr style="background: #f1f5f9; text-align: left; color: #475569;">
              <th style="padding: 10px 12px; font-weight: 600;">Department</th>
              <th style="padding: 10px 12px; text-align: center; font-weight: 600;">Active</th>
              <th style="padding: 10px 12px; text-align: center; font-weight: 600;">Resolved</th>
              <th style="padding: 10px 12px; text-align: center; font-weight: 600;">Rate</th>
              <th style="padding: 10px 12px; text-align: center; font-weight: 600;">SLA Breaches</th>
              <th style="padding: 10px 12px; text-align: center; font-weight: 600;">Reopened</th>
              <th style="padding: 10px 12px; text-align: center; font-weight: 600;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${departmentRows}
          </tbody>
        </table>

        <!-- Recurring Assets Intelligence -->
        <h2 style="font-size: 16px; color: #0f172a; margin: 0 0 12px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
          2. High-Risk Recurring Infrastructure & Preventive Capital Recommendations
        </h2>
        <div>
          ${recurringRows}
        </div>

        <!-- Municipal Sign-off Footer -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; font-size: 12px; color: #64748b;">
          <div>
            Generated securely via <strong>CivicLoop Intelligence Platform</strong>.<br />
            Confidential &amp; Proprietary Municipal Record.
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 600; color: #0f172a;">Dr. Vikram Malhotra</div>
            <div>City Municipal Commissioner</div>
          </div>
        </div>
      </body>
    </html>
  `;

  if (printWindow) {
    try {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (e) {
      console.warn('Failed to write to print window:', e);
    }
  }
}

export function generateRecurringAssetReportPDF(asset: RecurringAssetInsight) {
  let printWindow: Window | null = null;
  try {
    printWindow = window.open('', '_blank', 'width=900,height=850');
  } catch (e) {
    console.warn('Unable to open print window:', e);
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const grievanceRows = asset.linkedGrievances
    .slice(0, 10)
    .map(
      (g, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 12px;">
        <td style="padding: 8px 10px; font-weight: 600; color: #1e40af;">${g.id}</td>
        <td style="padding: 8px 10px; color: #475569;">${g.submittedDate}</td>
        <td style="padding: 8px 10px; color: #0f172a;">${g.title}</td>
        <td style="padding: 8px 10px; color: #64748b;">${g.assignedOfficerName || 'Ward Officer'}</td>
        <td style="padding: 8px 10px; text-align: center;">
          <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600; background: ${
            g.status === 'Resolved' ? '#dcfce7; color: #166534;' : g.status === 'Reopened' ? '#fee2e2; color: #991b1b;' : '#eff6ff; color: #1d4ed8;'
          }">
            ${g.status}
          </span>
        </td>
      </tr>
    `
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>CivicLoop Capital Asset Engineering Report — ${asset.assetId}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            padding: 30px;
            background: #ffffff;
            margin: 0;
          }
          @media print {
            body { padding: 15px; }
            .no-print { display: none; }
          }
          .badge {
            background: #fee2e2;
            color: #b91c1c;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; padding: 12px 18px; background: #1e293b; color: #fff; border-radius: 8px;">
          <div>
            <strong>Capital Infrastructure Engineering Report: ${asset.assetId}</strong>
            <div style="font-size: 12px; color: #94a3b8;">Click below to print or download as PDF.</div>
          </div>
          <div>
            <button onclick="window.print()" style="background: #2563eb; color: #fff; border: none; padding: 8px 18px; border-radius: 6px; font-weight: 600; cursor: pointer; margin-right: 8px;">
              Print / Save as PDF
            </button>
            <button onclick="window.close()" style="background: #475569; color: #fff; border: none; padding: 8px 14px; border-radius: 6px; font-weight: 600; cursor: pointer;">
              Close
            </button>
          </div>
        </div>

        <!-- Header -->
        <div style="border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between;">
          <div>
            <span class="badge">Chronic Failure Node</span>
            <h1 style="margin: 8px 0 4px 0; font-size: 22px; color: #0f172a;">${asset.assetType} — Asset ID: ${asset.assetId}</h1>
            <p style="margin: 0; color: #64748b; font-size: 13px;">${asset.locationName}, ${asset.ward} &bull; ${asset.department}</p>
          </div>
          <div style="text-align: right; font-size: 12px; color: #475569;">
            <div><strong>Report Date:</strong> ${currentDate}</div>
            <div><strong>Risk Score:</strong> <span style="color: #dc2626; font-weight: 700;">${asset.riskScore} / 100</span></div>
            <div><strong>Confidence:</strong> ${asset.confidenceScore}% (Verified AI Analysis)</div>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">
          <div style="padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="font-size: 11px; color: #64748b; font-weight: 600;">TOTAL COMPLAINTS</div>
            <div style="font-size: 22px; font-weight: 700; color: #1e293b; margin-top: 2px;">${asset.totalComplaints}</div>
          </div>
          <div style="padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="font-size: 11px; color: #64748b; font-weight: 600;">REOPENED EVENTS</div>
            <div style="font-size: 22px; font-weight: 700; color: #dc2626; margin-top: 2px;">${asset.reopenedCount}</div>
          </div>
          <div style="padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="font-size: 11px; color: #64748b; font-weight: 600;">PREVENTIVE COST</div>
            <div style="font-size: 22px; font-weight: 700; color: #2563eb; margin-top: 2px;">${asset.estimatedCost}</div>
          </div>
          <div style="padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="font-size: 11px; color: #64748b; font-weight: 600;">POTENTIAL SAVINGS</div>
            <div style="font-size: 22px; font-weight: 700; color: #16a34a; margin-top: 2px;">${asset.potentialSavings.split(' ')[0]}</div>
          </div>
        </div>

        <!-- AI Root Cause Analysis Box -->
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 6px 0; color: #166534; font-size: 14px; font-weight: 700;">AI Root Cause Diagnosis</h3>
          <p style="margin: 0; font-size: 13px; color: #14532d; line-height: 1.5;">${asset.aiRootCause}</p>
        </div>

        <!-- Recommended Preventive Capital Plan -->
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 6px 0; color: #1e40af; font-size: 14px; font-weight: 700;">Recommended Capital Engineering Overhaul</h3>
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #1e3a8a; line-height: 1.5;">${asset.recommendedFix}</p>
          <div style="font-size: 12px; color: #1e40af;">
            <strong>Estimated 3-Yr Reactive Repair Cost:</strong> ${asset.estimatedRecurringCost} &nbsp;|&nbsp;
            <strong>ROI Payback Period:</strong> ${asset.roiPeriod}
          </div>
        </div>

        <!-- Historical Citizen Grievance Trail -->
        <h3 style="font-size: 14px; color: #0f172a; margin: 0 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
          Citizen Grievance Audit Trail (${asset.linkedGrievances.length} Total Linked Cases)
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="background: #f8fafc; text-align: left; font-size: 12px; color: #475569;">
              <th style="padding: 8px 10px;">ID</th>
              <th style="padding: 8px 10px;">Date</th>
              <th style="padding: 8px 10px;">Title</th>
              <th style="padding: 8px 10px;">Assigned Officer</th>
              <th style="padding: 8px 10px; text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${grievanceRows}
          </tbody>
        </table>

        <!-- Sign-off Footer -->
        <div style="margin-top: 30px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 11px; color: #64748b;">
          <div>
            CivicLoop Municipal Intelligence Engine &bull; Automated Infrastructure Risk Audit.
          </div>
          <div>
            Approved for Executive Review &bull; City Engineering Directorate
          </div>
        </div>
      </body>
    </html>
  `;

  if (printWindow) {
    try {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (e) {
      console.warn('Failed to write to print window:', e);
    }
  }
}
