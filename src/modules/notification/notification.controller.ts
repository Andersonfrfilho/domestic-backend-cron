import { Controller, Get, Headers, HttpCode, HttpStatus, Inject, Param, Put } from '@nestjs/common';
import {
  ApiHeader,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { type UserServiceInterface } from '@modules/user/use-cases/create-users/create-user.interface';
import { USER_SERVICE_PROVIDE } from '@modules/user/user.token';
import { Notification } from '@modules/shared/providers/database/entities/notification.entity';

import { type NotificationServiceInterface } from './notification.service';
import { NOTIFICATION_SERVICE_PROVIDE } from './notification.token';

@ApiTags('Notifications')
@Controller('/notifications')
export class NotificationController {
  constructor(
    @Inject(NOTIFICATION_SERVICE_PROVIDE)
    private readonly notificationService: NotificationServiceInterface,
    @Inject(USER_SERVICE_PROVIDE)
    private readonly userService: UserServiceInterface,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar notificações do usuário autenticado' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiOkResponse({ type: [Notification] })
  async list(@Headers('x-user-id') keycloakId: string): Promise<Notification[]> {
    const user = await this.userService.getUserByKeycloakId(keycloakId);
    return this.notificationService.list(user.id);
  }

  @Put(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiNoContentResponse()
  async markAsRead(@Param('id') id: string): Promise<void> {
    await this.notificationService.markAsRead(id);
  }
}
