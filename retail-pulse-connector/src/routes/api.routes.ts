import { Router } from 'express';
import { EventsController } from '../controllers/events.controller.js';
import { ExtractController } from '../controllers/extract.controller.js';
import { SourcesController } from '../controllers/sources.controller.js';
import { InsightsController } from '../controllers/insights.controller.js';
import { HealthController } from '../controllers/health.controller.js';
import { PredictiveController } from '../controllers/predictive.controller.js';
import { PipelineController } from '../controllers/pipeline.controller.js';
import { BenchmarkController } from '../controllers/benchmark.controller.js';
import { ProfitabilityController } from '../controllers/profitability.controller.js';
import { SimulationController } from '../controllers/simulation.controller.js';
import { SegmentationController } from '../controllers/segmentation.controller.js';
import { ReportController } from '../controllers/report.controller.js';
import { AIController } from '../controllers/ai.controller.js';

const router = Router();

// Health Check
router.get('/health', HealthController.handleHealthCheck);

// PulseAI Retail Intelligence Assistant (Phase 3)
router.post('/ai/chat', AIController.handleChat);

// Pipeline & Data Quality Monitoring (Feature 4)
router.get('/pipeline/monitoring', PipelineController.getPipelineMonitoring);

// Cross-Store Benchmarking (Feature 7)
router.get('/analytics/benchmark', BenchmarkController.getBenchmark);

// Product Profitability and Margin Analytics (Feature 2)
router.get('/analytics/profitability', ProfitabilityController.getProfitability);

// Sales Segmentation & Cohort Analysis (Feature 5)
router.get('/analytics/segmentation', SegmentationController.getSegmentation);

// Automated Business Reports (Feature 6)
router.get('/reports/executive', ReportController.getExecutiveReport);
router.get('/reports/export-csv', ReportController.exportCsv);

// Events API
router.post('/events', EventsController.handlePostEvent);
router.get('/events', EventsController.handleGetEvents);
router.post('/test-event', EventsController.handleTestEvent);

// Data Extraction API
router.post('/extract', ExtractController.handlePostExtract);
router.post('/extractions', ExtractController.handlePostExtract);
router.get('/extractions', ExtractController.handleGetExtractions);
router.get('/extractions/:id/download', ExtractController.handleDownloadExtraction);
router.get('/extractions/:id/json', ExtractController.handleDownloadExtraction);

// Sources & Summary API
router.get('/sources', SourcesController.handleGetSources);
router.get('/summary', SourcesController.handleGetSummary);

// Insights API
router.get('/insights', InsightsController.handleGetInsights);

// Predictive Analytics Engine API (Part 3)
router.get('/predictive/forecasts', PredictiveController.getForecasts);
router.post('/predictive/forecasts/generate', PredictiveController.generateForecast);
router.get('/predictive/inventory', PredictiveController.getInventoryRecommendations);
router.get('/predictive/anomalies', PredictiveController.getAnomalies);
router.post('/predictive/anomalies/:id/ack', PredictiveController.acknowledgeAnomaly);
router.get('/predictive/evaluation', PredictiveController.getModelEvaluation);
router.get('/predictive/timeseries', PredictiveController.getTimeSeries);

// What-If Business Simulator (Feature 1)
router.post('/predictive/simulate', SimulationController.simulateScenario);
router.get('/predictive/scenarios', SimulationController.getSavedScenarios);
router.post('/predictive/scenarios', SimulationController.saveScenario);
router.delete('/predictive/scenarios/:id', SimulationController.deleteScenario);

export default router;

