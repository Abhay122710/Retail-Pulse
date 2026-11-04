import { Request, Response } from 'express';
import { PredictiveController } from './predictive.controller.js';

export class AIController {
  public static async handleChat(req: Request, res: Response): Promise<void> {
    try {
      const { query, source = 'ALL SOURCES', conversation_history = [] } = req.body;

      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        res.status(400).json({
          success: false,
          error_category: 'VALIDATION_ERROR',
          message: 'Field "query" is required and must be a non-empty string.'
        });
        return;
      }

      if (query.length > 1000) {
        res.status(400).json({
          success: false,
          error_category: 'VALIDATION_ERROR',
          message: 'Field "query" exceeds maximum permitted length of 1000 characters.'
        });
        return;
      }

      if (!Array.isArray(conversation_history)) {
        res.status(400).json({
          success: false,
          error_category: 'VALIDATION_ERROR',
          message: 'Field "conversation_history" must be an array.'
        });
        return;
      }

      if (conversation_history.length > 30) {
        res.status(400).json({
          success: false,
          error_category: 'VALIDATION_ERROR',
          message: 'Field "conversation_history" cannot exceed 30 messages.'
        });
        return;
      }

      for (let i = 0; i < conversation_history.length; i++) {
        const item = conversation_history[i];
        if (!item || typeof item !== 'object' || typeof item.content !== 'string' || item.content.length > 2000) {
          res.status(400).json({
            success: false,
            error_category: 'VALIDATION_ERROR',
            message: `Invalid conversation_history message at index ${i}: content must be a string under 2000 characters.`
          });
          return;
        }
      }

      // Query Python ML Service PulseAI agent
      const pyData = await (PredictiveController as any).queryPythonService('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          source: source || 'ALL SOURCES',
          conversation_history
        })
      });

      if (pyData) {
        res.status(200).json({
          success: true,
          engine: pyData.engine || 'PulseAI-PythonFastAPI',
          data: pyData
        });
        return;
      }

      // Python service offline
      res.status(503).json({
        success: false,
        error: 'PYTHON_AI_SERVICE_UNAVAILABLE',
        message: 'The Python AI service (port 8000) is unreachable. PulseAI tool execution and reasoning require an active Python analytics engine.'
      });
    } catch (err: any) {
      console.error('[AIController] Error orchestrating AI chat:', err);
      res.status(500).json({
        success: false,
        message: 'Internal error communicating with PulseAI agent',
        error: err.message
      });
    }
  }
}
