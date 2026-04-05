import { Inject, Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

import { EMAIL_PROVIDER } from '@modules/shared/email/email.token';
import type { EmailProviderInterface } from '@modules/shared/email/email.interface';

import type { EmailEvent } from './dtos/email.event.dto';

const SUBJECTS: Record<string, string> = {
  'welcome': 'Bem-vindo à ZOLVE!',
  'verification-approved': 'Parabéns! Seu perfil foi verificado',
  'verification-rejected': 'Ação necessária no seu cadastro',
  'service-request-received': 'Nova solicitação de serviço',
  'service-request-accepted': 'Sua solicitação foi aceita',
  'service-request-rejected': 'Sua solicitação foi recusada',
  'service-request-completed': 'Serviço concluído — avalie!',
  'service-request-cancelled': 'Solicitação cancelada pelo contratante',
  'request-reminder': 'Você tem uma solicitação pendente',
};

@Injectable()
export class EmailHandler {
  private readonly logger = new Logger(EmailHandler.name);
  private readonly templatesDir = path.join(__dirname, 'templates');

  constructor(
    @Inject(EMAIL_PROVIDER)
    private readonly emailProvider: EmailProviderInterface,
  ) {}

  async handle(event: EmailEvent): Promise<void> {
    const subject = SUBJECTS[event.template_id];
    if (!subject) {
      this.logger.error(`Unknown email template: ${event.template_id}`);
      return;
    }

    const html = this.renderTemplate(event.template_id, event.variables);
    await this.emailProvider.send({ to: event.to, subject, html });
  }

  private renderTemplate(templateId: string, variables: Record<string, string>): string {
    const templatePath = path.join(this.templatesDir, `${templateId}.hbs`);

    if (!fs.existsSync(templatePath)) {
      this.logger.warn(`Template not found: ${templatePath} — sending plain text`);
      return JSON.stringify(variables);
    }

    const source = fs.readFileSync(templatePath, 'utf-8');
    const compiled = Handlebars.compile(source);
    return compiled(variables);
  }
}
