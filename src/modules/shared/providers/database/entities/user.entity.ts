import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'keycloak_id', type: 'uuid', unique: true, nullable: true })
  @Index('users_keycloak_idx')
  keycloakId: string | null;

  @Column({ name: 'full_name', nullable: true })
  fullName: string;

  @Column({ default: 'PENDING' })
  status: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
