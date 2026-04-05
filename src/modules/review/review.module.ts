import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Review } from '@modules/shared/providers/database/entities/review.entity';
import { SharedModule } from '@modules/shared/shared.module';
import { UserModule } from '@modules/user/user.module';
import { ServiceRequestModule } from '@modules/service-request/service-request.module';

import { CONNECTIONS_NAMES } from '../shared/providers/database/database.constant';

import { ReviewController } from './review.controller';
import { ReviewRepository } from './review.repository';
import { ReviewService } from './review.service';
import {
  REVIEW_CREATE_USE_CASE_PROVIDE,
  REVIEW_LIST_BY_PROVIDER_USE_CASE_PROVIDE,
  REVIEW_REPOSITORY_PROVIDE,
  REVIEW_SERVICE_PROVIDE,
} from './review.token';
import { CreateReviewUseCase } from './use-cases/create-review/create-review.use-case';
import { ListReviewsByProviderUseCase } from './use-cases/list-reviews-by-provider/list-reviews-by-provider.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review], CONNECTIONS_NAMES.POSTGRES),
    SharedModule,
    UserModule,
    ServiceRequestModule,
  ],
  controllers: [ReviewController],
  providers: [
    { provide: REVIEW_REPOSITORY_PROVIDE, useClass: ReviewRepository },
    { provide: REVIEW_CREATE_USE_CASE_PROVIDE, useClass: CreateReviewUseCase },
    { provide: REVIEW_LIST_BY_PROVIDER_USE_CASE_PROVIDE, useClass: ListReviewsByProviderUseCase },
    { provide: REVIEW_SERVICE_PROVIDE, useClass: ReviewService },
  ],
  exports: [REVIEW_REPOSITORY_PROVIDE, REVIEW_SERVICE_PROVIDE],
})
export class ReviewModule {}
