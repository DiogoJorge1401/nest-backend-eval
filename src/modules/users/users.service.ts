import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { getMockToken, openMockAccount } from 'src/shared/mockApi';
import { RegisterUserDto } from './dtos/create-user.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import { KYCFile, User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(user: RegisterUserDto) {
    const userExists = await this.userModel.findOne({ email: user.email });

    if (userExists) {
      throw new UnprocessableEntityException('User already exists');
    }

    await this.userModel.create(user);

    const mockToken = await getMockToken();

    await openMockAccount(mockToken);
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async updatePassword(id: string, body: UpdatePasswordDto) {
    const user = await this.userModel.findById(id);

    user.password = body.password;

    await user.save();
  }

  async updateKYCDocument(id: string, document: KYCFile) {
    return this.userModel.updateOne({ _id: id }, { $set: { document } });
  }

  async updateKYCSelfie(id: string, selfie: KYCFile) {
    return this.userModel.updateOne({ _id: id }, { $set: { selfie } });
  }
}
