import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { UploadDocumentDto } from './dtos/upload-document.dto';
import { UploadSelfieDto } from './dtos/upload-selfie.dto';
import { KycService } from './kyc.service';

@Controller('kyc')
@UseGuards(JwtAuthGuard)
@ApiCookieAuth()
export class KycController {
  constructor(private kycService: KycService) {}

  @Post('upload-doc')
  @ApiOperation({ summary: 'Upload de documento do usuário' })
  async uploadDocument(@Request() req, @Body() body: UploadDocumentDto) {
    return this.kycService.uploadDocument(req.user._id, body.document);
  }

  @Post('upload-selfie')
  @ApiOperation({ summary: 'Upload de selfie do usuário' })
  async uploadSelfie(@Request() req, @Body() body: UploadSelfieDto) {
    return this.kycService.uploadSelfie(req.user._id, body.selfie);
  }
}
