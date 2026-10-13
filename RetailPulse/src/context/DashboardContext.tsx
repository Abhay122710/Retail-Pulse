import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  SourceSelection,
  DashboardTab, 
  ExtractionStep, 
  ExtractionResult, 
  SourceInsights, 
  SourceSummary 
} from '../types';

import { retailPulseApiService } from '../services/retailPulseApiService';
import type { ApiCanonicalEvent, ApiExtractionRecord, ApiSourceRecord } from '../services/retailPulseApiService';
import { extractionService, DATA_SCOPES } from '../services/extractionService';
import confetti from 'canvas-confetti';

interface DashboardContextType {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  selectedSource: SourceSelection;
  selectSource: (source: SourceSelection) => void;
  
  // Connection status & live data streams
  isConnectorConnected: boolean;
  sourcesList: ApiSourceRecord[];
  liveEvents: ApiCanonicalEvent[];
  extractionsHistory: ApiExtractionRecord[];
  lastUpdatedText: string;
  sendTestEvent: (sourceOverride?: 'ShopPulse' | 'TechMart') => Promise<void>;

  // Data extraction options
  selectedDataTypes: string[];
  setSelectedDataTypes: React.Dispatch<React.SetStateAction<string[]>>;
  toggleDataType: (type: string) => void;
  selectAllDataTypes: () => void;
  clearAllDataTypes: () => void;

  // Extraction animation state
  extractionStep: ExtractionStep;
  extractionProgress: number;
  extractionLogMessage: string;
  isExtracting: boolean;
  startExtraction: () => Promise<void>;
  resetExtraction: () => void;

  // Results & Downloadable JSON
  lastExtractionResult: ExtractionResult | null;
  extractedJsonData: any | null;
  extractedRecords: any[];
  downloadCurrentExtractionJson: () => void;
  currentInsights: SourceInsights;
  sourceSummary: SourceSummary;

  // Filters for extracted data table
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedStatusFilter: string;
  setSelectedStatusFilter: (status: string) => void;

  // Theme support
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('extraction');
  const [selectedSource, setSelectedSourceState] = useState<SourceSelection>('ALL SOURCES');

  const [isConnectorConnected, setIsConnectorConnected] = useState<boolean>(true);
  const [sourcesList, setSourcesList] = useState<ApiSourceRecord[]>([]);
  const [liveEvents, setLiveEvents] = useState<ApiCanonicalEvent[]>([]);
  const [extractionsHistory, setExtractionsHistory] = useState<ApiExtractionRecord[]>([]);
  const [lastUpdatedText, setLastUpdatedText] = useState<string>('Just now');

  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>(DATA_SCOPES);

  const [extractionStep, setExtractionStep] = useState<ExtractionStep>('idle');
  const [extractionProgress, setExtractionProgress] = useState<number>(0);
  const [extractionLogMessage, setExtractionLogMessage] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

  const [lastExtractionResult, setLastExtractionResult] = useState<ExtractionResult | null>(null);
  const [extractedJsonData, setExtractedJsonData] = useState<any | null>(null);
  const [extractedRecords, setExtractedRecords] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');

  // Baseline empty insights without fake demo numbers
  const [currentInsights] = useState<SourceInsights>({
    source: 'ShopPulse',
    totalRevenue: '₹0',
    totalOrdersOrTx: '0',
    topProduct: 'Live Stream Active',
    topCategoryOrDept: 'Ecommerce',
    avgValue: '₹0',
    topLocationOrStock: 'Active Stream',
    kpis: [],
    revenueTrend: [],
    categoryBreakdown: [],
    topProducts: [],
    statusDistribution: []
  });

  // Theme state: default to 'light' (Mindora aesthetic) with localStorage persistence
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('retailpulse_theme');
      return (saved === 'dark' || saved === 'light') ? saved : 'light';
    } catch {
      return 'light';
    }
  });

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('retailpulse_theme', newTheme);
    } catch {
      // ignore
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  // Fetch Live Data from Connector Server
  const fetchLiveData = async () => {
    const isHealthy = await retailPulseApiService.getHealth();
    setIsConnectorConnected(isHealthy);

    if (isHealthy) {
      try {
        const [sources, events, extractions] = await Promise.all([
          retailPulseApiService.getSources(),
          retailPulseApiService.getEvents(selectedSource, 100),
          retailPulseApiService.getExtractions(selectedSource)
        ]);

        if (sources && sources.length > 0) setSourcesList(sources);
        if (events) {
          setLiveEvents(events);
          // If no extraction has been performed yet, seed the table with fresh live events
          if (!lastExtractionResult && events.length > 0) {
            setExtractedRecords(events);
          }
        }
        if (extractions) setExtractionsHistory(extractions);
        setLastUpdatedText(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (err) {
        console.warn('Error fetching live data:', err);
      }
    }
  };

  // Poll Connector API every 2.5 seconds for fresh active data from both sites
  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 2500);
    return () => clearInterval(interval);
  }, [selectedSource]);

  const selectSource = (source: SourceSelection) => {
    setSelectedSourceState(source);
    setExtractionStep('idle');
    setExtractionProgress(0);
  };

  const toggleDataType = (type: string) => {
    setSelectedDataTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const selectAllDataTypes = () => {
    setSelectedDataTypes(DATA_SCOPES);
  };

  const clearAllDataTypes = () => {
    setSelectedDataTypes([]);
  };

  const sendTestEvent = async (sourceOverride?: 'ShopPulse' | 'TechMart') => {
    const targetSource = sourceOverride || (selectedSource === 'TechMart' ? 'TechMart' : 'ShopPulse');
    await retailPulseApiService.sendTestEvent(targetSource);
    await fetchLiveData();

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.4 },
      colors: ['#A068FF', '#00F0FF', '#10B981']
    });
  };

  const downloadCurrentExtractionJson = () => {
    if (!extractedJsonData) return;
    const src = (lastExtractionResult?.source || selectedSource || 'retail_pulse').toLowerCase().replace(/\s+/g, '_');
    const id = lastExtractionResult?.extractionId || Date.now().toString().slice(-6);
    retailPulseApiService.downloadJsonFile(extractedJsonData, `retail_pulse_extracted_${src}_${id}.json`);
  };

  const startExtraction = async () => {
    if (selectedDataTypes.length === 0) return;

    setIsExtracting(true);
    setExtractionStep('connecting');
    setExtractionProgress(15);
    setExtractionLogMessage(`Connecting to ${selectedSource === 'ALL SOURCES' ? 'both active storefronts' : selectedSource}...`);

    try {
      await new Promise((r) => setTimeout(r, 400));
      setExtractionStep('fetching');
      setExtractionProgress(45);
      setExtractionLogMessage(`Extracting live telemetry, clicks, and canonical events...`);

      await new Promise((r) => setTimeout(r, 450));
      setExtractionStep('processing');
      setExtractionProgress(80);
      setExtractionLogMessage(`Validating canonical schemas and bundling JSON payload...`);

      // Call backend extraction endpoint to get fresh real dataset
      const res = await retailPulseApiService.runExtraction(selectedSource, selectedDataTypes);
      
      await new Promise((r) => setTimeout(r, 300));
      setExtractionStep('complete');
      setExtractionProgress(100);

      if (res) {
        const resultObj: ExtractionResult = {
          source: res.source,
          recordsExtracted: res.records_extracted,
          dataTypes: selectedDataTypes,
          extractionTime: '1.2s',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          status: 'SUCCESS',
          extractionId: res.extraction_id,
          data: res.data
        };

        setLastExtractionResult(resultObj);
        setExtractedJsonData(res.data);
        if (res.data && res.data.events) {
          setExtractedRecords(res.data.events);
        }

        setExtractionLogMessage(`Extraction successful! ${res.records_extracted} fresh records compiled into JSON.`);

        // Automatically trigger browser download of the freshly compiled JSON file!
        const srcTag = res.source.toLowerCase().replace(/\s+/g, '_');
        retailPulseApiService.downloadJsonFile(res.data, `retail_pulse_extracted_${srcTag}_${res.extraction_id}.json`);

        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#10B981', '#00F0FF', '#A068FF']
        });
      }

      await fetchLiveData();

    } catch (err) {
      console.error("Extraction error", err);
      setExtractionLogMessage("Extraction error encountered. Please check connection.");
    } finally {
      setTimeout(() => {
        setIsExtracting(false);
      }, 500);
    }
  };

  const resetExtraction = () => {
    setExtractionStep('idle');
    setExtractionProgress(0);
    setExtractionLogMessage('');
  };

  const sourceSummary = extractionService.getSourceSummary(selectedSource);

  return (
    <DashboardContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedSource,
        selectSource,
        isConnectorConnected,
        sourcesList,
        liveEvents,
        extractionsHistory,
        lastUpdatedText,
        sendTestEvent,
        selectedDataTypes,
        setSelectedDataTypes,
        toggleDataType,
        selectAllDataTypes,
        clearAllDataTypes,
        extractionStep,
        extractionProgress,
        extractionLogMessage,
        isExtracting,
        startExtraction,
        resetExtraction,
        lastExtractionResult,
        extractedJsonData,
        extractedRecords,
        downloadCurrentExtractionJson,
        currentInsights,
        sourceSummary,
        searchQuery,
        setSearchQuery,
        selectedStatusFilter,
        setSelectedStatusFilter,
        theme,
        setTheme,
        toggleTheme
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
