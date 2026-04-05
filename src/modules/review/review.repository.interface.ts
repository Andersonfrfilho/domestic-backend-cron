import { Review } from '@modules/shared/providers/database/entities/review.entity';

export interface CreateReviewParams {
  serviceRequestId: string;
  contractorId: string;
  providerId: string;
  rating: number;
  comment?: string;
}

export interface ReviewRepositoryInterface {
  create(params: CreateReviewParams): Promise<Review>;
  findByServiceRequestId(serviceRequestId: string): Promise<Review | null>;
  listByProvider(providerId: string): Promise<Review[]>;
}
