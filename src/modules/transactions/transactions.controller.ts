import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { TransferDto } from './dtos/transfer.dto';
import { ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Transaction } from './schemas/transactions.schema';

@Controller()
@UseGuards(JwtAuthGuard)
@ApiCookieAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('transfer')
  @ApiOperation({ summary: 'Realiza uma transferência para outra conta.' })
  createTransfer(@Body() transferDto: TransferDto, @Req() req) {
    return this.transactionsService.createTransfer(req.user._id, transferDto);
  }

  @Get('statement')
  @ApiResponse({
    status: 200,
    description: 'Get user statements',
    type: [Transaction],
  })
  @ApiOperation({
    summary: 'Retorna o extrato da conta do usuário autenticado.',
  })
  async getStatement(@Req() req) {
    return this.transactionsService.getStatement(req.user._id);
  }
}
