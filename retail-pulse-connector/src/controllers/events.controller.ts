import { Request, Response } from 'express';
import { EventService } from '../services/eventService.js';
import { db } from '../models/database.js';

export class EventsController {
  public static handlePostEvent(req: Request, res: Response): void {
    try {
      const payload = req.body;
      if (!payload || !payload.source || !payload.event_type) {
        res.status(400).json({
          success: false,
          message: 'Invalid payload: source and event_type are required.'
        });
        return;
      }

      const canonicalEvent = EventService.processEvent(payload);

      res.status(201).json({
        success: true,
        event_id: canonicalEvent.event_id,
        message: 'Event received'
      });
    } catch (err: any) {
      console.error('[EventsController] Error handling event:', err);
      res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
      });
    }
  }

  public static handleGetEvents(req: Request, res: Response): void {
    try {
      const source = req.query.source as string | undefined;
      const sessionId = req.query.session_id as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

      const events = db.getEvents({ source, limit, session_id: sessionId });

      res.status(200).json({
        success: true,
        count: events.length,
        events
      });
    } catch (err: any) {
      console.error('[EventsController] Error fetching events:', err);
      res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
      });
    }
  }

  public static handleTestEvent(req: Request, res: Response): void {
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

      const canonicalEvent = EventService.processEvent(testPayload);

      res.status(201).json({
        success: true,
        message: 'Live telemetry event recorded successfully',
        event: canonicalEvent
      });
    } catch (err: any) {
      console.error('[EventsController] Error handling test event:', err);
      res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
      });
    }
  }
}
