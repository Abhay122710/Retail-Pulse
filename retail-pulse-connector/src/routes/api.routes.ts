import { Router } from 'express';
import { EventsController } from '../controllers/events.controller.js';
import { ExtractController } from '../controllers/extract.controller.js';
import { SourcesController } from '../controllers/sources.controller.js';
import { InsightsController } from '../controllers/insights.controller.js';
import { HealthController } from '../controllers/health.controller.js';

const router = Router();

// Health Check
router.get('/health', HealthController.handleHealthCheck);

// Events API
router.post('/events', EventsController.handlePostEvent);
router.get('/events', EventsController.handleGetEvents);
router.post('/test-event', EventsController.handleTestEvent);

// Data Extraction API
router.post('/extract', ExtractController.handlePostExtract);
router.get('/extractions', ExtractController.handleGetExtractions);
router.get('/extractions/:id/download', ExtractController.handleDownloadExtraction);
router.get('/extractions/:id/json', ExtractController.handleDownloadExtraction);

// Sources & Summary API
router.get('/sources', SourcesController.handleGetSources);
router.get('/summary', SourcesController.handleGetSummary);

// Insights API
router.get('/insights', InsightsController.handleGetInsights);

export default router;
