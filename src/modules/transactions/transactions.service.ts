import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { Model } from 'mongoose';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from './schemas/transactions.schema';
import { TransferDto } from './dtos/transfer.dto';
import { getMockToken } from 'src/shared/mockApi';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    private configService: ConfigService,
  ) {}

  async createTransfer(userId: string, transferDto: TransferDto) {
    const transaction = await this.transactionModel.create({
      userId,
      type: TransactionType.DEBIT,
      status: TransactionStatus.PENDING,
      amount: transferDto.amount,
      description: transferDto.description,
      destinationAccount: transferDto.destinationAccount,
    });

    try {
      const token = await getMockToken();

      await axios.post(
        `${this.configService.get('MOCK_API_URL')}/mock-transfer`,
        transferDto,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      transaction.status = TransactionStatus.COMPLETED;
    } catch (error) {
      transaction.status = TransactionStatus.FAILED;

      throw error;
    } finally {
      await transaction.save();
    }
  }

  async getStatement(userId: string) {
    return this.transactionModel.find({ userId }).sort({ createdAt: -1 });
  }
}
