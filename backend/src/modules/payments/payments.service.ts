import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { OrdersService } from '../orders/orders.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private ordersService: OrdersService,
    private configService: ConfigService,
  ) {}

  async generateUpiQr(orderId: string, storeId: string): Promise<PaymentDocument> {
    const order = await this.ordersService.findOne(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const txId = 'TXN-' + Math.floor(100000 + Math.random() * 900000);
    const pa = this.configService.get<string>('UPI_VPA') || 'merchant@ybl';
    const pn = this.configService.get<string>('UPI_MERCHANT_NAME') || 'SmartGroceryStore';

    // Generate UPI standard payload
    const upiPayload = `upi://pay?pa=${pa}&pn=${encodeURIComponent(pn)}&am=${order.grandTotal}&tr=${txId}&cu=INR`;

    const payment = new this.paymentModel({
      orderId: new Types.ObjectId(orderId),
      storeId: new Types.ObjectId(storeId),
      amount: order.grandTotal,
      paymentMethod: 'upi',
      status: 'pending',
      transactionId: txId,
      upiPayload,
    });

    return payment.save();
  }

  async verifyPayment(paymentId: string, reference?: string): Promise<PaymentDocument> {
    const payment = await this.paymentModel.findById(paymentId).exec();
    if (!payment) {
      throw new NotFoundException(`Payment record not found`);
    }

    payment.status = 'completed';
    if (reference) {
      payment.transactionId = reference;
    }
    const saved = await payment.save();

    // Update order status as Paid
    await this.ordersService.updatePaymentStatus(payment.orderId.toString(), 'paid', payment.transactionId);

    return saved;
  }
}
export { PaymentsService };
