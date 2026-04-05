import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { UserAddress } from './user-address.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  street: string;

  @Column()
  number: string;

  @Column({ type: 'varchar', nullable: true })
  complement: string | null;

  @Column()
  neighborhood: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column({ name: 'zipcode' })
  zipCode: string;

  @Column({ type: 'decimal', nullable: true, precision: 10, scale: 8 })
  latitude: number | null;

  @Column({ type: 'decimal', nullable: true, precision: 11, scale: 8 })
  longitude: number | null;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date | null;

  @OneToMany(() => UserAddress, (userAddress) => userAddress.address)
  userAddresses?: UserAddress[];
}
