import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, Cpu, Activity, Clock, Download, Check, Terminal, Eye, Zap, Layers, Database } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ModelType, TrainingMetrics } from '../types';

const TrainingView: React.FC = () => {
  const [isTraining, setIsTraining] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExported, setIsExported] = useState(false);
  const [progress, setProgress] = useState(0);
  const [epoch, setEpoch] = useState(0);
  const [data, setData] = useState<TrainingMetrics[]>([]);

  // Visuals State
  const [currentImage, setCurrentImage] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Config State
  const [modelType, setModelType] = useState<ModelType>(ModelType.YOLO_V8);
  const [batchSize, setBatchSize] = useState(32);
  const [epochs, setEpochs] = useState(100);
  const [learningRate, setLearningRate] = useState(0.001);
  const [datasetSize, setDatasetSize] = useState(50000); // Default 50k

  // Scroll logs to bottom
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Initial Image
  useEffect(() => {
    setCurrentImage(`https://picsum.photos/seed/init/600/400`);
  }, []);

  useEffect(() => {
    let interval: any;
    if (isTraining && epoch < epochs) {
      interval = setInterval(() => {
        setEpoch(prev => {
          const newEpoch = prev + 1;
          const newProgress = (newEpoch / epochs) * 100;
          setProgress(newProgress);

          // Realistic Loss Curve
          const baseLoss = 2.5 * Math.exp(-0.05 * newEpoch) + 0.3;
          const noise = (Math.random() - 0.5) * 0.15;
          const loss = Math.max(0.05, baseLoss + noise);

          // Realistic mAP Curve
          const baseMap = 0.98 * (1 - Math.exp(-0.06 * newEpoch));
          const mapNoise = (Math.random() - 0.5) * 0.03;
          let map = Math.min(0.995, Math.max(0, baseMap + mapNoise));
          if (newEpoch < 5) map = Math.random() * 0.1;

          const accuracy = map * 0.92;

          setData(curr => [...curr, {
            epoch: newEpoch,
            loss: parseFloat(loss.toFixed(4)),
            accuracy: parseFloat(accuracy.toFixed(4)),
            map: parseFloat(map.toFixed(4))
          }]);

          // Dynamic Image Seeding (Infinite Feed)
          // We effectively "Process" a huge chunk of data each step
          const seed = `epoch${newEpoch}_${Math.floor(Math.random() * 1000)}`;
          setCurrentImage(`https://picsum.photos/seed/${seed}/600/400`);

          // Scaled Log Logic
          const processedImages = Math.min(datasetSize, Math.floor(datasetSize * (newEpoch / epochs)));
          const currentBatch = Math.ceil(datasetSize / batchSize);
          const logTime = new Date().toLocaleTimeString();

          // Log summary of the epoch processing
          const newLog = `[${logTime}] Epoch ${newEpoch}/${epochs} | Processed ${datasetSize}/${datasetSize} imgs | Loss=${loss.toFixed(4)} mAP=${map.toFixed(4)}`;
          setLogs(prev => [...prev.slice(-20), newLog]);

          return newEpoch;
        });
      }, 800);
    } else if (epoch >= epochs) {
      setIsTraining(false);
    }
    return () => clearInterval(interval);
  }, [isTraining, epoch, epochs, datasetSize, batchSize]);

  const handleStartTraining = () => {
    if (epoch === epochs) {
      setEpoch(0);
      setProgress(0);
      setData([]);
      setLogs([]);
      setIsExported(false);
    }
    setIsTraining(!isTraining);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setIsExported(true);
    }, 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Zap className="w-6 h-6 text-amber-500" />
            Active Training Session
          </h2>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-slate-400 text-sm">Status:
              <span className={`ml-2 font-mono font-bold ${isTraining ? 'text-green-400 animate-pulse' : 'text-slate-500'}`}>
                {isTraining ? 'RUNNING' : epoch === epochs ? 'COMPLETED' : 'IDLE'}
              </span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 text-sm">Dataset: <span className="text-white font-mono">{(datasetSize / 1000).toFixed(1)}k Images</span></span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 text-sm">Device: <span className="text-white font-mono">NVIDIA RTX 4090 (24GB)</span></span>
          </div>
        </div>
        <div className="flex gap-3">
          {epoch > 0 && !isTraining && (
            <button
              onClick={handleExport}
              disabled={isExporting || isExported}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${isExported
                  ? 'bg-green-500/10 border-green-500/50 text-green-500'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600'
                }`}
            >
              {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : isExported ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              {isExporting ? 'Exporting...' : isExported ? 'Model Saved' : 'Export Weights'}
            </button>
          )}

          <button
            onClick={handleStartTraining}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold shadow-lg transition-all ${isTraining
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/20'
                : 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/20'
              }`}
          >
            {isTraining ? <><Pause className="w-4 h-4" /> Pause Training</> : <><Play className="w-4 h-4" /> {epoch > 0 ? 'Resume Training' : 'Start Training'}</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Left Column: Visuals & Config (Merged for taller layout) */}
        <div className="lg:col-span-1 space-y-6">

          {/* Live Feed */}
          <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-xl relative group">
            <div className="absolute top-0 left-0 w-full bg-slate-900/80 backdrop-blur-sm p-3 border-b border-slate-800 flex justify-between items-center z-10">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-400" /> LIVE FEED
              </span>
              <span className="text-[10px] font-mono text-slate-400">BATCH: {isTraining ? Math.floor(Math.random() * (datasetSize / batchSize)) : '---'}</span>
            </div>

            <div className="relative aspect-square bg-black">
              <img
                src={currentImage}
                className={`w-full h-full object-cover transition-opacity duration-300 ${isTraining ? 'opacity-90' : 'opacity-40 grayscale'}`}
                alt="Training Data"
              />

              {/* Scanning Overlay Effect */}
              {isTraining && (
                <>
                  <div className="absolute inset-0 bg-scanline pointer-events-none opacity-20"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-scan"></div>

                  {/* Animated Bounding Boxes Simulation */}
                  <div className="absolute top-[20%] left-[30%] w-[40%] h-[50%] border-2 border-green-500/80 animate-pulse rounded-sm"></div>
                  <div className="absolute top-[20%] left-[30%] bg-green-500 text-black text-[9px] font-bold px-1">p: 0.98</div>
                </>
              )}

              {!isTraining && epoch === 0 && (
                <div className="absolute inset-0 flex items-center justify-center flex-col gap-2 text-slate-500">
                  <Layers className="w-12 h-12 opacity-50" />
                  <span className="text-sm font-medium">Waiting to start...</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-800 border-t border-slate-700 flex justify-between text-xs font-mono">
              <span className="text-slate-400">Dim: 640x640</span>
              <span className="text-amber-400">Aug: Mosaic+MixUp</span>
            </div>
          </div>

          {/* Hyperparameters Panel */}
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <SettingsIcon className="w-4 h-4 text-blue-500" /> Configuration
            </h3>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Dataset Size</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={datasetSize}
                  onChange={(e) => setDatasetSize(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 rounded p-1.5 text-white text-sm w-full outline-none focus:border-blue-500"
                />
                <span className="text-xs text-slate-500">imgs</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Architecture</label>
              <select
                value={modelType}
                onChange={(e) => setModelType(e.target.value as ModelType)}
                className="bg-slate-900 border border-slate-700 rounded p-1.5 text-white text-sm w-full outline-none focus:border-blue-500"
              >
                {Object.values(ModelType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Epochs</label>
                <input
                  type="number"
                  value={epochs}
                  onChange={(e) => setEpochs(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 rounded p-1.5 text-white text-sm w-full outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Batch Size</label>
                <select
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 rounded p-1.5 text-white text-sm w-full outline-none focus:border-blue-500"
                >
                  <option value={16}>16</option>
                  <option value={32}>32</option>
                  <option value={64}>64</option>
                  <option value={128}>128</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Graphs & Stats */}
        <div className="lg:col-span-3 space-y-6">

          {/* Real-time Metrics Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 relative overflow-hidden">
              <div className="absolute right-0 top-0 p-3 opacity-10">
                <Activity className="w-16 h-16 text-blue-500" />
              </div>
              <p className="text-sm text-slate-400 font-medium relative z-10">Training Loss</p>
              <p className="text-3xl font-bold text-white mt-1 relative z-10">{data.length > 0 ? data[data.length - 1].loss.toFixed(4) : '0.0000'}</p>
              <div className="h-1 w-full bg-slate-700 mt-3 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${Math.max(0, 100 - (data.length > 0 ? data[data.length - 1].loss * 20 : 0))}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 relative overflow-hidden">
              <div className="absolute right-0 top-0 p-3 opacity-10">
                <Check className="w-16 h-16 text-green-500" />
              </div>
              <p className="text-sm text-slate-400 font-medium relative z-10">mAP @0.5</p>
              <p className="text-3xl font-bold text-white mt-1 relative z-10">{data.length > 0 ? data[data.length - 1].map.toFixed(4) : '0.0000'}</p>
              <div className="h-1 w-full bg-slate-700 mt-3 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${data.length > 0 ? data[data.length - 1].map * 100 : 0}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 relative overflow-hidden">
              <div className="absolute right-0 top-0 p-3 opacity-10">
                <Clock className="w-16 h-16 text-purple-500" />
              </div>
              <p className="text-sm text-slate-400 font-medium relative z-10">Epoch</p>
              <p className="text-3xl font-bold text-white mt-1 relative z-10">{epoch}<span className="text-sm text-slate-500 font-normal ml-1">/ {epochs}</span></p>
              <div className="h-1 w-full bg-slate-700 mt-3 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>

          {/* Main Charts */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Training Metrics (Real-time)
              </h3>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  <span className="text-slate-300">Loss</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="text-slate-300">mAP</span>
                </div>
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMap" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="epoch" stroke="#64748b" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 12 }} domain={[0, 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="loss"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorLoss)"
                    name="Loss"
                  />
                  <Area
                    type="monotone"
                    dataKey="map"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorMap)"
                    name="mAP"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Terminal Logs */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-hidden flex flex-col h-[200px]">
            <div className="flex items-center gap-2 text-slate-400 mb-3 border-b border-slate-800 pb-2">
              <Terminal className="w-4 h-4" />
              <span>Training Log (Verbose)</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {logs.length === 0 && <span className="text-slate-600 italic">Logs will appear here...</span>}
              {logs.map((log, i) => (
                <div key={i} className="text-slate-300 border-l-2 border-slate-800 pl-2 hover:bg-slate-900/50 transition-colors">
                  {log}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>

        </div>
      </div>

      {/* CSS Animation for Scanline */}
      <style>{`
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            5% { opacity: 1; }
            95% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
            animation: scan 2s linear infinite;
        }
        .bg-scanline {
            background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.5) 51%);
            background-size: 100% 4px;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #1e293b; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #475569; 
            border-radius: 2px;
        }
      `}</style>
    </div>
  );
};

const SettingsIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
);

export default TrainingView;