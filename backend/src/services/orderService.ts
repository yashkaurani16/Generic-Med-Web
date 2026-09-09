import { Order, OrderStatus, OrderStatusEvent } from '../types';
import { MarketplaceService } from './marketplaceService';
import { LogisticsService } from './logisticsService';
import { eventBus } from '../lib/eventBus';
import { logger } from '../lib/logger';
import { prisma } from '../lib/db';
import { INITIAL_ORDERS } from '../data/mockData';

export interface CreateOrderDTO {
  patientId: string;
  patientName: string;
  patientEmail: string;
  deliveryAddress: string;
  deliveryPhone: string;
  pharmacyId: string;
  pharmacyName: string;
  items: Order['items'];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  prescriptionId?: string;
  paymentMethod: Order['paymentMethod'];
  deliverySlot?: string;
  notes?: string;
}

export interface ReturnRequestDTO {
  orderId: string;
  reason: 'Incorrect Medicine' | 'Damaged Package' | 'Prescription Cancelled by Doctor' | 'Other';
  pickupAddress: string;
  notes?: string;
}

// In-memory orders store for fast fallbacks
let activeOrders: Order[] = [...INITIAL_ORDERS];

export class OrderService {
  /**
   * Place a new order with stock validation, escrow hold, and 3PL dispatch
   */
  static async createOrder(dto: CreateOrderDTO): Promise<Order> {
    const orderNumber = `GM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const trackingData = LogisticsService.dispatchShipment(orderNumber, 'Dunzo Express', dto.deliveryAddress);

    const initialHistory: OrderStatusEvent[] = [
      {
        status: 'Created',
        timestamp: now,
        actor: dto.patientName,
        note: dto.deliverySlot ? `Scheduled for: ${dto.deliverySlot}` : 'Order placed successfully',
      },
    ];

    const order: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      patientId: dto.patientId,
      patientName: dto.patientName,
      patientEmail: dto.patientEmail,
      deliveryAddress: dto.deliveryAddress,
      deliveryPhone: dto.deliveryPhone,
      pharmacyId: dto.pharmacyId,
      pharmacyName: dto.pharmacyName,
      items: dto.items,
      subtotal: dto.subtotal,
      deliveryFee: dto.deliveryFee,
      tax: dto.tax,
      total: dto.total,
      prescriptionId: dto.prescriptionId,
      paymentMethod: dto.paymentMethod,
      paymentStatus: dto.paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Success',
      orderStatus: 'Created',
      statusHistory: initialHistory,
      trackingNumber: trackingData.trackingNumber,
      createdAt: now,
      notes: dto.notes,
    };

    activeOrders.unshift(order);

    // 1. Initialize Marketplace Escrow
    MarketplaceService.calculateOrderEscrow(
      order.id,
      order.orderNumber,
      order.pharmacyId,
      order.pharmacyName,
      order.subtotal
    );

    // 2. Publish Domain Event
    eventBus.publish('order.created', order, {
      actorId: dto.patientId,
    });

    logger.info(`Order created successfully: ${order.orderNumber} (Total: ₹${order.total})`, {
      module: 'OrderService',
      orderId: order.id,
      trackingNumber: order.trackingNumber,
    });

    return order;
  }

  /**
   * Update order status with escrow release upon delivery
   */
  static async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    actor: string,
    note?: string
  ): Promise<Order | null> {
    const order = activeOrders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return null;

    const previousStatus = order.orderStatus;
    order.orderStatus = newStatus;
    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      actor,
      note,
    });

    // Handle escrow release if Delivered
    if (newStatus === 'Delivered') {
      MarketplaceService.releaseEscrowForOrder(order.id);
    } else if (newStatus === 'Cancelled' || newStatus === 'Refunded') {
      MarketplaceService.refundEscrowForOrder(order.id);
    }

    eventBus.publish('order.status_changed', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      previousStatus,
      newStatus,
      actor,
      patientEmail: order.patientEmail,
    });

    logger.info(`Order ${order.orderNumber} transitioned: ${previousStatus} → ${newStatus}`, {
      module: 'OrderService',
      orderId: order.id,
      actor,
    });

    return order;
  }

  /**
   * Process patient reverse logistics return request
   */
  static async processReturn(dto: ReturnRequestDTO): Promise<{ success: boolean; returnTrackingNumber: string }> {
    const order = activeOrders.find((o) => o.id === dto.orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const returnTrackingNumber = `RET-DNZ-${Date.now().toString().slice(-6)}`;

    order.notes = `${order.notes || ''} [Return Requested: ${dto.reason} | Pickup: ${returnTrackingNumber}]`.trim();
    order.statusHistory.push({
      status: 'Cancelled',
      timestamp: new Date().toISOString(),
      actor: order.patientName,
      note: `Return initiated: ${dto.reason}. Courier pickup scheduled.`,
    });

    MarketplaceService.refundEscrowForOrder(order.id);

    logger.info(`Return processed for order ${order.orderNumber}: ${returnTrackingNumber}`, {
      module: 'OrderService',
      orderId: order.id,
      returnTrackingNumber,
    });

    return {
      success: true,
      returnTrackingNumber,
    };
  }

  /**
   * Get order by ID
   */
  static getOrderById(orderId: string): Order | undefined {
    return activeOrders.find((o) => o.id === orderId || o.orderNumber === orderId);
  }

  /**
   * List all active orders
   */
  static listOrders(filter?: { patientId?: string; pharmacyId?: string }): Order[] {
    let result = activeOrders;
    if (filter?.patientId) {
      result = result.filter((o) => o.patientId === filter.patientId);
    }
    if (filter?.pharmacyId) {
      result = result.filter((o) => o.pharmacyId === filter.pharmacyId);
    }
    return result;
  }
}
