import { Request, Response } from 'express';
import { EventService } from '../services/eventService.js';
import { db } from '../models/database.js';
import { Logger } from '../utils/logger.js';

export class EventsController {
  public static handlePostEvent(req: Request, res: Response): void {
    const correlationId = (req.headers['x-correlation-id'] as string) || `REQ-${Date.now().toString(36)}`;

    try {
      const payload = req.body;

      if (!payload) {
        Logger.warn('INGESTION', 'Rejected request with empty body', correlationId);
        res.status(400).json({
          success: false,
          error_category: 'VALIDATION_ERROR',
          message: 'Invalid payload: Request body cannot be empty.'
        });
        return;
      }

      // Support batch ingestion if an array of events is submitted
      if (Array.isArray(payload)) {
        if (payload.length === 0) {
          res.status(400).json({
            success: false,
            error_category: 'VALIDATION_ERROR',
            message: 'Batch array cannot be empty.'
          });
          return;
        }

        const processed = [];
        const errors = [];

        for (let i = 0; i < payload.length; i++) {
          try {
            const evt = EventService.processEvent(payload[i], correlationId);
            processed.push(evt);
          } catch (itemErr: any) {
            errors.push({ index: i, message: itemErr.message });
          }
        }

        res.status(201).json({
          success: true,
          batch: true,
          records_processed: payload.length,
          records_accepted: processed.length,
          records_rejected: errors.length,
          errors: errors.length > 0 ? errors : undefined,
          events: processed
        });
        return;
      }

      // Single event ingestion
      const canonicalEvent = EventService.processEvent(payload, correlationId);

      res.status(201).json({
        success: true,
        event_id: canonicalEvent.event_id,
        correlation_id: correlationId,
        message: 'Event received'
      });
    } catch (err: any) {
      const isValidationError = err.message.startsWith('Validation Error') || err.message.includes('Unsupported');
      const statusCode = isValidationError ? 400 : 500;
      const errorCategory = isValidationError ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR';

      Logger.error(
        'INGESTION', 
        `Error ingesting event: ${err.message}`, 
        correlationId, 
        errorCategory
      );

      res.status(statusCode).json({
        success: false,
        error_category: errorCategory,
        message: err.message || 'Internal server error'
      });
    }
  }

  public static handleGetEvents(req: Request, res: Response): void {
    try {
      const source = req.query.source as string | undefined;
      const sessionId = req.query.session_id as string | undefined;
      const rawLimit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const limit = isNaN(rawLimit) || rawLimit <= 0 ? 50 : Math.min(rawLimit, 1000);

      const events = db.getEvents({ source, limit, session_id: sessionId });

      res.status(200).json({
        success: true,
        count: events.length,
        events
      });
    } catch (err: any) {
      Logger.error('QUERY', `Error fetching events: ${err.message}`, 'GET-EVENTS', 'DATABASE_ERROR');
      res.status(500).json({
        success: false,
        error_category: 'DATABASE_ERROR',
        message: err.message || 'Internal server error'
      });
    }
  }

  public static handleTestEvent(req: Request, res: Response): void {
    const correlationId = `TEST-${Date.now().toString(36)}`;
    try {
      const source = (req.body.source || 'ShopPulse') as 'ShopPulse' | 'TechMart';
      const isShopPulse = source === 'ShopPulse';

      const eventTypes = ['CLICKBAIT_CLICK', 'PRODUCT_VIEW', 'SEARCH', 'ADD_TO_CART', 'ORDER_CREATED'];
      const eventType = req.body.event_type || eventTypes[Math.floor(Math.random() * eventTypes.length)];

      let testPayload: any = {
        source,
        event_type: eventType,
        session_id: `${isShopPulse ? 'SP' : 'TM'}-TEST-SESSION-${Math.floor(100 + Math.random() * 900)}`,
        timestamp: new Date().toISOString()
      };

      if (eventType === 'CLICKBAIT_CLICK') {
        testPayload.banner = isShopPulse ? 'Festival Special - 30% Off Everything' : 'Ultimate RTX 4090 Spotlight Drop';
        testPayload.clickbait_tag = 'Flash Sale Banner #1';
        testPayload.target_url = isShopPulse ? '/deals/festival-30' : '/hardware/rtx-4090';
      } else if (eventType === 'SEARCH') {
        testPayload.search_query = isShopPulse ? 'wireless earbuds active noise cancelling' : 'mechanical gaming keyboard rgb';
        testPayload.results_count = Math.floor(4 + Math.random() * 12);
      } else if (eventType === 'ORDER_CREATED') {
        testPayload.order_id = `${isShopPulse ? 'ORD' : 'TXN'}-${Math.floor(10000 + Math.random() * 90000)}`;
        testPayload.total_amount = Math.floor(1499 + Math.random() * 8500);
        testPayload.payment_method = 'UPI / NetBanking';
      } else {
        // PRODUCT_VIEW or ADD_TO_CART
        testPayload.user_id = isShopPulse ? 'TEST_USER_01' : undefined;
        testPayload.user_code = !isShopPulse ? 'TM_TEST_USER_01' : undefined;
        testPayload.product_id = isShopPulse ? 'P001' : undefined;
        testPayload.sku = !isShopPulse ? 'TM-LAP-001' : undefined;
        testPayload.product_name = isShopPulse ? 'Wireless Noise-Cancelling Headphones' : undefined;
        testPayload.item_title = !isShopPulse ? 'Gaming Laptop RTX 4080 Pro' : undefined;
        testPayload.category = isShopPulse ? 'Electronics' : undefined;
        testPayload.department = !isShopPulse ? 'Gaming' : undefined;
        testPayload.view_duration_seconds = Math.floor(15 + Math.random() * 30);
      }

      const canonicalEvent = EventService.processEvent(testPayload, correlationId);

      res.status(201).json({
        success: true,
        message: 'Live telemetry event recorded successfully',
        event: canonicalEvent
      });
    } catch (err: any) {
      Logger.error('INGESTION', `Error generating test event: ${err.message}`, correlationId, 'INTERNAL_ERROR');
      res.status(500).json({
        success: false,
        error_category: 'INTERNAL_ERROR',
        message: err.message || 'Internal server error'
      });
    }
  }
}
