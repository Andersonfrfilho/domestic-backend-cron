import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Phone } from './phone.entity';
import { ProviderProfile } from './provider-profile.entity';

@Entity('provider_phones')
export class ProviderPhone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'provider_id' })
  providerId: string;

  @Column({ name: 'phone_id' })
  phoneId: string;

  @Column({ type: 'varchar', nullable: true })
  label: string | null;

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;

  @ManyToOne(() => ProviderProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;

  @ManyToOne(() => Phone, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'phone_id' })
  phone: Phone;
}
