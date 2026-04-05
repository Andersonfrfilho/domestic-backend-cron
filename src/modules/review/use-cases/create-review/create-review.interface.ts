import { Review } from '@modules/shared/providers/database/entities/review.entity';

export interface CreateReviewUseCaseParams {
  serviceRequestId: string;
  contractorId: string;
  rating: number;
  comment?: string;
}

export type CreateReviewUseCaseResponse = Review;

export interface CreateReviewUseCaseInterface {
  execute(params: CreateReviewUseCaseParams): Promise<CreateReviewUseCaseResponse>;
}
