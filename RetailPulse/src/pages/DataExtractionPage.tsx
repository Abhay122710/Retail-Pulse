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
          <h1 className="text-3xl font-black text-white font-urbanist tracking-tight">
            Data Extraction
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Extract structured data from the selected e-commerce source.
          </p>
        </div>

        {/* Selected Source Header Badge */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl glass-panel border border-[#A068FF]/30 text-xs">
          <span className="text-slate-400 font-semibold">SOURCE</span>
          <span className="font-bold text-white font-urbanist text-sm">{selectedSource}</span>
          <span className="flex items-center gap-1 text-emerald-400 font-mono font-bold text-[11px] pl-2 border-l border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Connected
          </span>
        </div>
      </div>

      {/* MAIN EXTRACTION CARD */}
      <div className="glass-card p-8 rounded-3xl border border-[#A068FF]/30 space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#A068FF]/20">
          <div>
            <h2 className="text-xl font-bold text-white font-urbanist flex items-center gap-2">
              <Download className="w-5 h-5 text-[#A068FF]" />
              DATA TO EXTRACT
            </h2>
            <p className="text-xs text-slate-400">Select schema objects to include in extraction package</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={selectAllDataTypes}
              className="px-3.5 py-1.5 rounded-xl bg-[#070319] border border-[#A068FF]/30 text-xs font-semibold text-slate-200 hover:text-white hover:border-[#A068FF] transition-all flex items-center gap-1.5"
            >
              <CheckSquare className="w-3.5 h-3.5 text-[#A068FF]" /> Select All
            </button>
            <button
              onClick={clearAllDataTypes}
              className="px-3.5 py-1.5 rounded-xl bg-[#070319] border border-[#A068FF]/30 text-xs font-semibold text-slate-400 hover:text-rose-400 transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear All
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
                    ? 'bg-gradient-to-r from-[#A068FF]/20 to-[#7C3AED]/10 border-[#A068FF] text-white shadow-md shadow-[#A068FF]/15'
                    : 'bg-[#070319]/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isChecked ? (
                    <CheckSquare className="w-5 h-5 text-[#A068FF] shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-600 shrink-0 group-hover:text-slate-400" />
                  )}
                  <span className="text-sm font-semibold font-urbanist">{type}</span>
                </div>

                <span className="text-[10px] font-mono text-slate-500">Schema Node</span>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#A068FF]/20">
          <p className="text-xs text-slate-400">
            {selectedDataTypes.length} of {availableTypes.length} data streams selected
          </p>

          <button
            onClick={startExtraction}
            disabled={selectedDataTypes.length === 0 || isExtracting}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 ${
              selectedDataTypes.length === 0 || isExtracting
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-[#A068FF] to-[#7C3AED] text-white shadow-[#A068FF]/40 hover:scale-105 active:scale-95'
            }`}
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Extracting Data...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 fill-current" /> Extract Data
              </>
            )}
          </button>
        </div>

      </div>

      {/* EXTRACTION ANIMATION MODAL OVERLAY */}
      {isExtracting && (
        <div className="fixed inset-0 z-50 bg-[#060218]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-[#A068FF] space-y-6 text-center shadow-2xl shadow-[#A068FF]/30">
            
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              {/* Futuristic Spinning Rings */}
              <div className="absolute inset-0 rounded-full border-2 border-t-[#A068FF] border-r-transparent border-b-[#00F0FF] border-l-transparent animate-spin-slow" />
              <div className="absolute inset-2 rounded-full border-2 border-t-transparent border-r-[#A068FF] border-b-transparent border-l-[#10B981] animate-spin-reverse" />
              <Activity className="w-10 h-10 text-[#A068FF] animate-pulse" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white font-urbanist">EXTRACTION IN PROGRESS</h3>
              <p className="text-xs font-mono text-[#A068FF] mt-1 uppercase tracking-wider">
                {extractionStep}
              </p>
            </div>

            {/* Progress Bar & Percentage */}
            <div className="space-y-2">
              <div className="w-full bg-[#070319] h-3 rounded-full overflow-hidden border border-[#A068FF]/30 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-[#A068FF] via-[#00F0FF] to-[#10B981] rounded-full transition-all duration-300"
                  style={{ width: `${extractionProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Progress</span>
                <span className="text-emerald-400 font-bold">{extractionProgress}%</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-mono bg-[#070319] p-3 rounded-xl border border-[#A068FF]/20">
              {extractionLogMessage}
            </p>
          </div>
        </div>
      )}

      {/* EXTRACTION RESULT CONTAINER */}
      {lastExtractionResult && !isExtracting && (
        <div className="glass-card p-8 rounded-3xl border border-emerald-500/40 bg-emerald-500/5 space-y-6 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white font-urbanist">Extraction Complete</h3>
                <p className="text-xs text-slate-400">Data package ready for downstream analytics</p>
              </div>
            </div>

            <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono text-xs font-bold">
              ✓ Successful
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#070319] border border-[#A068FF]/20">
              <p className="text-slate-400">Source Platform</p>
              <p className="text-lg font-bold text-white font-urbanist">{lastExtractionResult.source}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#070319] border border-[#A068FF]/20">
              <p className="text-slate-400">Records Extracted</p>
              <p className="text-lg font-bold text-emerald-400 font-urbanist">
                {lastExtractionResult.recordsExtracted.toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#070319] border border-[#A068FF]/20">
              <p className="text-slate-400">Data Types</p>
              <p className="text-xs font-semibold text-slate-200 truncate">
                {lastExtractionResult.dataTypes.join(', ')}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#070319] border border-[#A068FF]/20">
              <p className="text-slate-400">Extraction Time</p>
              <p className="text-lg font-bold text-[#A068FF] font-urbanist">{lastExtractionResult.extractionTime}</p>
            </div>
          </div>

          {/* Result Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              onClick={() => setActiveTab('extracted-data')}
              className="w-full sm:w-1/2 py-3 rounded-2xl bg-[#070319] border border-[#A068FF]/40 text-[#A068FF] font-bold text-xs hover:bg-[#A068FF]/20 transition-all flex items-center justify-center gap-2"
            >
              <Table className="w-4 h-4" /> View Extracted Data
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className="w-full sm:w-1/2 py-3 rounded-2xl bg-gradient-to-r from-[#A068FF] to-[#7C3AED] text-white font-bold text-xs shadow-lg shadow-[#A068FF]/30 hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <LineChart className="w-4 h-4" /> View Insights <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
