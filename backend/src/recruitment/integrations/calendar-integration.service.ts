import { Injectable, Logger } from '@nestjs/common';
import { createEvent, EventAttributes } from 'ics';

@Injectable()
export class CalendarIntegrationService {
  private readonly logger = new Logger(CalendarIntegrationService.name);

  /**
   * Generate calendar invite (ICS file)
   */
  async generateCalendarInvite(
    title: string,
    description: string,
    startDate: Date,
    endDate: Date,
    location?: string,
    attendees?: { email: string; name: string }[],
  ): Promise<string> {
    try {
      const start = [
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        startDate.getDate(),
        startDate.getHours(),
        startDate.getMinutes(),
      ] as [number, number, number, number, number];

      const end = [
        endDate.getFullYear(),
        endDate.getMonth() + 1,
        endDate.getDate(),
        endDate.getHours(),
        endDate.getMinutes(),
      ] as [number, number, number, number, number];

      const event: EventAttributes = {
        title,
        description,
        start,
        end,
        location,
        attendees: attendees?.map((a) => ({ name: a.name, email: a.email })),
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
        organizer: { name: 'HR Team', email: 'hr@company.com' },
      };

      const { error, value } = createEvent(event);

      if (error) {
        throw new Error(`ICS generation error: ${error.message}`);
      }

      if (!value) {
        throw new Error('ICS generation returned no value');
      }

      this.logger.log(`Calendar invite generated for ${title}`);
      return value;
    } catch (error) {
      this.logger.error(
        `Failed to generate calendar invite:`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Send calendar invite via email (combines with email service)
   */
  async sendCalendarInvite(
    emailService: any,
    recipientEmail: string,
    recipientName: string,
    title: string,
    description: string,
    startDate: Date,
    endDate: Date,
    location?: string,
  ): Promise<void> {
    try {
      const icsContent = await this.generateCalendarInvite(
        title,
        description,
        startDate,
        endDate,
        location,
      );

      // Email service should handle sending the ICS file as attachment
      // This is a placeholder - actual implementation would integrate with email service
      this.logger.log(
        `Calendar invite prepared for ${recipientEmail}. ICS content length: ${icsContent.length}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send calendar invite to ${recipientEmail}:`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}

