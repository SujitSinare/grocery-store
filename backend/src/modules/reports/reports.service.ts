import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Inventory, InventoryDocument } from '../inventory/schemas/inventory.schema';
import { Expense, ExpenseDocument } from '../expenses/schemas/expense.schema';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Inventory.name) private inventoryModel: Model<InventoryDocument>,
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
  ) {}

  async getDashboardSummary(storeId: string): Promise<any> {
    const sId = new Types.ObjectId(storeId);

    // 1. Total Revenue and Order Count
    const salesAgg = await this.orderModel.aggregate([
      { $match: { storeId: sId, paymentStatus: 'paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$grandTotal' },
          totalTax: { $sum: '$taxAmount' },
          count: { $sum: 1 },
        },
      },
    ]).exec();

    const totalRevenue = salesAgg[0]?.totalRevenue || 0;
    const totalTax = salesAgg[0]?.totalTax || 0;
    const ordersCount = salesAgg[0]?.count || 0;

    // 2. Total Expenses
    const expenseAgg = await this.expenseModel.aggregate([
      { $match: { storeId: sId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]).exec();
    const totalExpenses = expenseAgg[0]?.total || 0;

    // 3. Low Stock Items count
    const lowStockCount = await this.inventoryModel.countDocuments({
      storeId: sId,
      $expr: { $lte: ['$currentStock', '$minStock'] },
    }).exec();

    // 4. Recent Orders
    const recentOrders = await this.orderModel.find({ storeId: sId })
      .populate('customerId', 'name phone')
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();

    // 5. Monthly sales data for charts
    const monthlySales = await this.orderModel.aggregate([
      { $match: { storeId: sId, paymentStatus: 'paid' } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          sales: { $sum: '$grandTotal' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]).exec();

    // Format charts data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = months.map((m, idx) => {
      const data = monthlySales.find(item => item._id === idx + 1);
      return {
        month: m,
        revenue: data ? data.sales : 0,
        orders: data ? data.count : 0,
      };
    });

    return {
      metrics: {
        totalRevenue,
        totalTax,
        ordersCount,
        totalExpenses,
        netProfit: totalRevenue - totalTax - totalExpenses, // Simple estimate
        lowStockCount,
      },
      recentOrders,
      chartData,
    };
  }

  async generateExcelReport(storeId: string): Promise<string> {
    const sId = new Types.ObjectId(storeId);
    
    // Create folders
    const reportsDir = path.join(process.cwd(), 'uploads', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const filename = `Report-Store-${storeId}-${Date.now()}.xlsx`;
    const filePath = path.join(reportsDir, filename);

    const workbook = new ExcelJS.Workbook();

    // Sheet 1: Sales Register
    const salesSheet = workbook.addWorksheet('Sales Register');
    salesSheet.columns = [
      { header: 'Order ID', key: 'orderId', width: 25 },
      { header: 'Type', key: 'type', width: 10 },
      { header: 'Payment Method', key: 'paymentMethod', width: 15 },
      { header: 'Subtotal', key: 'subtotal', width: 12 },
      { header: 'Tax', key: 'tax', width: 12 },
      { header: 'Grand Total', key: 'grandTotal', width: 15 },
      { header: 'Date', key: 'date', width: 25 },
    ];

    const orders = await this.orderModel.find({ storeId: sId }).exec();
    orders.forEach(o => {
      salesSheet.addRow({
        orderId: o._id.toString(),
        type: o.orderType.toUpperCase(),
        paymentMethod: o.paymentMethod.toUpperCase(),
        subtotal: o.subTotal,
        tax: o.taxAmount,
        grandTotal: o.grandTotal,
        date: new Date((o as any).createdAt).toLocaleString(),
      });
    });

    // Sheet 2: Inventory Sheet
    const invSheet = workbook.addWorksheet('Inventory Status');
    invSheet.columns = [
      { header: 'Product Name', key: 'name', width: 30 },
      { header: 'Current Stock', key: 'stock', width: 15 },
      { header: 'Min Stock', key: 'minStock', width: 12 },
      { header: 'MRP', key: 'mrp', width: 12 },
      { header: 'Selling Price', key: 'price', width: 12 },
    ];

    const stocks = await this.inventoryModel.find({ storeId: sId }).populate('productId').exec();
    stocks.forEach(s => {
      const prod = s.productId as any;
      invSheet.addRow({
        name: prod ? prod.name : 'Unknown Product',
        stock: s.currentStock,
        minStock: s.minStock,
        mrp: s.mrp,
        price: s.sellingPrice,
      });
    });

    await workbook.xlsx.writeFile(filePath);
    return `/uploads/reports/${filename}`;
  }

  async generatePdfReport(storeId: string): Promise<string> {
    const summary = await this.getDashboardSummary(storeId);
    
    // Create folders
    const reportsDir = path.join(process.cwd(), 'uploads', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const filename = `Report-Store-${storeId}-${Date.now()}.pdf`;
    const filePath = path.join(reportsDir, filename);

    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Title
    doc.fillColor('#1E3A8A').fontSize(22).text('Store Analytics Performance Report', { align: 'center' });
    doc.fontSize(10).fillColor('#6B7280').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Metrics Box Grid
    doc.strokeColor('#E5E7EB').lineWidth(1).rect(50, 120, 500, 100).stroke();
    doc.fillColor('#1F2937').fontSize(12);
    
    doc.text(`Total Sales Revenue: Rs. ${summary.metrics.totalRevenue.toFixed(2)}`, 70, 140);
    doc.text(`Total Orders Completed: ${summary.metrics.ordersCount}`, 70, 160);
    doc.text(`Total Store Expenses: Rs. ${summary.metrics.totalExpenses.toFixed(2)}`, 70, 180);

    doc.text(`Net Tax Collected: Rs. ${summary.metrics.totalTax.toFixed(2)}`, 320, 140);
    doc.text(`Low Stock Warnings: ${summary.metrics.lowStockCount} items`, 320, 160);
    doc.text(`Estimated Net Profit: Rs. ${summary.metrics.netProfit.toFixed(2)}`, 320, 180);

    doc.moveDown(4);
    
    // Chart details explanation
    doc.fontSize(14).fillColor('#1E3A8A').text('Monthly Sales Breakdown Overview', 50, 240);
    doc.strokeColor('#CBD5E1').moveTo(50, 260).lineTo(550, 260).stroke();
    doc.moveDown();

    let y = 285;
    doc.fontSize(10).fillColor('#374151');
    summary.chartData.forEach(c => {
      if (c.revenue > 0) {
        doc.text(`${c.month}: Revenue - Rs. ${c.revenue.toFixed(2)} (${c.orders} orders)`, 70, y);
        y += 15;
      }
    });

    doc.end();
    return `/uploads/reports/${filename}`;
  }
}
