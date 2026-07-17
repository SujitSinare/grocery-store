import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'alerts',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`WebSocket client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`WebSocket client disconnected: ${client.id}`);
  }

  @OnEvent('stock.low')
  handleLowStockEvent(payload: {
    storeId: string;
    productId: string;
    productName: string;
    currentStock: number;
    minStock: number;
  }) {
    console.log(`[WS Broadcast] Low Stock Alert for ${payload.productName} (Qty: ${payload.currentStock})`);
    this.server.emit('low-stock-alert', payload);
  }

  @OnEvent('order.placed')
  handleNewOrderEvent(payload: {
    orderId: string;
    storeId: string;
    grandTotal: number;
    paymentMethod: string;
  }) {
    console.log(`[WS Broadcast] New Order Placed: ${payload.orderId}`);
    this.server.emit('new-order-alert', payload);
  }
}
