import { Inject, Injectable } from '@nestjs/common';

import { Review } from '@modules/shared/providers/database/entities/review.entity';

import { type CreateReviewUseCaseInterface, CreateReviewUseCaseParams } from './use-cases/create-review/create-review.interface';
import { type ListReviewsByProviderUseCaseInterface } from './use-cases/list-reviews-by-provider/list-reviews-by-provider.interface';
import { REVIEW_CREATE_USE_CASE_PROVIDE, REVIEW_LIST_BY_PROVIDER_USE_CASE_PROVIDE } from './review.token';

export interface ReviewServiceInterface {
  create(params: CreateReviewUseCaseParams): Promise<Review>;
  listByProvider(providerId: string): Promise<Review[]>;
}

@Injectable()
export class ReviewService implements ReviewServiceInterface {
  constructor(
    @Inject(REVIEW_CREATE_USE_CASE_PROVIDE)
    private readonly createUseCase: CreateReviewUseCaseInterface,
    @Inject(REVIEW_LIST_BY_PROVIDER_USE_CASE_PROVIDE)
    private readonly listByProviderUseCase: ListReviewsByProviderUseCaseInterface,
  ) {}

  create(params: CreateReviewUseCaseParams): Promise<Review> {
    return this.createUseCase.execute(params);
  }

  listByProvider(providerId: string): Promise<Review[]> {
    return this.listByProviderUseCase.execute({ providerId });
  }
}
