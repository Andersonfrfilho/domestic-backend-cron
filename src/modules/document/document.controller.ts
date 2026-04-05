import {
  Controller,
  Get,
  Headers,
  Inject,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { type UserServiceInterface } from '@modules/user/use-cases/create-users/create-user.interface';
import { USER_SERVICE_PROVIDE } from '@modules/user/user.token';
import { Document } from '@modules/shared/providers/database/entities/document.entity';

import { type DocumentServiceInterface } from './document.service';
import { DOCUMENT_SERVICE_PROVIDE } from './document.token';

@ApiTags('Documents')
@Controller('/documents')
export class DocumentController {
  constructor(
    @Inject(DOCUMENT_SERVICE_PROVIDE)
    private readonly documentService: DocumentServiceInterface,
    @Inject(USER_SERVICE_PROVIDE)
    private readonly userService: UserServiceInterface,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Upload de documento (PROVIDER)' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        documentType: { type: 'string', description: 'Tipo do documento (ex: CPF, CNH, DIPLOMA)' },
      },
      required: ['file', 'documentType'],
    },
  })
  @ApiOkResponse({ type: Document })
  async upload(
    @Headers('x-user-id') keycloakId: string,
    @Req() req: any,
  ): Promise<Document> {
    const user = await this.userService.getUserByKeycloakId(keycloakId);

    const data = await req.file();
    if (!data) throw new Error('No file provided');

    const documentType = (data.fields?.documentType as any)?.value ?? 'UNKNOWN';

    return this.documentService.upload({
      userId: user.id,
      documentType,
      filename: data.filename,
      mimetype: data.mimetype,
      stream: data.file,
      size: data.file.bytesRead ?? 0,
    });
  }

  @Get(':id/url')
  @ApiOperation({ summary: 'Obter URL assinada do documento (TTL 15min)' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiOkResponse({ schema: { type: 'object', properties: { url: { type: 'string' }, expiresIn: { type: 'number' } } } })
  @ApiNotFoundResponse()
  async getUrl(@Param('id') id: string): Promise<{ url: string; expiresIn: number }> {
    return this.documentService.getUrl(id);
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Aprovar documento (Admin)' })
  @ApiOkResponse({ type: Document })
  @ApiNotFoundResponse()
  async approve(@Param('id') id: string): Promise<Document> {
    return this.documentService.approve(id);
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Rejeitar documento (Admin)' })
  @ApiOkResponse({ type: Document })
  @ApiNotFoundResponse()
  async reject(@Param('id') id: string): Promise<Document> {
    return this.documentService.reject(id);
  }
}
