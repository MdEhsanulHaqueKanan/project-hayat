import React, { useState, useRef } from 'react';
import axios from 'axios';
import { 
  ShieldAlert, 
  Wifi, 
  Map as MapIcon, 
  Crosshair, 
  Zap, 
  Activity, 
  Navigation2,
  Cpu,
  RefreshCw,
  Loader2,
  Upload,
  Camera,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { MOCK_DETECTIONS, getIconForType } from './constants';
import { Priority, Detection, RescuePlan } from './types';
import { generateRescuePlan } from './services/geminiService';

const App: React.FC = () => {
  // --- STATE ---
  const [detections, setDetections] = useState<Detection[]>(MOCK_DETECTIONS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false); // New state for AI loading
  const [rescuePlan, setRescuePlan] = useState<RescuePlan | null>(null);
  const [preview, setPreview] = useState<string | null>(null); // To show the uploaded image
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HANDLERS ---

  // 1. Handle File Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreview(URL.createObjectURL(file));
      runAIAnalysis(file); // Trigger AI immediately on upload
    }
  };

  // 2. The "Bridge" to Python FastAPI
  const runAIAnalysis = async (file: File) => {
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Send to your Python backend
      const response = await axios.post("http://127.0.0.1:8000/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = response.data; // { prediction: "DAMAGED", confidence: "99%", ... }
      
      // Create a new Detection object based on AI result
      const newDetection: Detection = {
        id: Date.now().toString(),
        type: data.prediction === 'DAMAGED' ? 'Collapse' : 'Thermal', // Mapping types
        description: data.prediction === 'DAMAGED' ? 'CRITICAL STRUCTURAL FAILURE' : 'STRUCTURAL INTEGRITY INTACT',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        priority: data.prediction === 'DAMAGED' ? Priority.CRITICAL : Priority.LOW,
        confidence: parseFloat(data.confidence) / 100, // Convert "99%" to 0.99
        coordinates: { lat: 36.2023, lng: 36.1601 } // Mock coordinates for now
      };

      // Add to the top of the list
      setDetections(prev => [newDetection, ...prev]);

    } catch (error) {
      console.error("AI Connection Failed:", error);
      alert("⚠️ SYSTEM OFFLINE: Could not connect to Python Backend on Port 8000.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateRoute = async () => {
    setIsGenerating(true);
    const plan = await generateRescuePlan(detections); // Uses Gemini with new AI data
    setRescuePlan(plan);
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-50 selection:bg-cyan-500/30 font-mono">
      
      {/* --- HEADER --- */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-red-600 p-1.5 rounded-sm">
            <ShieldAlert className="text-white" size={20} />
          </div>
          <h1 className="text-lg font-bold tracking-tighter">
            PROJECT HAYAT <span className="text-slate-500 font-light">// INTEL PLATFORM</span>
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400">LIVE OPS: TURKEY-SYRIA BORDER</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <div className="flex items-center gap-1.5">
              <Wifi size={16} className="text-emerald-500" />
              <span className="text-[10px] uppercase tracking-widest">Network Stable</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        
        {/* --- LEFT SIDEBAR: INTELLIGENCE LOG --- */}
        <aside className="w-80 border-r border-slate-800 flex flex-col bg-slate-900/50">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase flex items-center gap-2">
              <Activity size={14} className="text-cyan-400" />
              Detection Feed
            </h2>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase">Active</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {detections.map((det) => (
              <div 
                key={det.id} 
                className={`group relative bg-slate-800/30 border p-3 rounded-sm transition-all overflow-hidden
                  ${det.id === detections[0].id ? 'animate-in slide-in-from-left duration-500 border-l-4 border-l-emerald-500' : 'border-slate-800 hover:border-slate-600'}
                `}
              >
                <div className={`absolute top-0 left-0 w-1 h-full ${
                  det.priority === Priority.CRITICAL ? 'bg-red-500' : 
                  det.priority === Priority.HIGH ? 'bg-orange-500' : 'bg-blue-500'
                }`} />
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`${
                      det.type === 'Voice' ? 'text-cyan-400' : 
                      det.type === 'Hazard' ? 'text-red-400' : 
                      det.type === 'Thermal' ? 'text-orange-400' : 
                      det.priority === Priority.CRITICAL ? 'text-red-500' : 'text-slate-400'
                    }`}>
                      {getIconForType(det.type)}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-tight">{det.description}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 tabular-nums">{det.time}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold border uppercase ${
                      det.priority === Priority.CRITICAL ? 'border-red-500/50 text-red-500' : 
                      det.priority === Priority.HIGH ? 'border-orange-500/50 text-orange-500' : 'border-slate-700 text-slate-500'
                    }`}>
                      {det.priority}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-sm font-bold border border-cyan-500/50 text-cyan-500 uppercase">
                      {(det.confidence * 100).toFixed(0)}% CONF
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* --- CENTER: TACTICAL MAP / UPLOAD ZONE --- */}
        <section className="flex-1 relative bg-[#020617] overflow-hidden group flex flex-col items-center justify-center">
          
          {/* Background Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />

          {/* MAIN VISUALIZER */}
          <div className="relative w-full h-full flex items-center justify-center p-10">
            {preview ? (
              // SHOW UPLOADED IMAGE
              <div className="relative w-full h-full max-w-4xl border-2 border-slate-700/50 rounded-lg overflow-hidden bg-black/50 backdrop-blur-sm">
                <img src={preview} alt="Drone Feed" className="w-full h-full object-contain" />
                
                {/* AI Scanning Overlay Effect */}
                {isAnalyzing && (
                   <div className="absolute inset-0 bg-emerald-500/10 z-10 animate-pulse flex items-center justify-center">
                      <div className="text-emerald-500 font-bold tracking-widest text-xl flex flex-col items-center">
                        <Loader2 size={48} className="animate-spin mb-4" />
                        PROCESSING SATELLITE FEED...
                      </div>
                      <div className="absolute inset-0 border-t-2 border-emerald-500/50 animate-[scan_2s_ease-in-out_infinite]" />
                   </div>
                )}

                {/* Tactical Overlays */}
                <div className="absolute top-4 left-4 text-cyan-500/50"><Crosshair /></div>
                <div className="absolute top-4 right-4 text-cyan-500/50"><Crosshair /></div>
                <div className="absolute bottom-4 left-4 text-cyan-500/50"><Crosshair /></div>
                <div className="absolute bottom-4 right-4 text-cyan-500/50"><Crosshair /></div>
              </div>
            ) : (
              // SHOW UPLOAD BUTTON
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group cursor-pointer w-96 h-64 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center bg-slate-900/50 hover:bg-slate-800/50 hover:border-cyan-500/50 transition-all"
              >
                <div className="p-4 rounded-full bg-slate-800 group-hover:bg-cyan-500/20 mb-4 transition-all">
                  <Upload className="text-slate-400 group-hover:text-cyan-400" size={32} />
                </div>
                <h3 className="text-slate-300 font-bold tracking-widest mb-2">UPLOAD DRONE FEED</h3>
                <p className="text-slate-600 text-xs uppercase">Click to Initialize Scan</p>
              </div>
            )}
          </div>
          
          {/* Hidden File Input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
            accept="image/*"
          />

          {/* HUD Footer Information */}
          <div className="absolute bottom-0 w-full p-6 flex justify-between items-end pointer-events-none">
             <div className="w-48 h-24 border border-slate-700/50 bg-slate-900/40 backdrop-blur-sm p-2">
                 <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Compass</div>
                 <div className="flex items-center justify-center h-12">
                   <div className="relative w-full h-px bg-slate-700">
                     <div className="absolute top-1/2 left-[284px/3.6%] -translate-y-1/2 w-4 h-4 border border-cyan-500 rotate-45" />
                     <div className="absolute left-1/2 -translate-x-1/2 text-[8px] -top-3 text-slate-500 uppercase font-bold text-cyan-500">N</div>
                   </div>
                 </div>
             </div>
             <div className="space-y-1 text-right">
                  <div className="text-xs font-bold text-slate-400 flex items-center gap-2 justify-end">
                    <Camera size={14} /> OPTICAL SENSOR ACTIVE
                  </div>
                  <div className="text-[10px] text-slate-600">RES: 4K | ISO: 800</div>
             </div>
          </div>
        </section>

        {/* --- RIGHT SIDEBAR: DRONE TELEMETRY --- */}
        <aside className="w-80 border-l border-slate-800 flex flex-col bg-slate-900/50">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase flex items-center gap-2">
              <Navigation2 size={14} className="text-emerald-400" />
              UAV Status
            </h2>
          </div>

          <div className="p-4 space-y-6 flex-1 overflow-y-auto">
            {/* Battery & Signal */}
            <div className="flex gap-4">
               <div className="flex-1 bg-slate-800/20 border border-slate-800 p-3 rounded-sm text-center">
                  <div className="text-[10px] text-slate-500 uppercase mb-2">Battery</div>
                  <div className="text-2xl font-bold text-emerald-400">74%</div>
               </div>
               <div className="flex-1 bg-slate-800/20 border border-slate-800 p-3 rounded-sm text-center">
                  <div className="text-[10px] text-slate-500 uppercase mb-2">Signal</div>
                  <div className="text-2xl font-bold text-cyan-400">92%</div>
               </div>
            </div>

            {/* Actionable Intel */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Zap size={14} className="text-yellow-400" />
                  Actionable Intel
                </h3>
                {rescuePlan && (
                  <button onClick={() => setRescuePlan(null)} className="text-[10px] text-slate-500 hover:text-slate-300">Clear</button>
                )}
              </div>

              {rescuePlan ? (
                <div className="bg-slate-800/40 border border-emerald-500/30 p-4 rounded-sm animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="text-xs font-bold text-emerald-400 mb-2 uppercase flex items-center gap-2">
                    <ShieldAlert size={14} /> AI Intel Report
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed mb-4 italic">
                    "{rescuePlan.summary}"
                  </p>
                  <div className="pt-2 border-t border-slate-700">
                      <div className="text-[10px] text-red-400 uppercase mb-1 font-bold">Tactical Warnings</div>
                      <ul className="text-[9px] text-red-500/70 list-disc list-inside space-y-0.5">
                        {rescuePlan.warnings.map((warning, idx) => (
                          <li key={idx}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                </div>
              ) : (
                <div className="bg-slate-800/10 border border-slate-800 border-dashed p-8 rounded-sm text-center flex flex-col items-center justify-center opacity-60">
                  <Cpu size={24} className="text-slate-700 mb-2" />
                  <p className="text-[10px] text-slate-600 uppercase tracking-wider">
                    Awaiting Rescue Analysis
                  </p>
                </div>
              )}
            </div>

            {/* Primary CTA */}
            <div className="pt-4">
              <button 
                onClick={handleGenerateRoute}
                disabled={isGenerating || detections.length === 0}
                className={`w-full py-4 rounded-sm flex items-center justify-center gap-3 transition-all ${
                  isGenerating 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-[0.2em]">Processing...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={18} />
                    <span className="text-xs font-bold uppercase tracking-[0.2em]">Generate Rescue Route</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* --- FOOTER --- */}
      <footer className="h-8 border-t border-slate-800 bg-slate-900/90 flex items-center px-4 justify-between">
        <div className="flex items-center gap-6">
           <span className="text-[10px] text-slate-500 uppercase flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Link 1: Active</span>
        </div>
        <div className="text-[10px] text-slate-600 uppercase italic font-bold">Humanity. Technology. Resilience.</div>
      </footer>
    </div>
  );
};

export default App;