import { Inject, Injectable } from '@nestjs/common';

import { type ReviewRepositoryInterface } from '../../review.repository.interface';
import { REVIEW_REPOSITORY_PROVIDE } from '../../review.token';

import {
  ListReviewsByProviderUseCaseInterface,
  ListReviewsByProviderUseCaseParams,
  ListReviewsByProviderUseCaseResponse,
} from './list-reviews-by-provider.interface';

@Injectable()
export class ListReviewsByProviderUseCase implements ListReviewsByProviderUseCaseInterface {
  constructor(
    @Inject(REVIEW_REPOSITORY_PROVIDE)
    private readonly reviewRepository: ReviewRepositoryInterface,
  ) {}

  async execute(params: ListReviewsByProviderUseCaseParams): Promise<ListReviewsByProviderUseCaseResponse> {
    return this.reviewRepository.listByProvider(params.providerId);
  }
}
