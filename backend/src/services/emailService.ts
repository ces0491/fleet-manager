import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Create email transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: `"Fleet Manager" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9fafb;
              border-radius: 8px;
              padding: 30px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #2563eb;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
            }
            .button:hover {
              background-color: #1d4ed8;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #6b7280;
              font-size: 14px;
            }
            .warning {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 12px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Fleet Manager</div>
              <p style="color: #6b7280;">Password Reset Request</p>
            </div>

            <div class="content">
              <h2 style="color: #111827; margin-top: 0;">Reset Your Password</h2>

              <p>Hello,</p>

              <p>We received a request to reset your password for your Fleet Manager account. Click the button below to create a new password:</p>

              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour for your security.
              </div>

              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>

              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <strong>Didn't request this?</strong><br>
                If you didn't request a password reset, please ignore this email or contact support if you have concerns.
              </p>
            </div>

            <div class="footer">
              <p>This is an automated message from Fleet Manager by Sheet Solved.</p>
              <p>Need help? Contact <a href="mailto:cesaire@sheetsolved.com" style="color: #2563eb;">cesaire@sheetsolved.com</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Reset Your Fleet Manager Password',
      html,
    });
  }
}

export default new EmailService();
