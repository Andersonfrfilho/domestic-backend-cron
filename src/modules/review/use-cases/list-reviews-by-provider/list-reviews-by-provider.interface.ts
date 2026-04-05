import { Review } from '@modules/shared/providers/database/entities/review.entity';

export interface ListReviewsByProviderUseCaseParams {
  providerId: string;
}

export type ListReviewsByProviderUseCaseResponse = Review[];

export interface ListReviewsByProviderUseCaseInterface {
  execute(params: ListReviewsByProviderUseCaseParams): Promise<ListReviewsByProviderUseCaseResponse>;
}
