import type { SourceId, SourceSelection, ExtractionResult, ExtractedRecord, SourceInsights } from '../types';
import { mockShopPulseService } from './mockShopPulseService';
import { mockTechMartService } from './mockTechMartService';

export interface ExtractionProgressCallback {
  (progress: number, stepMessage: string, step: 'connecting' | 'fetching' | 'processing' | 'complete'): void;
}

export const extractionService = {
  getSourceSummary(source: SourceSelection) {
    if (source === 'ShopPulse' || source === 'ALL SOURCES') {
      return mockShopPulseService.getSummary();
    }
    return mockTechMartService.getSummary();
  },

  getAvailableDataTypes(source: SourceSelection): string[] {
    if (source === 'ShopPulse' || source === 'ALL SOURCES') {
      return mockShopPulseService.getSummary().dataAvailable;
    }
    return mockTechMartService.getSummary().dataAvailable;
  },

  async runDataExtraction(
    source: SourceId,
    selectedDataTypes: string[],
    onProgress: ExtractionProgressCallback
  ): Promise<{ result: ExtractionResult; records: ExtractedRecord[]; insights: SourceInsights }> {
    
    // Step 1: Connecting to Source
    onProgress(15, `Connecting to ${source} API Gateway...`, 'connecting');
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Step 2: Fetching Data
    onProgress(45, `Fetching records for [${selectedDataTypes.join(', ')}]...`, 'fetching');
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Step 3: Processing & Structuring Records
    onProgress(80, `Processing schema & generating structured data...`, 'processing');
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Step 4: Extraction Complete
    onProgress(100, `Extraction complete! 4,820 records successfully extracted.`, 'complete');
    await new Promise((resolve) => setTimeout(resolve, 200));

    const totalAvailable = source === 'ShopPulse' ? 12450 : 18920;
    const extractedCount = Math.round((selectedDataTypes.length / (source === 'ShopPulse' ? 5 : 6)) * totalAvailable * 0.4) || 4820;

    const result: ExtractionResult = {
      source,
      recordsExtracted: extractedCount,
      dataTypes: selectedDataTypes,
      extractionTime: '2.4s',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'Successful'
    };

    const records = source === 'ShopPulse' 
      ? mockShopPulseService.getRecords() 
      : mockTechMartService.getRecords();

    const insights = source === 'ShopPulse' 
      ? mockShopPulseService.getInsights() 
      : mockTechMartService.getInsights();

    return { result, records, insights };
  }
};
