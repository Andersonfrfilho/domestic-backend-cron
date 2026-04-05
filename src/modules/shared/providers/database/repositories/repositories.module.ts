import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Address } from '@modules/shared/providers/database/entities/address.entity';
import { UserAddress } from '@modules/shared/providers/database/entities/user-address.entity';

import { CONNECTIONS_NAMES } from '../database.constant';

@Module({
  imports: [TypeOrmModule.forFeature([Address, UserAddress], CONNECTIONS_NAMES.POSTGRES)],
})
export class SharedRepositoriesModule {}
