import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  NotificationLog,
  NotificationLogDocument,
} from '../../time-management/models/notification-log.schema';

@Injectable()
export class NotificationIntegrationService {
  private readonly logger = new Logger(NotificationIntegrationService.name);

  constructor(
    @InjectModel(NotificationLog.name)
    private notificationLogModel: Model<NotificationLogDocument>,
  ) {}

  /**
   * Send notification for application status update
   */
  async notifyApplicationStatusUpdate(
    candidateId: string,
    applicationId: string,
    status: string,
    stage: string,
  ): Promise<void> {
    try {
      const message = `Your application status has been updated to ${status} at stage ${stage}. Application ID: ${applicationId}`;
      
      await this.notificationLogModel.create({
        to: new Types.ObjectId(candidateId),
        type: 'APPLICATION_STATUS_UPDATE',
        message,
      });

      this.logger.log(
        `Notification sent to candidate ${candidateId} for application ${applicationId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send notification for application ${applicationId}:`,
        error instanceof Error ? error.stack : undefined,
      );
      // Don't throw - notification failure shouldn't break the main flow
    }
  }

  /**
   * Send rejection notification
   */
  async notifyRejection(
    candidateId: string,
    applicationId: string,
    reason?: string,
  ): Promise<void> {
    try {
      const message = reason
        ? `Your application (ID: ${applicationId}) has been rejected. Reason: ${reason}`
        : `Your application (ID: ${applicationId}) has been rejected.`;

      await this.notificationLogModel.create({
        to: new Types.ObjectId(candidateId),
        type: 'APPLICATION_REJECTED',
        message,
      });

      this.logger.log(
        `Rejection notification sent to candidate ${candidateId} for application ${applicationId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send rejection notification for application ${applicationId}:`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * Send interview calendar invite notification
   */
  async notifyInterviewScheduled(
    candidateId: string,
    interviewId: string,
    scheduledDate: Date,
    method: string,
  ): Promise<void> {
    try {
      const message = `You have been scheduled for an interview on ${scheduledDate.toLocaleString()}. Method: ${method}. Interview ID: ${interviewId}`;

      await this.notificationLogModel.create({
        to: new Types.ObjectId(candidateId),
        type: 'INTERVIEW_SCHEDULED',
        message,
      });

      this.logger.log(
        `Interview notification sent to candidate ${candidateId} for interview ${interviewId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send interview notification for interview ${interviewId}:`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * Send notification to panel members
   */
  async notifyPanelMembers(
    panelMemberIds: string[],
    interviewId: string,
    scheduledDate: Date,
    candidateName: string,
  ): Promise<void> {
    try {
      const notifications = panelMemberIds.map((memberId) => ({
        to: new Types.ObjectId(memberId),
        type: 'INTERVIEW_PANEL_INVITE',
        message: `You have been assigned to interview panel for ${candidateName} on ${scheduledDate.toLocaleString()}. Interview ID: ${interviewId}`,
      }));

      await this.notificationLogModel.insertMany(notifications);

      this.logger.log(
        `Panel member notifications sent for interview ${interviewId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send panel member notifications for interview ${interviewId}:`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * Send offer notification
   */
  async notifyOfferSent(
    candidateId: string,
    offerId: string,
  ): Promise<void> {
    try {
      const message = `You have received a job offer! Please review and respond. Offer ID: ${offerId}`;

      await this.notificationLogModel.create({
        to: new Types.ObjectId(candidateId),
        type: 'OFFER_SENT',
        message,
      });

      this.logger.log(
        `Offer notification sent to candidate ${candidateId} for offer ${offerId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send offer notification for offer ${offerId}:`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}

