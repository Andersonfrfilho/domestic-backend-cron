import { DocumentBuilder } from '@nestjs/swagger';

import { EnvironmentProviderInterface } from './interfaces/environment.interface';

interface SwaggerConfigParams extends Partial<EnvironmentProviderInterface> {}

export const swaggerConfig = (environment: SwaggerConfigParams) =>
  new DocumentBuilder()
    .setTitle('Zolve — Backend API')
    .setDescription(
      `API principal da plataforma Zolve. Conecta contratantes e prestadores de serviços domésticos.\n\n` +
      `**Autenticação:** Todos os endpoints (exceto \`POST /users\` e \`GET /health\`) requerem autenticação via Kong API Gateway.\n` +
      `O Kong injeta os headers \`X-User-Id\` (keycloak_id), \`X-User-Roles\` e \`X-User-Type\` após validar o JWT.`,
    )
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'X-User-Id', in: 'header', description: 'keycloak_id do usuário (injetado pelo Kong)' }, 'kong-user-id')
    .addServer(environment.baseUrlDevelopment || 'http://localhost:3333', 'Development')
    .addServer(environment.baseUrlStaging || 'https://api-hml.example.com', 'Staging (STG)')
    .addServer(environment.baseUrlProduction || 'https://api-prod.example.com', 'Production')
    .addTag('Users', 'Gestão de usuários e endereços')
    .addTag('Providers', 'Perfis de prestadores, serviços, locais de atendimento e verificação')
    .addTag('Categories', 'Catálogo de categorias de serviços')
    .addTag('Services', 'Catálogo de serviços disponíveis')
    .addTag('Service Requests', 'Solicitações de serviço — fluxo completo de contratação')
    .addTag('Reviews', 'Avaliações de prestadores pós-serviço')
    .addTag('Documents', 'Upload e gestão de documentos para verificação de prestadores')
    .addTag('Notifications', 'Notificações in-app do usuário autenticado')
    .build();
