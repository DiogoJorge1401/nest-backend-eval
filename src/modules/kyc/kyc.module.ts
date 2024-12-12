import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { KycController } from './kyc.controller';
import { KycService } from './kyc.service';

@Module({
  imports: [UsersModule],
  controllers: [KycController],
  providers: [KycService],
})
export class KycModule {}
