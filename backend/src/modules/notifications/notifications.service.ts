import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    console.log(`[Notification Email Dispatcher]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    console.log(`-----------------------------------`);
  }

  async sendSms(to: string, message: string): Promise<void> {
    console.log(`[Notification SMS Dispatcher]`);
    console.log(`To: ${to}`);
    console.log(`Message: ${message}`);
    console.log(`-----------------------------------`);
  }
}
