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
          ${pdfUrl ? `<p><a href="${pdfUrl}">Download Offer Letter (PDF)</a></p>` : ''}
          <p>Please log in to your candidate portal to review and respond to this offer.</p>
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

