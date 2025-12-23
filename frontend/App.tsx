import React, { useState, useRef } from 'react';
import axios from 'axios';
import { 
  ShieldAlert, 
  Wifi, 
  Crosshair, 
  Zap, 
  Activity, 
  Navigation2,
  Cpu,
  RefreshCw,
  Loader2,
  Upload,
  Mic
} from 'lucide-react';
import { MOCK_DETECTIONS, getIconForType } from './constants';
import { Priority, Detection, RescuePlan } from './types';
import { generateRescuePlan } from './services/geminiService';
import { MapBackground } from './MapBackground';

const App: React.FC = () => {
  // --- STATE ---
  const [detections, setDetections] = useState<Detection[]>(MOCK_DETECTIONS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [rescuePlan, setRescuePlan] = useState<RescuePlan | null>(null);
  
  // Media Preview States
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'audio' | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HANDLERS ---

  // 1. Handle File Selection (Smart Detection)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Determine type
      if (file.type.startsWith('image/')) {
        setMediaType('image');
        setPreview(URL.createObjectURL(file));
      } else if (file.type.startsWith('audio/')) {
        setMediaType('audio');
        setPreview(null); // No visual preview for audio
      }

      runAIAnalysis(file);
    }
  };

  // 2. The Bridge (Router to Python Backend)
  const runAIAnalysis = async (file: File) => {
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      let endpoint = "";
      if (file.type.startsWith('image/')) endpoint = "http://127.0.0.1:8000/analyze/image";
      else if (file.type.startsWith('audio/')) endpoint = "http://127.0.0.1:8000/analyze/audio";
      else throw new Error("Unsupported file type");

      // HIT THE BACKEND
      const response = await axios.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = response.data; 
      
      // Jitter coordinates slightly so markers don't overlap perfectly
      const jitterLat = (Math.random() - 0.5) * 0.005;
      const jitterLng = (Math.random() - 0.5) * 0.005;

      // LOGIC: Create specific detection cards based on result
      let newDetection: Detection | null = null;

      if (data.type === 'VISION') {
        newDetection = {
          id: Date.now().toString(),
          type: data.prediction === 'DAMAGED' ? 'Collapse' : 'Thermal',
          description: data.prediction === 'DAMAGED' ? 'CRITICAL STRUCTURAL FAILURE' : 'STRUCTURAL INTEGRITY INTACT',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          priority: data.prediction === 'DAMAGED' ? Priority.CRITICAL : Priority.LOW,
          confidence: parseFloat(data.confidence) / 100,
          coordinates: { lat: 36.2023 + jitterLat, lng: 36.1601 + jitterLng }
        };
      } else if (data.type === 'AUDIO') {
        newDetection = {
          id: Date.now().toString(),
          type: 'Voice',
          description: data.prediction === 'SCREAM' ? 'HUMAN DISTRESS SIGNAL DETECTED' : 'BACKGROUND NOISE FILTERED',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          priority: data.prediction === 'SCREAM' ? Priority.HIGH : Priority.LOW,
          confidence: parseFloat(data.confidence) / 100,
          coordinates: { lat: 36.2025 + jitterLat, lng: 36.1605 + jitterLng }
        };
      }

      if (newDetection) {
        setDetections(prev => [newDetection!, ...prev]);
      }

    } catch (error) {
      console.error("AI Connection Failed:", error);
      alert("⚠️ SYSTEM ERROR: Ensure Backend is running and file format is correct.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateRoute = async () => {
    setIsGenerating(true);
    const plan = await generateRescuePlan(detections);
    setRescuePlan(plan);
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-50 selection:bg-cyan-500/30 font-mono">
      
      {/* HEADER */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-red-600 p-1.5 rounded-sm">
            <ShieldAlert className="text-white" size={20} />
          </div>
          <h1 className="text-lg font-bold tracking-tighter">
            PROJECT HAYAT <span className="text-slate-500 font-light">// MULTIMODAL INTEL</span>
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400">LIVE OPS: TURKEY-SYRIA</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        
        {/* LEFT SIDEBAR - DETECTION FEED */}
        <aside className="w-80 border-r border-slate-800 flex flex-col bg-slate-900/80 backdrop-blur-sm z-20">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase flex items-center gap-2">
              <Activity size={14} className="text-cyan-400" />
              Sensor Feed
            </h2>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase">Active</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {detections.map((det) => (
              <div 
                key={det.id} 
                className={`group relative bg-slate-800/80 border p-3 rounded-sm transition-all overflow-hidden
                  ${det.id === detections[0].id ? 'animate-in slide-in-from-left duration-500 border-l-4 border-l-emerald-500' : 'border-slate-800 hover:border-slate-600'}
                `}
              >
                <div className={`absolute top-0 left-0 w-1 h-full ${
                  det.priority === Priority.CRITICAL ? 'bg-red-500' : 
                  det.priority === Priority.HIGH ? 'bg-cyan-500' : 'bg-slate-500'
                }`} />
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`${
                      det.type === 'Voice' ? 'text-cyan-400' : 
                      det.priority === Priority.CRITICAL ? 'text-red-500' : 'text-slate-400'
                    }`}>
                      {getIconForType(det.type)}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-tight leading-tight">{det.description}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 tabular-nums">{det.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold border uppercase ${
                      det.priority === Priority.CRITICAL ? 'border-red-500/50 text-red-500' : 
                      det.priority === Priority.HIGH ? 'border-cyan-500/50 text-cyan-500' : 'border-slate-700 text-slate-500'
                    }`}>
                      {det.priority}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-sm font-bold border border-slate-700 text-slate-400 uppercase">
                      {(det.confidence * 100).toFixed(0)}% CONF
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* --- CENTER SECTION: MAP & VISUALIZER --- */}
        <section className="flex-1 relative overflow-hidden flex flex-col items-center justify-center">
          
          {/* 1. THE MAP (Background Layer) */}
          <MapBackground detections={detections} />

          {/* 2. GRID OVERLAY (Low opacity for texture) */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-10 pointer-events-none z-0" />

          {/* 3. MAIN INTERFACE (Floating above map) */}
          <div className="relative w-full h-full flex items-center justify-center p-10 z-10 pointer-events-none">
            
            {/* VISUAL MODE - Floating Image */}
            {mediaType === 'image' && preview && (
              <div className="pointer-events-auto relative w-full h-full max-w-4xl border-2 border-slate-700/50 rounded-lg overflow-hidden bg-black/80 backdrop-blur-sm shadow-2xl">
                <img src={preview} alt="Drone Feed" className="w-full h-full object-contain" />
                <div className="absolute top-4 left-4 text-cyan-500/50"><Crosshair /></div>
                <div className="absolute top-4 right-4 text-cyan-500/50"><Crosshair /></div>
                <div className="absolute bottom-4 left-4 text-cyan-500/50"><Crosshair /></div>
                <div className="absolute bottom-4 right-4 text-cyan-500/50"><Crosshair /></div>
                
                {/* Close Button */}
                <button onClick={() => setMediaType(null)} className="absolute top-2 right-2 text-slate-400 hover:text-white bg-slate-900/50 p-1 rounded">X</button>
              </div>
            )}

            {/* AUDIO MODE - Floating Visualizer */}
            {mediaType === 'audio' && (
              <div className="pointer-events-auto relative w-full h-full max-w-2xl border-2 border-cyan-500/30 rounded-lg overflow-hidden bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-10 shadow-[0_0_50px_rgba(6,182,212,0.15)]">
                <div className="w-32 h-32 rounded-full bg-cyan-500/10 flex items-center justify-center mb-6 animate-pulse">
                   <Mic size={48} className="text-cyan-400" />
                </div>
                <h2 className="text-xl font-bold text-cyan-400 tracking-widest mb-2">AUDIO SPECTRUM ANALYSIS</h2>
                <p className="text-xs text-slate-500 uppercase tracking-widest">Processing Frequency Bands...</p>
                
                <div className="mt-8 flex items-end gap-1 h-16">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="w-2 bg-cyan-500/50 animate-[bounce_1s_infinite]" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.05}s` }} />
                  ))}
                </div>

                {/* Close Button */}
                <button onClick={() => setMediaType(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">CLOSE</button>
              </div>
            )}

            {/* DEFAULT STATE: Floating Upload Button */}
            {!mediaType && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="pointer-events-auto group cursor-pointer w-96 h-64 border-2 border-dashed border-slate-600/50 rounded-lg flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-md hover:bg-slate-800/90 hover:border-cyan-500/50 transition-all shadow-2xl hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]"
              >
                <div className="p-4 rounded-full bg-slate-800 group-hover:bg-cyan-500/20 mb-4 transition-all">
                  <Upload className="text-slate-400 group-hover:text-cyan-400" size={32} />
                </div>
                <h3 className="text-slate-300 font-bold tracking-widest mb-2">UPLOAD SENSOR DATA</h3>
                <p className="text-slate-500 text-xs uppercase text-center">
                  Map Overlay Active <br/> Awaiting Input
                </p>
              </div>
            )}

            {/* AI LOADING OVERLAY */}
            {isAnalyzing && (
                <div className="absolute inset-0 bg-slate-950/80 z-50 flex items-center justify-center backdrop-blur-sm pointer-events-auto">
                  <div className="text-emerald-500 font-bold tracking-widest text-xl flex flex-col items-center">
                    <Loader2 size={48} className="animate-spin mb-4" />
                    ANALYZING SENSOR STREAM...
                  </div>
                </div>
            )}
          </div>
          
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,audio/*"/>

          {/* HUD FOOTER */}
          <div className="absolute bottom-0 w-full p-6 flex justify-between items-end pointer-events-none z-20">
             <div className="text-xs font-bold text-slate-300 bg-slate-900/80 backdrop-blur px-3 py-1 rounded border border-slate-700">SYSTEM READY</div>
             <div className="text-right text-xs text-slate-400 bg-slate-900/80 backdrop-blur px-3 py-1 rounded border border-slate-700">LAT: 36.2023 | LNG: 36.1601</div>
          </div>
        </section>

        {/* RIGHT SIDEBAR - TELEMETRY */}
        <aside className="w-80 border-l border-slate-800 flex flex-col bg-slate-900/80 backdrop-blur-sm z-20">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase flex items-center gap-2">
              <Navigation2 size={14} className="text-emerald-400" />
              UAV Status
            </h2>
          </div>

          <div className="p-4 space-y-6 flex-1 overflow-y-auto">
            <div className="flex gap-4">
               <div className="flex-1 bg-slate-800/50 border border-slate-800 p-3 rounded-sm text-center">
                  <div className="text-[10px] text-slate-500 uppercase mb-2">Battery</div>
                  <div className="text-2xl font-bold text-emerald-400">74%</div>
               </div>
               <div className="flex-1 bg-slate-800/50 border border-slate-800 p-3 rounded-sm text-center">
                  <div className="text-[10px] text-slate-500 uppercase mb-2">Signal</div>
                  <div className="text-2xl font-bold text-cyan-400">92%</div>
               </div>
            </div>

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
                <div className="bg-slate-800/60 border border-emerald-500/30 p-4 rounded-sm animate-in fade-in slide-in-from-right-4 duration-500">
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
                <div className="bg-slate-800/20 border border-slate-800 border-dashed p-8 rounded-sm text-center flex flex-col items-center justify-center opacity-60">
                  <Cpu size={24} className="text-slate-700 mb-2" />
                  <p className="text-[10px] text-slate-600 uppercase tracking-wider">
                    Awaiting Sensor Input
                  </p>
                </div>
              )}
            </div>

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
    </div>
  );
};

export default App;