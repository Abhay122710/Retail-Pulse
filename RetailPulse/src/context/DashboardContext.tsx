import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  SourceId, 
  SourceSelection,
  DashboardTab, 
  ExtractionStep, 
  ExtractionResult, 
  ExtractedRecord, 
  SourceInsights, 
  SourceSummary 
} from '../types';

import { retailPulseApiService } from '../services/retailPulseApiService';
import type { ApiCanonicalEvent, ApiExtractionRecord, ApiSourceRecord } from '../services/retailPulseApiService';
import { extractionService } from '../services/extractionService';
import { mockShopPulseService } from '../services/mockShopPulseService';
import { mockTechMartService } from '../services/mockTechMartService';
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

  // Results & Insights
  lastExtractionResult: ExtractionResult | null;
  extractedRecords: ExtractedRecord[];
  currentInsights: SourceInsights;
  sourceSummary: SourceSummary;

  // Filters for extracted data table
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedStatusFilter: string;
  setSelectedStatusFilter: (status: string) => void;

  // Theme support (light = Mindora aesthetic, dark = Cyber dashboard)
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [selectedSource, setSelectedSourceState] = useState<SourceSelection>('ShopPulse');

  const [isConnectorConnected, setIsConnectorConnected] = useState<boolean>(true);
  const [sourcesList, setSourcesList] = useState<ApiSourceRecord[]>([]);
  const [liveEvents, setLiveEvents] = useState<ApiCanonicalEvent[]>([]);
  const [extractionsHistory, setExtractionsHistory] = useState<ApiExtractionRecord[]>([]);
  const [lastUpdatedText, setLastUpdatedText] = useState<string>('Just now');

  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>(
    mockShopPulseService.getSummary().dataAvailable
  );

  const [extractionStep, setExtractionStep] = useState<ExtractionStep>('idle');
  const [extractionProgress, setExtractionProgress] = useState<number>(0);
  const [extractionLogMessage, setExtractionLogMessage] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

  const [lastExtractionResult, setLastExtractionResult] = useState<ExtractionResult | null>({
    source: 'ShopPulse',
    recordsExtracted: 4820,
    dataTypes: ['Customers', 'Products', 'Orders'],
    extractionTime: '2.4s',
    timestamp: '10:42 AM',
    status: 'Successful'
  });

  const [extractedRecords, setExtractedRecords] = useState<ExtractedRecord[]>(
    mockShopPulseService.getRecords()
  );

  const [currentInsights, setCurrentInsights] = useState<SourceInsights>(
    mockShopPulseService.getInsights()
  );

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');

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
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Fetch Live Data from Connector Server
  const fetchLiveData = async () => {
    const isHealthy = await retailPulseApiService.getHealth();
    setIsConnectorConnected(isHealthy);

    if (isHealthy) {
      const [sources, events, insightsData, extractions] = await Promise.all([
        retailPulseApiService.getSources(),
        retailPulseApiService.getEvents(selectedSource, 50),
        retailPulseApiService.getInsights(selectedSource),
        retailPulseApiService.getExtractions(selectedSource)
      ]);

      if (sources && sources.length > 0) setSourcesList(sources);
      if (events) setLiveEvents(events);
      if (extractions) setExtractionsHistory(extractions);
      if (insightsData) setCurrentInsights(insightsData);
      setLastUpdatedText(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
  };

  // Poll Connector API every 5 seconds for live activity
  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 5000);
    return () => clearInterval(interval);
  }, [selectedSource]);

  // When selectedSource changes, update default options & mock fallback views
  const selectSource = (source: SourceSelection) => {
    setSelectedSourceState(source);
    const targetSourceId: SourceId = source === 'TechMart' ? 'TechMart' : 'ShopPulse';
    const summary = extractionService.getSourceSummary(targetSourceId);
    setSelectedDataTypes(summary.dataAvailable);
    setExtractionStep('idle');
    setExtractionProgress(0);

    if (source === 'ShopPulse') {
      setExtractedRecords(mockShopPulseService.getRecords());
      setCurrentInsights(mockShopPulseService.getInsights());
    } else if (source === 'TechMart') {
      setExtractedRecords(mockTechMartService.getRecords());
      setCurrentInsights(mockTechMartService.getInsights());
    } else {
      setExtractedRecords([...mockShopPulseService.getRecords(), ...mockTechMartService.getRecords()]);
    }
  };

  const toggleDataType = (type: string) => {
    setSelectedDataTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const selectAllDataTypes = () => {
    const targetSourceId: SourceId = selectedSource === 'TechMart' ? 'TechMart' : 'ShopPulse';
    const summary = extractionService.getSourceSummary(targetSourceId);
    setSelectedDataTypes(summary.dataAvailable);
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

  const startExtraction = async () => {
    if (selectedDataTypes.length === 0) return;

    setIsExtracting(true);
    setExtractionStep('connecting');
    setExtractionProgress(0);

    try {
      const targetSource: SourceId = selectedSource === 'TechMart' ? 'TechMart' : 'ShopPulse';
      
      const { result, records, insights } = await extractionService.runDataExtraction(
        targetSource,
        selectedDataTypes,
        (progress, message, step) => {
          setExtractionProgress(progress);
          setExtractionLogMessage(message);
          setExtractionStep(step);
        }
      );

      // Trigger backend connector extraction endpoint
      if (isConnectorConnected) {
        await retailPulseApiService.runExtraction(selectedSource, selectedDataTypes);
        await fetchLiveData();
      }

      setLastExtractionResult(result);
      setExtractedRecords(records);
      if (!isConnectorConnected) {
        setCurrentInsights(insights);
      }

      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#A068FF', '#00F0FF', '#10B981']
      });

    } catch (err) {
      console.error("Extraction error", err);
    } finally {
      setIsExtracting(false);
    }
  };

  const resetExtraction = () => {
    setExtractionStep('idle');
    setExtractionProgress(0);
    setExtractionLogMessage('');
  };

  const targetSourceId: SourceId = selectedSource === 'TechMart' ? 'TechMart' : 'ShopPulse';
  const sourceSummary = extractionService.getSourceSummary(targetSourceId);

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
        extractedRecords,
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
  if (!context) throw new Error('useDashboard must be used within DashboardProvider');
  return context;
};
