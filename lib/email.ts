import nodemailer from "nodemailer";

// SMTP Configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
  secure: process.env.EMAIL_SERVER_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

const MAX_RETRIES = 3;
const FROM_EMAIL =
  process.env.EMAIL_FROM || '"Trade-Diary" <noreply@trade-diary.com>';

/**
 * Helper function to send emails with retry logic
 */
async function sendEmailWithRetry(
  mailOptions: nodemailer.SendMailOptions,
): Promise<boolean> {
  let attempts = 0;
  while (attempts < MAX_RETRIES) {
    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      attempts++;
      console.error(`Email send attempt ${attempts} failed:`, error);
      if (attempts >= MAX_RETRIES) {
        console.error("Max retries reached. Email failed to send.");
        return false;
      }
      // Simple backoff: 1s, 2s, 3s
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
    }
  }
  return false;
}

/**
 * Base HTML Template for consistency and mobile responsiveness
 */
const getBaseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 10px !important; }
      .content { padding: 15px !important; }
    }
  </style>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #374151; background-color: #f3f4f6; margin: 0; padding: 0;">
  <div class="container" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #2563eb; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Trade-Diary</h1>
    </div>
    
    <!-- Main Content -->
    <div class="content" style="background-color: #ffffff; padding: 32px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
      ${content}
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #9ca3af;">
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} Trade-Diary. All rights reserved.</p>
      <p style="margin: 4px 0 0 0;">This is an automated message, please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Send Verification Email with OTP
 */
export async function sendVerificationEmail(
  email: string,
  code: string,
): Promise<boolean> {
  const content = `
    <h2 style="margin-top: 0; color: #111827; font-size: 20px;">Verify Your Account</h2>
    <p style="margin-bottom: 24px;">Thanks for joining Trade-Diary! Please use the following code to complete your registration:</p>
    
    <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
      <span style="font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 4px; color: #2563eb;">${code}</span>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">This code will expire in 30 minutes. If you didn't request this, you can safely ignore this email.</p>
  `;

  return sendEmailWithRetry({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify Your TradeLog Account",
    html: getBaseTemplate(content),
    text: `Your verification code is: ${code}. It expires in 30 minutes.`,
  });
}

/**
 * Send Password Reset Email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
): Promise<boolean> {
  const content = `
    <h2 style="margin-top: 0; color: #111827; font-size: 20px;">Reset Your Password</h2>
    <p style="margin-bottom: 24px;">We received a request to reset your password for your Trade-Diary account. Click the button below to proceed:</p>
    
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${resetUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 6px;">Reset Password</a>
    </div>
    
    <p style="margin-bottom: 24px;">Or copy and paste this link into your browser:</p>
    <p style="margin-bottom: 24px; word-break: break-all; font-size: 14px; color: #2563eb;">
      <a href="${resetUrl}" style="color: #2563eb; text-decoration: none;">${resetUrl}</a>
    </p>
    
    <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 24px;">
      <p style="font-size: 13px; color: #ef4444; margin: 0;"><strong>Security Notice:</strong> This link expires in 1 hour. If you didn't request a password reset, please change your password immediately or contact support.</p>
    </div>
  `;

  return sendEmailWithRetry({
    from: FROM_EMAIL,
    to: email,
    subject: "Reset Your TradeLog Password",
    html: getBaseTemplate(content),
    text: `Reset your password here: ${resetUrl}`,
  });
}

/**
 * Send Welcome Email
 */
export async function sendWelcomeEmail(
  email: string,
  name: string,
): Promise<boolean> {
  const content = `
    <h2 style="margin-top: 0; color: #111827; font-size: 20px;">Welcome to Trade-Diary, ${name}! 🎉</h2>
    <p style="margin-bottom: 16px;">We're excited to have you on board. Trade-Diary is designed to help you track, analyze, and improve your trading performance.</p>
    
    <h3 style="color: #374151; font-size: 16px; margin-top: 24px; margin-bottom: 12px;">Getting Started:</h3>
    <ul style="padding-left: 20px; margin-bottom: 24px;">
      <li style="margin-bottom: 8px;">📊 <strong>Log your first trade</strong> in the dashboard.</li>
      <li style="margin-bottom: 8px;">🧠 <strong>Track your psychology</strong> to understand your mindset.</li>
      <li style="margin-bottom: 8px;">📈 <strong>Review analytics</strong> to find your edge.</li>
    </ul>
    
    <div style="text-align: center; margin-top: 32px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 6px;">Go to Dashboard</a>
    </div>
  `;

  return sendEmailWithRetry({
    from: FROM_EMAIL,
    to: email,
    subject: "Welcome to Trade-Diary!",
    html: getBaseTemplate(content),
    text: `Welcome to Trade-Diary, ${name}! Log in to your dashboard to get started.`,
  });
}
