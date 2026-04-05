import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

import type { EmailProviderInterface, SendEmailParams } from './email.interface';

@Injectable()
export class NodemailerProvider implements EmailProviderInterface, OnModuleInit {
  private readonly logger = new Logger(NodemailerProvider.name);
  private transporter: Transporter;

  onModuleInit() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? 'smtp.sendgrid.net',
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER ?? 'apikey',
        pass: process.env.SMTP_PASSWORD ?? '',
      },
    });
  }

  async send(params: SendEmailParams): Promise<void> {
    await this.transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME ?? 'ZOLVE'}" <${process.env.SMTP_FROM_EMAIL ?? 'noreply@zolve.com.br'}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    this.logger.log(`E-mail sent to ${params.to} — subject: "${params.subject}"`);
  }
}
