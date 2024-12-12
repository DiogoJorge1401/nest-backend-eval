import { Injectable } from '@nestjs/common';
import { KYCFile } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class KycService {
  constructor(private usersService: UsersService) {}

  async uploadDocument(userId: string, document: KYCFile) {
    await this.usersService.updateKYCDocument(userId, document);
  }

  async uploadSelfie(userId: string, selfie: KYCFile) {
    await this.usersService.updateKYCSelfie(userId, selfie);
  }
}
