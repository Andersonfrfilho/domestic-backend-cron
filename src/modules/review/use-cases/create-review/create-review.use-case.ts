import { Inject, Injectable } from '@nestjs/common';

import { type ServiceRequestRepositoryInterface } from '@modules/service-request/service-request.repository.interface';
import { SERVICE_REQUEST_REPOSITORY_PROVIDE } from '@modules/service-request/service-request.token';

import { type ReviewRepositoryInterface } from '../../review.repository.interface';
import { REVIEW_REPOSITORY_PROVIDE } from '../../review.token';
import { ReviewErrorFactory } from '../../factories/review.error.factory';

import {
  CreateReviewUseCaseInterface,
  CreateReviewUseCaseParams,
  CreateReviewUseCaseResponse,
} from './create-review.interface';

@Injectable()
export class CreateReviewUseCase implements CreateReviewUseCaseInterface {
  constructor(
    @Inject(REVIEW_REPOSITORY_PROVIDE)
    private readonly reviewRepository: ReviewRepositoryInterface,
    @Inject(SERVICE_REQUEST_REPOSITORY_PROVIDE)
    private readonly serviceRequestRepository: ServiceRequestRepositoryInterface,
  ) {}

  async execute(params: CreateReviewUseCaseParams): Promise<CreateReviewUseCaseResponse> {
    const serviceRequest = await this.serviceRequestRepository.findById(params.serviceRequestId);
    if (!serviceRequest || serviceRequest.status !== 'COMPLETED') {
      throw ReviewErrorFactory.serviceRequestNotCompleted(params.serviceRequestId);
    }

    const existing = await this.reviewRepository.findByServiceRequestId(params.serviceRequestId);
    if (existing) throw ReviewErrorFactory.alreadyExists(params.serviceRequestId);

    return this.reviewRepository.create({
      serviceRequestId: params.serviceRequestId,
      contractorId: params.contractorId,
      providerId: serviceRequest.providerId,
      rating: params.rating,
      comment: params.comment,
    });
  }
}
