import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { Review } from '@modules/shared/providers/database/entities/review.entity';

import { CreateReviewParams, ReviewRepositoryInterface } from './review.repository.interface';

@Injectable()
export class ReviewRepository implements ReviewRepositoryInterface {
  constructor(
    @InjectRepository(Review, CONNECTIONS_NAMES.POSTGRES)
    private readonly repo: Repository<Review>,
  ) {}

  async create(params: CreateReviewParams): Promise<Review> {
    const review = this.repo.create({ ...params, createdAt: new Date() });
    return this.repo.save(review);
  }

  async findByServiceRequestId(serviceRequestId: string): Promise<Review | null> {
    return this.repo.findOne({ where: { serviceRequestId } });
  }

  async listByProvider(providerId: string): Promise<Review[]> {
    return this.repo.find({ where: { providerId }, order: { createdAt: 'DESC' } });
  }
}
