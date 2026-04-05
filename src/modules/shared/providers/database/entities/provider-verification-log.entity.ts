import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { ProviderVerification } from './provider-verification.entity';

@Entity('provider_verification_logs')
export class ProviderVerificationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'verification_id' })
  verificationId: string;

  @Column({ comment: 'SUBMITTED, MOVED_TO_REVIEW, APPROVED, REJECTED' })
  action: string;

  @Column({ name: 'performed_by', type: 'uuid', nullable: true, comment: 'ID do usuário/admin' })
  performedBy: string;

  @Column({ name: 'previous_status', nullable: true })
  previousStatus: string;

  @Column({ name: 'new_status', nullable: true })
  newStatus: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => ProviderVerification, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'verification_id' })
  verification: ProviderVerification;
}
