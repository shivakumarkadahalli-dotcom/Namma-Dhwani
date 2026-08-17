import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Helper to get Resend instance dynamically
function getResendClient(): { client: Resend | null; fromEmail: string } {
  const apiKey = process.env.RESEND_API_KEY;
  const isConfigured = Boolean(
    apiKey && 
    apiKey !== 're_123456789_your_resend_api_key' && 
    apiKey.startsWith('re_')
  );

  const client = isConfigured ? new Resend(apiKey) : null;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'NammaDhwani <onboarding@resend.dev>';
  
  return { client, fromEmail };
}

export interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
  emailType: 'welcome' | 'complaint_submitted' | 'officer_assigned' | 'resolution_verification' | 'problem_solved' | 'password_reset';
  metadata?: Record<string, any>;
}

export interface SendEmailResult {
  success: boolean;
  resendId?: string;
  simulated?: boolean;
  error?: string;
}

/**
  * Core Dispatcher for Resend Email Platform
  */
export async function sendEmail(payload: SendEmailPayload): Promise<SendEmailResult> {
  const { to, subject, html, emailType, metadata } = payload;
  const { client, fromEmail } = getResendClient();

  // Smart recipient targeting: For Resend testing domain (onboarding@resend.dev),
  // non-verified target emails are auto-directed to the account owner (shivakumarkadahalli@gmail.com)
  const isTestingDomain = fromEmail.includes('onboarding@resend.dev');
  const targetRecipient = (isTestingDomain && (to.includes('@namnadhwani.gov.in') || to.includes('@civicloop.demo')))
    ? 'shivakumarkadahalli@gmail.com'
    : to;

  console.log(`[Resend Email Service] Preparing dispatch for type "${emailType}" to "${targetRecipient}" (Original target: "${to}")`);

  if (!client) {
    console.log(`[Resend Email Service - Local Fallback Mode]`);
    console.log(`  📧 TO: ${targetRecipient}`);
    console.log(`  📋 SUBJECT: ${subject}`);
    console.log(`  ⚡ TYPE: ${emailType}`);
    console.log(`  ℹ️ RESEND_API_KEY not configured. Simulated dispatch recorded.`);

    return {
      success: true,
      simulated: true,
      resendId: `sim_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    };
  }

  try {
    let data = await client.emails.send({
      from: fromEmail,
      to: targetRecipient,
      subject: `[${emailType.toUpperCase()}] ${subject}`,
      html,
    });

    // If Resend returns a testing domain restriction error, retry with the verified owner address
    if (data.error && data.error.message?.includes('testing emails to your own email address')) {
      console.warn(`[Resend Testing Domain Redirect] Retrying dispatch to shivakumarkadahalli@gmail.com`);
      data = await client.emails.send({
        from: fromEmail,
        to: 'shivakumarkadahalli@gmail.com',
        subject: `[${emailType.toUpperCase()}] ${subject}`,
        html,
      });
    }

    if (data.error) {
      console.error(`[Resend Email Error]:`, data.error);
      return {
        success: false,
        error: data.error.message || 'Failed to dispatch email via Resend API',
      };
    }

    console.log(`[Resend Email Success] Dispatched ID: ${data.data?.id} to ${targetRecipient}`);
    return {
      success: true,
      resendId: data.data?.id,
    };
  } catch (error: any) {
    console.error(`[Resend Email Exception]:`, error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred during email dispatch',
    };
  }
}

// ==============================================================================
// EMAIL TEMPLATES WITH NAMMADHWANI BRANDING
// ==============================================================================

const BRAND_HEADER = `
  <div style="background-color: #0f172a; padding: 24px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;">
    <h1 style="color: #ffffff; margin: 0; font-family: 'Inter', system-ui, sans-serif; font-size: 24px; font-weight: 800; tracking: -0.5px;">
      NammaDhwani <span style="color: #3b82f6; font-weight: 400;">Civic Intelligence</span>
    </h1>
    <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px; font-weight: 500;">
      Official Municipal Grievance & Resolution Platform
    </p>
  </div>
`;

const BRAND_FOOTER = `
  <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; border-top: 1px solid #e2e8f0; margin-top: 24px;">
    <p style="color: #64748b; font-size: 12px; margin: 0;">
      NammaDhwani AI Municipal Corporation • Closed-Loop Civic Intelligence Ecosystem
    </p>
    <p style="color: #94a3b8; font-size: 11px; margin: 6px 0 0 0;">
      This is an automated notification. Please do not reply directly to this email.
    </p>
  </div>
`;

/**
  * 1. Welcome Email (New Citizen Registration)
  */
export async function sendWelcomeEmail(to: string, name: string): Promise<SendEmailResult> {
  const subject = `Welcome to NammaDhwani — Voice Your Civic Grievances`;
  const html = `
    <div style="font-family: 'Roboto', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      ${BRAND_HEADER}
      <div style="padding: 32px 24px; color: #334155;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Welcome, ${name}! 👋</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #475569;">
          Thank you for registering on <strong>NammaDhwani</strong>. You are now empowered with AI-driven civic reporting that ensures direct accountability, automated SLA tracking, and real-time resolution verification.
        </p>
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 4px;">
          <h4 style="margin: 0 0 8px 0; color: #1e40af; font-size: 15px;">What you can do next:</h4>
          <ul style="margin: 0; padding-left: 20px; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
            <li>Report potholes, streetlights, garbage, water leaks, or drainage issues in seconds.</li>
            <li>Talk to <strong>DhwaniSaathi AI</strong> to auto-classify your grievances.</li>
            <li>Track live officer assignment and SLA resolution timelines.</li>
            <li>Verify resolution evidence before complaints are officially closed.</li>
          </ul>
        </div>
      </div>
      ${BRAND_FOOTER}
    </div>
  `;

  return sendEmail({ to, subject, html, emailType: 'welcome', metadata: { name } });
}

/**
  * 2. Complaint Submitted Confirmation Email
  */
export async function sendComplaintSubmittedEmail(params: {
  to: string;
  citizenName: string;
  complaintId: string;
  title: string;
  department: string;
  severity: string;
  priorityScore: number;
  slaHours: number;
  trackingUrl: string;
}): Promise<SendEmailResult> {
  const { to, citizenName, complaintId, title, department, severity, priorityScore, slaHours, trackingUrl } = params;
  const subject = `[${complaintId}] Grievance Registered: ${title}`;

  const severityColor = severity === 'Critical' ? '#ef4444' : severity === 'High' ? '#f97316' : '#3b82f6';

  const html = `
    <div style="font-family: 'Roboto', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      ${BRAND_HEADER}
      <div style="padding: 32px 24px; color: #334155;">
        <div style="display: inline-block; background-color: #f1f5f9; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 16px;">
          Reference ID: <span style="color: #0f172a;">${complaintId}</span>
        </div>
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Grievance Successfully Submitted</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #475569;">
          Dear ${citizenName}, your civic complaint has been registered and analyzed by NammaDhwani AI. It has been routed to the appropriate municipal department for immediate response.
        </p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #64748b; font-size: 13px;">Issue Title</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a; font-size: 14px;">${title}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #64748b; font-size: 13px;">Department</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a; font-size: 14px;">${department}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #64748b; font-size: 13px;">Severity / Priority</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px;">
              <span style="color: ${severityColor}; font-weight: 700;">${severity}</span> (Score: ${priorityScore}/100)
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-weight: 600; color: #64748b; font-size: 13px;">Target SLA Resolution</td>
            <td style="padding: 12px 16px; font-weight: 700; color: #059669; font-size: 14px;">Within ${slaHours} Hours</td>
          </tr>
        </table>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${trackingUrl}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">
            Track Complaint Live
          </a>
        </div>
      </div>
      ${BRAND_FOOTER}
    </div>
  `;

  return sendEmail({ to, subject, html, emailType: 'complaint_submitted', metadata: { complaintId, title } });
}

/**
  * 3. Officer Assignment Notification Email
  */
export async function sendOfficerAssignmentEmail(params: {
  to: string;
  officerName: string;
  complaintId: string;
  title: string;
  department: string;
  ward: string;
  severity: string;
  priorityScore: number;
  portalUrl: string;
}): Promise<SendEmailResult> {
  const { to, officerName, complaintId, title, department, ward, severity, priorityScore, portalUrl } = params;
  const subject = `[ACTION REQUIRED] New High Priority Assignment: ${complaintId}`;

  const html = `
    <div style="font-family: 'Roboto', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      ${BRAND_HEADER}
      <div style="padding: 32px 24px; color: #334155;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Grievance Assigned to Your Duty Queue</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #475569;">
          Officer ${officerName}, a new civic grievance in <strong>${ward}</strong> has been auto-assigned to you based on your duty location and current availability.
        </p>

        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <h4 style="margin: 0 0 4px 0; color: #991b1b; font-size: 15px;">Grievance Details [${complaintId}]:</h4>
          <p style="margin: 0; color: #7f1d1d; font-size: 14px; font-weight: 600;">${title}</p>
          <p style="margin: 4px 0 0 0; color: #991b1b; font-size: 13px;">Department: ${department} • Severity: <strong>${severity}</strong> (Priority: ${priorityScore}/100)</p>
        </div>

        <div style="text-align: center; margin: 28px 0 16px 0;">
          <a href="${portalUrl}" style="background-color: #0f172a; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">
            Open Officer Workspace
          </a>
        </div>
      </div>
      ${BRAND_FOOTER}
    </div>
  `;

  return sendEmail({ to, subject, html, emailType: 'officer_assigned', metadata: { complaintId, officerName } });
}

/**
  * 4. Resolution Evidence Verification Request Email (Sent to Citizen)
  */
export async function sendResolutionVerificationEmail(params: {
  to: string;
  citizenName: string;
  complaintId: string;
  title: string;
  officerName: string;
  resolutionNotes: string;
  verificationUrl: string;
}): Promise<SendEmailResult> {
  const { to, citizenName, complaintId, title, officerName, resolutionNotes, verificationUrl } = params;
  const subject = `[${complaintId}] Resolution Evidence Uploaded — Please Confirm Work`;

  const html = `
    <div style="font-family: 'Roboto', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      ${BRAND_HEADER}
      <div style="padding: 32px 24px; color: #334155;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Officer Completed Field Work</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #475569;">
          Dear ${citizenName}, officer <strong>${officerName}</strong> has submitted work completion notes and after-photo evidence for your grievance <strong>${complaintId} (${title})</strong>.
        </p>

        <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <h4 style="margin: 0 0 4px 0; color: #14532d; font-size: 14px;">Officer Resolution Note:</h4>
          <p style="margin: 0; color: #166534; font-size: 14px; font-style: italic;">"${resolutionNotes}"</p>
        </div>

        <p style="font-size: 14px; color: #475569; line-height: 1.5;">
          Please inspect the work or after-photo evidence to confirm if your issue is fully fixed. NammaDhwani guarantees that complaints are only closed when confirmed by citizens.
        </p>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${verificationUrl}" style="background-color: #16a34a; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">
            Verify Work & Provide Feedback
          </a>
        </div>
      </div>
      ${BRAND_FOOTER}
    </div>
  `;

  return sendEmail({ to, subject, html, emailType: 'resolution_verification', metadata: { complaintId, citizenName } });
}

/**
  * 5. Problem Solved & Verified Email (Sent to Citizen when grievance is confirmed resolved)
  */
export async function sendProblemSolvedEmail(params: {
  to: string;
  citizenName: string;
  complaintId: string;
  title: string;
  resolutionNotes?: string;
  trackingUrl: string;
}): Promise<SendEmailResult> {
  const { to, citizenName, complaintId, title, resolutionNotes, trackingUrl } = params;
  const subject = `🎉 [${complaintId}] Your Civic Issue Has Been Resolved!`;

  const html = `
    <div style="font-family: 'Roboto', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      ${BRAND_HEADER}
      <div style="padding: 32px 24px; color: #334155;">
        <div style="display: inline-block; background-color: #dcfce7; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; color: #15803d; margin-bottom: 16px;">
          ✅ Status: RESOLVED
        </div>
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 800;">Your Reported Issue Has Been Fixed!</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #475569;">
          Dear ${citizenName}, we are pleased to inform you that your civic grievance <strong>${complaintId}</strong> (<em>${title}</em>) has been marked as <strong>Fully Resolved</strong>.
        </p>

        ${resolutionNotes ? `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h4 style="margin: 0 0 6px 0; color: #0f172a; font-size: 13px; font-weight: 700;">Resolution Details:</h4>
          <p style="margin: 0; color: #475569; font-size: 14px; font-style: italic;">"${resolutionNotes}"</p>
        </div>
        ` : ''}

        <p style="font-size: 14px; color: #475569; line-height: 1.5;">
          Thank you for taking an active role in improving your community. Your report contributed directly to municipal action and urban safety.
        </p>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${trackingUrl}" style="background-color: #16a34a; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 15px; display: inline-block;">
            View Closed Case Details
          </a>
        </div>
      </div>
      ${BRAND_FOOTER}
    </div>
  `;

  return sendEmail({ to, subject, html, emailType: 'problem_solved', metadata: { complaintId, citizenName } });
}

/**
  * 6. Password Reset Email
  */
export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<SendEmailResult> {
  const subject = `Reset Your NammaDhwani Password`;

  const html = `
    <div style="font-family: 'Roboto', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      ${BRAND_HEADER}
      <div style="padding: 32px 24px; color: #334155;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Password Reset Request</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #475569;">
          We received a request to reset your password for your NammaDhwani account. Click the button below to specify a new password:
        </p>

        <div style="text-align: center; margin: 32px 0 24px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 13px; color: #94a3b8;">
          If you did not request a password reset, you can safely ignore this email.
        </p>
      </div>
      ${BRAND_FOOTER}
    </div>
  `;

  return sendEmail({ to, subject, html, emailType: 'password_reset' });
}
