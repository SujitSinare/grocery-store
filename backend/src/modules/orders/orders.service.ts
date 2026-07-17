import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderItem } from './schemas/order.schema';
import { Inventory, InventoryDocument } from '../inventory/schemas/inventory.schema';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Inventory.name) private inventoryModel: Model<InventoryDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async createOrder(
    storeId: string,
    orderData: {
      customerId?: string;
      orderType: string; // 'pos' | 'online'
      employeeId?: string;
      paymentMethod: string;
      couponCode?: string;
      items: { productId: string; qty: number }[];
    },
  ): Promise<OrderDocument> {
    const sId = new Types.ObjectId(storeId);
    let subTotal = 0;
    let taxAmount = 0;
    const orderItems: OrderItem[] = [];

    // 1. Process items and verify stock
    for (const item of orderData.items) {
      const pId = new Types.ObjectId(item.productId);
      
      // Find inventory
      const inventory = await this.inventoryModel.findOne({ storeId: sId, productId: pId })
        .populate('productId')
        .exec();

      if (!inventory) {
        throw new NotFoundException(`Product ID ${item.productId} not registered in store inventory`);
      }

      if (inventory.currentStock < item.qty) {
        const prod = inventory.productId as any;
        throw new BadRequestException(`Insufficient stock for ${prod?.name || 'product'}. Available: ${inventory.currentStock}`);
      }

      // Deduct stock
      inventory.currentStock -= item.qty;
      await inventory.save();

      const prod = inventory.productId as any;
      const price = inventory.sellingPrice;
      const gstAmount = (price * item.qty * inventory.gstRate) / 100;
      
      subTotal += price * item.qty;
      taxAmount += gstAmount;

      orderItems.push({
        productId: pId,
        productName: prod ? prod.name : 'Unknown Product',
        qty: item.qty,
        price: price,
        mrp: inventory.mrp,
        gstRate: inventory.gstRate,
        gstAmount: gstAmount,
      });
    }

    // 2. Calculate discounts
    let discount = 0;
    if (orderData.couponCode === 'SAVE10') {
      discount = subTotal * 0.1; // 10% off
    }

    const grandTotal = Math.round((subTotal + taxAmount - discount) * 100) / 100;

    // 3. Update customer loyalty points (1 point per 100 Rs spent)
    if (orderData.customerId) {
      const custId = new Types.ObjectId(orderData.customerId);
      const pointsEarned = Math.floor(grandTotal / 100);
      await this.customerModel.findByIdAndUpdate(custId, {
        $inc: { loyaltyPoints: pointsEarned },
      }).exec();
    }

    // 4. Save order
    const order = new this.orderModel({
      storeId: sId,
      customerId: orderData.customerId ? new Types.ObjectId(orderData.customerId) : null,
      orderType: orderData.orderType,
      items: orderItems,
      subTotal,
      discount,
      couponCode: orderData.couponCode,
      taxAmount,
      grandTotal,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentMethod === 'cash' ? 'paid' : 'pending', // UPI remains pending until validation
      orderStatus: 'processed',
      employeeId: orderData.employeeId ? new Types.ObjectId(orderData.employeeId) : null,
    });

    const saved = await order.save();

    // 5. Emit Event for invoice generation, WS alerts, etc.
    this.eventEmitter.emit('order.placed', {
      orderId: saved.id,
      storeId: saved.storeId.toString(),
      grandTotal: saved.grandTotal,
      paymentMethod: saved.paymentMethod,
    });

    return saved;
  }

  async findAllByStore(storeId: string): Promise<OrderDocument[]> {
    return this.orderModel.find({ storeId: new Types.ObjectId(storeId) })
      .populate('customerId')
      .populate('employeeId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<OrderDocument> {
    const order = await this.orderModel.findById(id)
      .populate('customerId')
      .populate('employeeId')
      .exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async updatePaymentStatus(id: string, status: string, reference?: string): Promise<OrderDocument> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    order.paymentStatus = status;
    if (reference) {
      order.paymentReference = reference;
    }
    const saved = await order.save();
    
    if (status === 'paid') {
      this.eventEmitter.emit('order.paid', {
        orderId: saved.id,
        storeId: saved.storeId.toString(),
      });
    }

    return saved;
  }
}
