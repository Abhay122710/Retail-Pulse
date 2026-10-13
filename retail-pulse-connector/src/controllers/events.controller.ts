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

      const testPayload = {
        source,
        event_type: 'PRODUCT_VIEW',
        session_id: `${isShopPulse ? 'SP' : 'TM'}-TEST-SESSION-${Math.floor(100 + Math.random() * 900)}`,
        user_id: isShopPulse ? 'TEST_USER_01' : undefined,
        user_code: !isShopPulse ? 'TM_TEST_USER_01' : undefined,
        product_id: isShopPulse ? 'P001' : undefined,
        sku: !isShopPulse ? 'TM-LAP-001' : undefined,
        product_name: isShopPulse ? 'Wireless Headphones' : undefined,
        item_title: !isShopPulse ? 'Gaming Laptop RTX 4080' : undefined,
        category: isShopPulse ? 'Electronics' : undefined,
        department: !isShopPulse ? 'Gaming' : undefined,
        view_duration_seconds: Math.floor(15 + Math.random() * 30),
        timestamp: new Date().toISOString()
      };

      const canonicalEvent = EventService.processEvent(testPayload);

      res.status(201).json({
        success: true,
        message: 'Test event injected successfully',
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
