import { EventEmitter } from 'events';
import { logger } from './logger';

export type DomainEvent =
  | 'order.created'
  | 'order.status_changed'
  | 'order.cancelled'
  | 'prescription.reviewed'
  | 'settlement.released'
  | 'logistics.dispatched'
  | 'user.data_erased';

export interface EventPayload<T = unknown> {
  eventId: string;
  eventName: DomainEvent;
  timestamp: string;
  actorId?: string;
  data: T;
  correlationId?: string;
}

export type EventHandler<T = unknown> = (payload: EventPayload<T>) => Promise<void> | void;

class TypedEventBus {
  private emitter = new EventEmitter();
  private isProcessing = false;

  constructor() {
    this.emitter.setMaxListeners(50);
  }

  /**
   * Subscribe to a specific domain event
   */
  subscribe<T = unknown>(eventName: DomainEvent, handler: EventHandler<T>): () => void {
    const wrappedHandler = async (payload: EventPayload<T>) => {
      try {
        await handler(payload);
      } catch (err) {
        logger.error(`Error executing handler for event: ${eventName}`, err, {
          module: 'EventBus',
          correlationId: payload.correlationId,
        });
      }
    };

    this.emitter.on(eventName, wrappedHandler);

    return () => {
      this.emitter.off(eventName, wrappedHandler);
    };
  }

  /**
   * Publish a typed domain event asynchronously
   */
  publish<T = unknown>(
    eventName: DomainEvent,
    data: T,
    options?: { actorId?: string; correlationId?: string }
  ): EventPayload<T> {
    const payload: EventPayload<T> = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      eventName,
      timestamp: new Date().toISOString(),
      actorId: options?.actorId,
      correlationId: options?.correlationId,
      data,
    };

    logger.debug(`Event published: ${eventName}`, {
      module: 'EventBus',
      correlationId: payload.correlationId,
      eventId: payload.eventId,
    });

    // Execute handlers on next tick
    setImmediate(() => {
      this.emitter.emit(eventName, payload);
    });

    return payload;
  }
}

export const eventBus = new TypedEventBus();
