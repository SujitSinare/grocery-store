import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Invoices Generation')
@ApiBearerAuth('JWT-auth')
@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Retrieve or auto-generate PDF invoice details for an order' })
  async getInvoiceByOrder(@Param('orderId') orderId: string) {
    return this.invoicesService.getInvoiceByOrder(orderId);
  }

  @Post('order/:orderId/generate')
  @ApiOperation({ summary: 'Explicitly generate/regenerate invoice PDF' })
  async generateInvoice(@Param('orderId') orderId: string) {
    return this.invoicesService.generateInvoice(orderId);
  }
}
