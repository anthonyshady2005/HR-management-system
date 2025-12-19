import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailIntegrationService {
  private readonly logger = new Logger(EmailIntegrationService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    // Initialize email transporter
    // In production, use environment variables for SMTP config
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } catch (error) {
      this.logger.warn(
        'Email transporter not configured. Email sending will be disabled.',
      );
    }
  }

  /**
   * Send offer email to candidate
   */
  async sendOfferEmail(
    candidateEmail: string,
    candidateName: string,
    offerId: string,
    offerDetails: any,
    pdfUrl?: string,
    signingUrl?: string,
  ): Promise<void> {
    try {
      if (!this.transporter) {
        this.logger.warn('Email transporter not configured. Skipping email send.');
        return;
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@company.com',
        to: candidateEmail,
        subject: 'Job Offer - Action Required',
        html: `
          <h2>Congratulations ${candidateName}!</h2>
          <p>We are pleased to offer you a position at our company.</p>
          <p><strong>Offer ID:</strong> ${offerId}</p>
          <p><strong>Position:</strong> ${offerDetails.role || 'N/A'}</p>
          <p><strong>Salary:</strong> ${offerDetails.grossSalary || 'N/A'}</p>
          ${offerDetails.signingBonus ? `<p><strong>Signing Bonus:</strong> ${offerDetails.signingBonus}</p>` : ''}
          ${pdfUrl ? `<p><a href="${pdfUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;">Download Offer Letter (PDF)</a></p>` : ''}
          ${signingUrl ? `
            <div style="margin: 20px 0; padding: 20px; background-color: #F3F4F6; border-radius: 5px;">
              <p style="margin-bottom: 10px;"><strong>Ready to accept this offer?</strong></p>
              <p style="margin-bottom: 15px;">Click the button below to review and sign the offer letter online:</p>
              <a href="${signingUrl}" style="display: inline-block; padding: 12px 24px; background-color: #10B981; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Sign Offer Letter</a>
              <p style="margin-top: 15px; font-size: 12px; color: #6B7280;">This link will expire in 7 days.</p>
            </div>
          ` : ''}
          <p>If you have any questions, please don't hesitate to contact our HR team.</p>
          <p>Best regards,<br>HR Team</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Offer email sent to ${candidateEmail} for offer ${offerId}`);
    } catch (error) {
      this.logger.error(
        `Failed to send offer email to ${candidateEmail}:`,
        error instanceof Error ? error.stack : undefined,
      );
      // Don't throw - email failure shouldn't break offer creation
    }
  }

  /**
   * Send rejection email
   */
  async sendRejectionEmail(
    candidateEmail: string,
    candidateName: string,
    applicationId: string,
    reason?: string,
  ): Promise<void> {
    try {
      if (!this.transporter) {
        this.logger.warn('Email transporter not configured. Skipping email send.');
        return;
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@company.com',
        to: candidateEmail,
        subject: 'Application Update',
        html: `
          <h2>Dear ${candidateName},</h2>
          <p>Thank you for your interest in our company.</p>
          <p>We regret to inform you that we will not be moving forward with your application (ID: ${applicationId}).</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>We appreciate the time you invested in the application process and wish you the best in your future endeavors.</p>
          <p>Best regards,<br>HR Team</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Rejection email sent to ${candidateEmail} for application ${applicationId}`);
    } catch (error) {
      this.logger.error(
        `Failed to send rejection email to ${candidateEmail}:`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * Send interview calendar invite email
   */
  async sendInterviewInviteEmail(
    candidateEmail: string,
    candidateName: string,
    interviewId: string,
    scheduledDate: Date,
    method: string,
    videoLink?: string,
    location?: string,
  ): Promise<void> {
    try {
      if (!this.transporter) {
        this.logger.warn('Email transporter not configured. Skipping email send.');
        return;
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@company.com',
        to: candidateEmail,
        subject: 'Interview Invitation',
        html: `
          <h2>Dear ${candidateName},</h2>
          <p>You have been scheduled for an interview.</p>
          <p><strong>Interview ID:</strong> ${interviewId}</p>
          <p><strong>Date & Time:</strong> ${scheduledDate.toLocaleString()}</p>
          <p><strong>Method:</strong> ${method}</p>
          ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
          ${videoLink ? `<p><strong>Video Link:</strong> <a href="${videoLink}">${videoLink}</a></p>` : ''}
          <p>Please confirm your attendance or contact us if you need to reschedule.</p>
          <p>Best regards,<br>HR Team</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Interview invite email sent to ${candidateEmail} for interview ${interviewId}`);
    } catch (error) {
      this.logger.error(
        `Failed to send interview invite email to ${candidateEmail}:`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}

