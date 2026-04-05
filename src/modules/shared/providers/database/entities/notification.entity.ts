import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

@Entity('notifications')
export class Notification {
  @ApiProperty({ example: '661f1a2b3c4d5e6f7a8b9c0d', description: 'MongoDB ObjectId' })
  @ObjectIdColumn()
  _id: ObjectId;

  @ApiProperty({ example: 'Sua solicitação foi aceita pelo prestador.' })
  @Column()
  message: string;

  @ApiProperty({ example: 'SERVICE_REQUEST_ACCEPTED', description: 'Tipo do evento que gerou a notificação' })
  @Column()
  type: string;

  @ApiPropertyOptional({ example: 'uuid-do-usuario', nullable: true })
  @Column({ nullable: true })
  userId?: string;

  @ApiProperty({ example: false })
  @Column({ default: false })
  read: boolean;

  @ApiProperty({ example: '2026-04-04T10:00:00Z' })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({ example: '2026-04-04T10:00:00Z' })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
