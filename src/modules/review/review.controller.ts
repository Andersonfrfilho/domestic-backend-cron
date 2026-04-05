import { Body, Controller, Get, Headers, Inject, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { type UserServiceInterface } from '@modules/user/use-cases/create-users/create-user.interface';
import { USER_SERVICE_PROVIDE } from '@modules/user/user.token';
import { Review } from '@modules/shared/providers/database/entities/review.entity';

import { CreateReviewRequestDto } from './use-cases/create-review/dtos/create-review-request.dto';
import { type ReviewServiceInterface } from './review.service';
import { REVIEW_SERVICE_PROVIDE } from './review.token';

@ApiTags('Reviews')
@Controller('/reviews')
export class ReviewController {
  constructor(
    @Inject(REVIEW_SERVICE_PROVIDE)
    private readonly reviewService: ReviewServiceInterface,
    @Inject(USER_SERVICE_PROVIDE)
    private readonly userService: UserServiceInterface,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar avaliação de prestador (CUSTOMER)' })
  @ApiHeader({ name: 'X-User-Id', required: true, description: 'keycloak_id do contratante' })
  @ApiOkResponse({ type: Review })
  @ApiConflictResponse({ description: 'Review já existe para esta solicitação' })
  @ApiBadRequestResponse({ description: 'Solicitação não está COMPLETED' })
  async create(
    @Headers('x-user-id') keycloakId: string,
    @Body() body: CreateReviewRequestDto,
  ): Promise<Review> {
    const user = await this.userService.getUserByKeycloakId(keycloakId);
    return this.reviewService.create({ ...body, contractorId: user.id });
  }

  @Get('provider/:providerId')
  @ApiOperation({ summary: 'Listar avaliações de um prestador' })
  @ApiOkResponse({ type: [Review] })
  async listByProvider(@Param('providerId') providerId: string): Promise<Review[]> {
    return this.reviewService.listByProvider(providerId);
  }
}
