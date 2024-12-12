import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { TransferDto } from './dtos/transfer.dto';
import { ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { Transaction } from './schemas/transactions.schema';

@Controller()
@UseGuards(JwtAuthGuard)
@ApiCookieAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('transfer')
  createTransfer(@Body() transferDto: TransferDto, @Req() req) {
    return this.transactionsService.createTransfer(req.user._id, transferDto);
  }

  @Get('statement')
  @ApiResponse({
    status: 200,
    description: 'Get user statements',
    type: [Transaction],
  })
  async getStatement(@Req() req) {
    return this.transactionsService.getStatement(req.user._id);
  }
}
