import { Controller, Post, Param, Body, Headers, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

class GenerateUpiQrDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;
}

class VerifyPaymentDto {
  @IsString()
  @IsOptional()
  reference?: string;
}

@ApiTags('Payments Integration')
@ApiBearerAuth('JWT-auth')
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('upi-qr')
  @ApiOperation({ summary: 'Initiate dynamic UPI deep link payload for a store order' })
  async generateUpiQr(
    @Headers('x-store-id') storeId: string,
    @Body() dto: GenerateUpiQrDto,
  ) {
    return this.paymentsService.generateUpiQr(dto.orderId, storeId);
  }

  @Post(':id/verify')
  @ApiOperation({ summary: 'Verify/simulate transaction confirmation' })
  async verifyPayment(
    @Param('id') id: string,
    @Body() dto: VerifyPaymentDto,
  ) {
    return this.paymentsService.verifyPayment(id, dto.reference);
  }
}
export { GenerateUpiQrDto, VerifyPaymentDto };
