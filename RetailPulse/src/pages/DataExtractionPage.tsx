import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { DataPipelineVisual } from '../components/layout/DataPipelineVisual';
import { 
  Download, 
  CheckSquare, 
  Square, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  Table, 
  LineChart, 
  Activity, 
  Zap
} from 'lucide-react';
import { extractionService } from '../services/extractionService';

export const DataExtractionPage: React.FC = () => {
  const {
    selectedSource,
    selectedDataTypes,
    toggleDataType,
    selectAllDataTypes,
    clearAllDataTypes,
    startExtraction,
    isExtracting,
    extractionStep,
    extractionProgress,
    extractionLogMessage,
    lastExtractionResult,
    setActiveTab
  } = useDashboard();

  const availableTypes = extractionService.getAvailableDataTypes(selectedSource);

  return (
    <div className="space-y-8 animate-fadeIn relative">
      
      {/* Top Visual Pipeline */}
      <DataPipelineVisual />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white font-heading tracking-tight">
            Data Extraction Engine
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm mt-1">
            Extract structured schemas and normalize clickstream events from {selectedSource}.
          </p>
        </div>

        {/* Selected Source Header Badge */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-neutral-50 dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 text-xs self-start sm:self-auto">
          <span className="text-neutral-400 font-semibold">SOURCE</span>
          <span className="font-bold text-neutral-950 dark:text-white font-heading">{selectedSource}</span>
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] pl-2 border-l border-neutral-200 dark:border-neutral-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Link
          </span>
        </div>
      </div>

      {/* MAIN EXTRACTION CARD */}
      <div className="p-6 sm:p-8 rounded-[28px] bg-neutral-50 dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800 space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/60 dark:border-neutral-800">
          <div>
            <h2 className="text-lg font-bold text-neutral-950 dark:text-white font-heading flex items-center gap-2">
              <Download className="w-5 h-5 text-neutral-900 dark:text-white" />
              Select Schema Objects
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Pick which dataset entities to include in the extraction bundle
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={selectAllDataTypes}
              className="pill-btn-subtle px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5" /> Select All
            </button>
            <button
              onClick={clearAllDataTypes}
              className="pill-btn-subtle px-3.5 py-1.5 text-xs font-semibold text-neutral-500 hover:text-rose-600 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>

        {/* Checkbox Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {availableTypes.map((type) => {
            const isChecked = selectedDataTypes.includes(type);

            return (
              <div
                key={type}
                onClick={() => toggleDataType(type)}
                className={`p-4 rounded-2xl cursor-pointer border transition-all flex items-center justify-between group ${
                  isChecked
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-black border-neutral-950 dark:border-white shadow-md'
                    : 'bg-white dark:bg-[#18181b] border-neutral-200/80 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isChecked ? (
                    <CheckSquare className="w-5 h-5 text-white dark:text-black shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-neutral-400 shrink-0 group-hover:text-neutral-600" />
                  )}
                  <span className="text-xs sm:text-sm font-semibold font-heading">{type}</span>
                </div>

                <span className={`text-[10px] font-mono ${isChecked ? 'text-neutral-300 dark:text-neutral-600' : 'text-neutral-400'}`}>
                  Entity
                </span>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-200/60 dark:border-neutral-800">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {selectedDataTypes.length} of {availableTypes.length} entities selected
          </p>

          <button
            onClick={startExtraction}
            disabled={selectedDataTypes.length === 0 || isExtracting}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
              selectedDataTypes.length === 0 || isExtracting
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                : 'pill-btn-dark hover:scale-105 active:scale-95'
            }`}
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Ingestion Running...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" /> Run Live Extraction
              </>
            )}
          </button>
        </div>

      </div>

      {/* EXTRACTION PROGRESS OVERLAY MODAL */}
      {isExtracting && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121212] max-w-md w-full p-8 rounded-[32px] border border-neutral-200 dark:border-neutral-800 space-y-6 text-center shadow-2xl">
            
            <div className="w-20 h-20 mx-auto rounded-full bg-neutral-100 dark:bg-[#18181b] flex items-center justify-center relative">
              <span className="absolute inset-0 rounded-full border-2 border-neutral-900 dark:border-white border-t-transparent animate-spin" />
              <Activity className="w-8 h-8 text-neutral-900 dark:text-white" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-neutral-950 dark:text-white font-heading">
                Extracting Canonical Data
              </h3>
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-1 uppercase tracking-wider">
                {extractionStep}
              </p>
            </div>

            {/* Progress Bar & Percentage */}
            <div className="space-y-2">
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-neutral-950 dark:bg-white rounded-full transition-all duration-300"
                  style={{ width: `${extractionProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-medium text-neutral-500">
                <span>Progress</span>
                <span className="font-bold text-neutral-900 dark:text-white">{extractionProgress}%</span>
              </div>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 font-mono bg-neutral-50 dark:bg-[#18181b] p-3 rounded-xl border border-neutral-200/60 dark:border-neutral-700">
              {extractionLogMessage}
            </p>
          </div>
        </div>
      )}

      {/* EXTRACTION RESULT CONTAINER */}
      {lastExtractionResult && !isExtracting && (
        <div className="p-6 sm:p-8 rounded-[28px] bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/30 space-y-6 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-950 dark:text-white font-heading">
                  Extraction Successful
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Data package synchronized and cached for BI reporting
                </p>
              </div>
            </div>

            <span className="px-3.5 py-1 rounded-full bg-emerald-500 text-white font-semibold text-xs shadow-xs self-start sm:self-auto">
              ✓ Ready for Analytics
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#18181b] border border-neutral-200/60 dark:border-neutral-800">
              <p className="text-neutral-500 dark:text-neutral-400">Source Platform</p>
              <p className="text-base font-bold text-neutral-950 dark:text-white font-heading mt-0.5">
                {lastExtractionResult.source}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#18181b] border border-neutral-200/60 dark:border-neutral-800">
              <p className="text-neutral-500 dark:text-neutral-400">Extracted Records</p>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-heading mt-0.5">
                {lastExtractionResult.recordsExtracted.toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#18181b] border border-neutral-200/60 dark:border-neutral-800">
              <p className="text-neutral-500 dark:text-neutral-400">Entities</p>
              <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate mt-0.5">
                {lastExtractionResult.dataTypes.join(', ')}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#18181b] border border-neutral-200/60 dark:border-neutral-800">
              <p className="text-neutral-500 dark:text-neutral-400">Duration</p>
              <p className="text-base font-bold text-neutral-950 dark:text-white font-heading mt-0.5">
                {lastExtractionResult.extractionTime}
              </p>
            </div>
          </div>

          {/* Result Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('extracted-data')}
              className="w-full sm:w-1/2 py-3 rounded-full pill-btn-subtle font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Table className="w-4 h-4" /> View Extracted Records Table
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className="w-full sm:w-1/2 py-3 rounded-full pill-btn-dark font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <LineChart className="w-4 h-4" /> Explore Insights Engine <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
