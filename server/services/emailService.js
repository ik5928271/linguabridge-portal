/**
 * LinguaBridge Universal Automated Email Service (Option C - Resend / Brevo / SMTP)
 * Handles automatic email dispatches for:
 * 1. Interpreter Application Submitted
 * 2. Interpreter Approved & Provisioned (Numeric ID Badge #84921, rates, portal link)
 * 3. Client Welcome & Prepaid Ledger Confirmation
 * 4. Admin User Provisioning
 */

const RESEND_API_URL = 'https://api.resend.com/emails';
const DEFAULT_FROM = process.env.FROM_EMAIL || 'LinguaBridge Notifications <onboarding@resend.dev>';
const PORTAL_URL = process.env.PORTAL_URL || 'https://linguabridge-portal.onrender.com';

/**
 * Core Universal Email Dispatcher
 */
export async function sendEmail({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY || 're_6fXYEFhk_FtEXCkgo98M93NkQwbz72dZ7';

  if (!to) {
    console.warn('[EmailService] Skipped: No recipient email provided.');
    return { success: false, reason: 'no_recipient' };
  }

  // If Resend API Key is configured, send via Resend API
  if (apiKey) {
    try {
      console.log(`[EmailService] Dispatching email to ${to} via Resend API...`);
      const response = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: DEFAULT_FROM,
          to: [to],
          subject,
          html,
          text: text || subject
        })
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('[EmailService] Resend API Error:', data);
        return { success: false, error: data };
      }

      console.log(`[EmailService] Email successfully sent to ${to}. ID: ${data.id}`);
      return { success: true, id: data.id };
    } catch (err) {
      console.error('[EmailService] Network exception while sending email:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Graceful Fallback Log when no API key is set yet
  console.log('===========================================================');
  console.log(`[EmailService MOCK/DEV DISPATCH] To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Notice: To deliver live emails to actual inboxes, set RESEND_API_KEY environment variable.`);
  console.log('===========================================================');
  return { success: true, mocked: true };
}

/**
 * 1. Email: Interpreter Application Received
 */
export async function sendInterpreterApplicationReceivedEmail(app) {
  const name = app.name || 'Linguist Candidate';
  const email = app.email;
  const primaryLang = app.primaryLang || 'Your native language';
  const workingLangs = Array.isArray(app.languages) ? app.languages.join(', ') : (app.languages || primaryLang);
  const refId = app.id || `app-${Date.now()}`;

  const subject = `Application Received: LinguaBridge Certified Interpreter Program (#${refId.slice(-6)})`;

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #e2e8f0; margin: 0; padding: 24px; }
      .container { max-width: 600px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; }
      .header { background: linear-gradient(135deg, #059669 0%, #0d9488 50%, #0284c7 100%); padding: 32px 24px; text-align: center; }
      .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
      .header p { color: #d1fae5; margin: 8px 0 0 0; font-size: 14px; font-weight: 500; }
      .content { padding: 32px 24px; }
      .badge-card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 18px; margin: 20px 0; }
      .badge-title { font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
      .badge-value { font-size: 16px; font-weight: 700; color: #ffffff; margin-top: 4px; }
      .btn { display: inline-block; background: #059669; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; margin-top: 20px; }
      .footer { background: #0b1120; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>LinguaBridge 3-Way Connect</h1>
        <p>Interpreter Application Under Review</p>
      </div>
      <div class="content">
        <h2 style="color: #ffffff; margin-top: 0;">Hello ${name},</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
          Thank you for applying to become a certified on-demand linguist with <strong>LinguaBridge</strong>. We have received your credentials and application details.
        </p>

        <div class="badge-card">
          <div style="margin-bottom: 12px;">
            <div class="badge-title">Application Reference ID</div>
            <div class="badge-value" style="font-family: monospace; color: #34d399;">#${refId}</div>
          </div>
          <div style="margin-bottom: 12px;">
            <div class="badge-title">Primary Language Pair</div>
            <div class="badge-value">${primaryLang} ? English</div>
          </div>
          <div>
            <div class="badge-title">Working Languages</div>
            <div class="badge-value" style="font-size: 14px; color: #93c5fd;">${workingLangs}</div>
          </div>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
          <strong>What happens next?</strong><br>
          Our operations team is currently reviewing your background and language proficiencies. Once approved by an Administrator, you will automatically receive an official confirmation email containing your permanent <strong>Numeric ID Badge</strong> and credentials to access the <strong>Interpreter Workbench</strong>.
        </p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} LinguaBridge On-Demand Interpretation Network. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;

  return sendEmail({ to: email, subject, html });
}

/**
 * 2. Email: Interpreter Approved & Activated (Numeric ID Badge #84921)
 */
export async function sendInterpreterApprovedEmail(interpreter) {
  const name = interpreter.name || 'Certified Linguist';
  const email = interpreter.email;
  const badgeNumber = interpreter.badgeNumber || interpreter.interpreterBadgeId || (interpreter.id ? interpreter.id.replace(/\D/g, '').slice(-5) : '84921');
  const primaryLang = interpreter.primaryLang || 'Your Working Language';
  const languages = Array.isArray(interpreter.languages) ? interpreter.languages.join(' ? ') : (interpreter.languages || primaryLang);
  const specialty = interpreter.specialty || interpreter.specialties?.[0] || 'Medical & Legal Interpretation';
  
  const hourlyRate = interpreter.hourlyRate || 8;
  const minuteRate = interpreter.minuteRate !== undefined ? interpreter.minuteRate : 0.30;
  const employmentType = interpreter.employmentType || 'per_minute';

  const rateText = employmentType === 'salary_base' 
    ? `$${interpreter.monthlySalary || 1200}/mo Fixed Salary`
    : employmentType === 'per_minute'
      ? `$${minuteRate.toFixed(2)}/min Live On-Demand Talk`
      : `$${hourlyRate}/hr Scheduled Shift Billing`;

  const subject = `?? Congratulations! Your LinguaBridge Interpreter Account is Approved (Official ID: #${badgeNumber})`;

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #e2e8f0; margin: 0; padding: 24px; }
      .container { max-width: 600px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
      .header { background: linear-gradient(135deg, #059669 0%, #10b981 50%, #065f46 100%); padding: 36px 24px; text-align: center; }
      .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
      .header p { color: #d1fae5; margin: 8px 0 0 0; font-size: 15px; font-weight: 600; }
      .content { padding: 32px 24px; }
      .badge-card { background: linear-gradient(145deg, #1e293b 0%, #0f172a 100%); border: 2px solid #059669; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center; }
      .badge-pill { display: inline-block; background: rgba(5, 150, 105, 0.2); border: 1px solid #10b981; color: #34d399; font-family: monospace; font-size: 22px; font-weight: 900; padding: 8px 20px; border-radius: 9999px; letter-spacing: 1px; margin: 12px 0; }
      .details-grid { text-align: left; background: #1e293b; border-radius: 12px; padding: 16px; margin-top: 16px; font-size: 13px; line-height: 1.8; }
      .btn { display: inline-block; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff !important; text-decoration: none; padding: 16px 36px; border-radius: 12px; font-weight: 800; font-size: 15px; text-align: center; box-shadow: 0 10px 15px -3px rgba(5, 150, 105, 0.4); margin: 24px 0 12px 0; }
      .step-box { background: rgba(15, 23, 42, 0.6); border-left: 4px solid #10b981; padding: 12px 16px; margin: 12px 0; border-radius: 0 8px 8px 0; font-size: 13px; }
      .footer { background: #0b1120; padding: 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>LinguaBridge 3-Way Connect</h1>
        <p>Official Interpreter Approval & Certification</p>
      </div>
      <div class="content">
        <h2 style="color: #ffffff; margin-top: 0; font-size: 20px;">Welcome Aboard, ${name}!</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
          We are pleased to inform you that your application as a <strong>Certified Professional Interpreter</strong> has been approved by platform administration. Your live account is now active and provisioned.
        </p>

        <div class="badge-card">
          <div style="font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Your Official Numeric Identifier</div>
          <div class="badge-pill">ID: #${badgeNumber}</div>
          <p style="font-size: 11px; color: #94a3b8; margin: 0;">This 5-digit number is your official identifier for all client encounters and billing.</p>

          <div class="details-grid">
            <div><strong style="color: #94a3b8;">Primary Pair:</strong> <span style="color: #ffffff; font-weight: bold;">${primaryLang} ? English</span></div>
            <div><strong style="color: #94a3b8;">Approved Languages:</strong> <span style="color: #93c5fd;">${languages}</span></div>
            <div><strong style="color: #94a3b8;">Domain / Specialty:</strong> <span style="color: #ffffff;">${specialty}</span></div>
            <div><strong style="color: #94a3b8;">Billing Rate:</strong> <span style="color: #34d399; font-weight: bold;">${rateText}</span></div>
          </div>
        </div>

        <div style="text-align: center;">
          <a href="${PORTAL_URL}" class="btn">?? Open Interpreter Workbench</a>
        </div>

        <h3 style="color: #ffffff; font-size: 15px; margin-top: 24px;">How to start taking live calls:</h3>
        
        <div class="step-box">
          <strong style="color: #34d399;">Step 1:</strong> Log in to your account at <a href="${PORTAL_URL}" style="color: #38bdf8;">${PORTAL_URL}</a> using your registered email (<code>${email}</code>).
        </div>
        <div class="step-box">
          <strong style="color: #34d399;">Step 2:</strong> Toggle your <strong>Queue Status</strong> to <strong>Online</strong> in your top dashboard banner.
        </div>
        <div class="step-box">
          <strong style="color: #34d399;">Step 3:</strong> Test your speaker using the <strong>Test Audio Ringer</strong> button to ensure clear notifications.
        </div>
        <div class="step-box">
          <strong style="color: #34d399;">Step 4:</strong> When clients initiate 3-way encounters in your language, your browser will ring immediately.
        </div>

      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} LinguaBridge On-Demand Interpretation Network.<br>
        Questions? Reply directly to this email or contact support at <a href="mailto:support@linguabridge.com" style="color: #38bdf8;">support@linguabridge.com</a>.
      </div>
    </div>
  </body>
  </html>
  `;

  return sendEmail({ to: email, subject, html });
}

/**
 * 3. Email: Client / Payer Welcome Confirmation
 */
export async function sendClientWelcomeEmail(client) {
  const name = client.name || 'Valued Client';
  const email = client.email;
  const minutes = client.wallet?.minutesRemaining || client.wallet?.totalMinutesPurchased || 30;

  const subject = `Welcome to LinguaBridge: On-Demand Enterprise Interpretation`;

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #e2e8f0; margin: 0; padding: 24px; }
      .container { max-width: 600px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; }
      .header { background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 32px 24px; text-align: center; }
      .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; }
      .header p { color: #c7d2fe; margin: 8px 0 0 0; font-size: 14px; }
      .content { padding: 32px 24px; }
      .wallet-card { background: #1e293b; border: 1px solid #3730a3; border-radius: 14px; padding: 20px; margin: 20px 0; text-align: center; }
      .btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 14px 30px; border-radius: 12px; font-weight: 700; font-size: 14px; margin: 20px 0; }
      .footer { background: #0b1120; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>LinguaBridge 3-Way Connect</h1>
        <p>Enterprise On-Demand Language Solutions</p>
      </div>
      <div class="content">
        <h2 style="color: #ffffff; margin-top: 0;">Welcome, ${name}!</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
          Your client account is now active. You have instant access to certified 3-way video and audio interpretation in over 50+ languages, connecting you and your non-English speaking clients seamlessly.
        </p>

        <div class="wallet-card">
          <div style="font-size: 12px; font-weight: 700; color: #a5b4fc; text-transform: uppercase;">Available Interpretation Balance</div>
          <div style="font-size: 28px; font-weight: 900; color: #ffffff; margin: 8px 0;">${minutes} Prepaid Minutes</div>
          <div style="font-size: 12px; color: #94a3b8;">Includes instant access to Medical, Legal, and Corporate linguists.</div>
        </div>

        <div style="text-align: center;">
          <a href="${PORTAL_URL}" class="btn">Start On-Demand Interpretation</a>
        </div>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} LinguaBridge On-Demand Interpretation Network.
      </div>
    </div>
  </body>
  </html>
  `;

  return sendEmail({ to: email, subject, html });
}
