import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';
import { OrdersService } from '../orders/orders.service';
import { StoresService } from '../stores/stores.service';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    private ordersService: OrdersService,
    private storesService: StoresService,
  ) {}

  async getInvoiceByOrder(orderId: string): Promise<InvoiceDocument> {
    const inv = await this.invoiceModel.findOne({ orderId: new Types.ObjectId(orderId) }).exec();
    if (!inv) {
      // If payment is completed and invoice doesn't exist, we generate it on-the-fly!
      return this.generateInvoice(orderId);
    }
    return inv;
  }

  async generateInvoice(orderId: string): Promise<InvoiceDocument> {
    const order = await this.ordersService.findOne(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const store = await this.storesService.findOne(order.storeId.toString());
    
    // Ensure invoice folder exists
    const uploadDir = path.join(process.cwd(), 'uploads', 'invoices');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const txnSeq = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${store.name.substring(0, 3).toUpperCase()}-${dateStr}-${txnSeq}`;
    const pdfFilename = `${invoiceNumber}.pdf`;
    const pdfFilePath = path.join(uploadDir, pdfFilename);

    // Create PDF Kit Document
    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(pdfFilePath);
    doc.pipe(writeStream);

    // --- Draw Header ---
    doc.fillColor('#4B5563').fontSize(20).text(store.name, { align: 'center' });
    doc.fontSize(10).text(`GSTIN: ${store.gstNumber}`, { align: 'center' });
    doc.text(store.address, { align: 'center' });
    doc.text(`Phone: ${store.phone}`, { align: 'center' });
    doc.moveDown();

    doc.strokeColor('#D1D5DB').lineWidth(1).moveTo(50, 120).lineTo(550, 120).stroke();
    doc.moveDown();

    // --- Invoice Info ---
    doc.fillColor('#1F2937').fontSize(12).text(`Invoice No: ${invoiceNumber}`, 50, 140);
    doc.text(`Date: ${new Date(order.createdAt as any).toLocaleString()}`, 50, 155);
    doc.text(`Payment: ${order.paymentMethod.toUpperCase()} (${order.paymentStatus.toUpperCase()})`, 50, 170);

    if (order.customerId) {
      const cust = order.customerId as any;
      doc.text(`Customer: ${cust.name}`, 320, 140);
      doc.text(`Phone: ${cust.phone}`, 320, 155);
    }
    doc.moveDown(2);

    // --- Item Table Grid ---
    let y = 210;
    doc.fillColor('#374151').fontSize(10);
    doc.text('Item Description', 50, y, { bold: true });
    doc.text('Qty', 280, y, { align: 'right', width: 40 });
    doc.text('MRP', 340, y, { align: 'right', width: 50 });
    doc.text('GST%', 410, y, { align: 'right', width: 40 });
    doc.text('Total (INR)', 470, y, { align: 'right', width: 80 });

    doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(50, y + 15).lineTo(550, y + 15).stroke();
    y += 25;

    for (const item of order.items) {
      doc.text(item.productName, 50, y);
      doc.text(item.qty.toString(), 280, y, { align: 'right', width: 40 });
      doc.text(item.mrp.toFixed(2), 340, y, { align: 'right', width: 50 });
      doc.text(`${item.gstRate}%`, 410, y, { align: 'right', width: 40 });
      const rowTotal = item.price * item.qty + item.gstAmount;
      doc.text(rowTotal.toFixed(2), 470, y, { align: 'right', width: 80 });
      y += 20;

      // Handle page overflow if list is long
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
    }

    doc.strokeColor('#D1D5DB').lineWidth(1).moveTo(50, y + 5).lineTo(550, y + 5).stroke();
    y += 15;

    // --- Summary calculations ---
    doc.text('Subtotal:', 350, y, { align: 'right', width: 100 });
    doc.text(order.subTotal.toFixed(2), 470, y, { align: 'right', width: 80 });
    y += 15;

    doc.text('Tax (GST):', 350, y, { align: 'right', width: 100 });
    doc.text(order.taxAmount.toFixed(2), 470, y, { align: 'right', width: 80 });
    y += 15;

    if (order.discount > 0) {
      doc.text('Discount:', 350, y, { align: 'right', width: 100 });
      doc.text(`-${order.discount.toFixed(2)}`, 470, y, { align: 'right', width: 80 });
      y += 15;
    }

    doc.fontSize(12).fillColor('#111827').text('Grand Total:', 350, y, { align: 'right', width: 100, bold: true });
    doc.text(`Rs. ${order.grandTotal.toFixed(2)}`, 470, y, { align: 'right', width: 80, bold: true });
    y += 30;

    // --- Footer ---
    doc.fontSize(10).fillColor('#9CA3AF').text('Thank you for shopping with us! Visit again.', { align: 'center' });

    doc.end();

    // Create record in DB
    const relativeUrl = `/uploads/invoices/${pdfFilename}`;
    const invoice = new this.invoiceModel({
      invoiceNumber,
      orderId: order._id,
      storeId: order.storeId,
      pdfUrl: relativeUrl,
    });

    return invoice.save();
  }
}
export { InvoicesService };
