import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, Zap, AlertTriangle, Video, Sliders, Aperture, TrendingUp, Download, Trash2, Image as ImageIcon } from 'lucide-react';
import { detectObjects } from '../services/geminiService';
import { BoundingBox } from '../types';
import { LineChart, Line, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

interface Snapshot {
  id: string;
  url: string;
  timestamp: string;
  detections: number;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const InferenceView: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detections, setDetections] = useState<BoundingBox[]>([]);
  const [fps, setFps] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // New Features State
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
  const [dynamicColoring, setDynamicColoring] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [perfHistory, setPerfHistory] = useState<{ time: number, fps: number }[]>([]);

  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Initialize Camera
  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "environment"
        }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsActive(true);
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsActive(false);
      setDetections([]);
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      // Draw detections on snapshot
      if (dynamicColoring) {
        detections.forEach((box, i) => {
          if ((box.confidence || 0) < confidenceThreshold) return;
          const color = dynamicColoring ? COLORS[Math.abs(box.label.charCodeAt(0)) % COLORS.length] : '#00ff00';
          const x = (box.xmin / 1000) * canvas.width;
          const y = (box.ymin / 1000) * canvas.height;
          const w = ((box.xmax - box.xmin) / 1000) * canvas.width;
          const h = ((box.ymax - box.ymin) / 1000) * canvas.height;
          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, w, h);
        });
      }

      const url = canvas.toDataURL('image/jpeg');
      const newSnap: Snapshot = {
        id: Date.now().toString(),
        url,
        timestamp: new Date().toLocaleTimeString(),
        detections: detections.filter(d => (d.confidence || 0) >= confidenceThreshold).length
      };
      setSnapshots(prev => [newSnap, ...prev]);
    }
  };

  const captureAndDetect = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing || !isActive) return;

    const now = Date.now();
    if (now - lastTimeRef.current < 800) {
      requestRef.current = requestAnimationFrame(captureAndDetect);
      return;
    }

    setIsProcessing(true);

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', 0.6);

      const boxes = await detectObjects(base64);

      setDetections(boxes);

      // FPS calculation
      const delta = Date.now() - now;
      const currentFps = Math.round(1000 / delta * 10) / 10;
      setFps(currentFps);
      setPerfHistory(prev => [...prev.slice(-19), { time: now, fps: currentFps }]);

      lastTimeRef.current = Date.now();

    } catch (err) {
      console.error("Inference Error:", err);
    } finally {
      setIsProcessing(false);
      requestRef.current = requestAnimationFrame(captureAndDetect);
    }
  }, [isProcessing, isActive]);

  useEffect(() => {
    if (isActive && !isProcessing) {
      requestRef.current = requestAnimationFrame(captureAndDetect);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isActive, captureAndDetect]);

  // Drawing Loop
  useEffect(() => {
    const renderLoop = () => {
      if (!videoRef.current || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      if (canvasRef.current.width !== videoRef.current.videoWidth || canvasRef.current.height !== videoRef.current.videoHeight) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
      }

      detections.forEach((box) => {
        if (box.confidence && box.confidence < confidenceThreshold) return;

        const color = dynamicColoring ? COLORS[Math.abs(box.label.charCodeAt(0)) % COLORS.length] : '#00ff00';

        const x = (box.xmin / 1000) * canvasRef.current!.width;
        const y = (box.ymin / 1000) * canvasRef.current!.height;
        const w = ((box.xmax - box.xmin) / 1000) * canvasRef.current!.width;
        const h = ((box.ymax - box.ymin) / 1000) * canvasRef.current!.height;

        // Box
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);

        // Label
        if (showLabels) {
          ctx.font = 'bold 14px Inter, sans-serif';
          const text = `${box.label} ${box.confidence ? Math.round(box.confidence * 100) + '%' : ''}`;
          const textWidth = ctx.measureText(text).width;
          const textHeight = 25;

          // Ensure label is visible (draw inside box if too close to top)
          let labelY = y - textHeight;
          let textY = y - 7;

          if (labelY < 0) {
            labelY = y;
            textY = y + 18;
          }

          ctx.fillStyle = color;
          ctx.fillRect(x, labelY, textWidth + 10, textHeight);

          ctx.fillStyle = '#ffffff';
          ctx.fillText(text, x + 5, textY);
        }
      });

      requestAnimationFrame(renderLoop);
    };

    if (isActive) {
      renderLoop();
    }
  }, [isActive, detections, confidenceThreshold, dynamicColoring, showLabels]);


  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Zap className="w-8 h-8 text-yellow-500 fill-yellow-500" />
            Real-Time Inference
          </h2>
          <p className="text-slate-400">Deploy your trained model for live object detection via Webcam.</p>
        </div>
        <div className="flex gap-4">
          {isActive && (
            <button onClick={captureSnapshot} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-lg font-bold border border-slate-700 transition-all">
              <Aperture className="w-5 h-5" /> Snapshot
            </button>
          )}
          {!isActive ? (
            <button onClick={startCamera} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold text-lg transition-all shadow-lg shadow-blue-900/50">
              <Camera className="w-6 h-6" /> Start Camera
            </button>
          ) : (
            <button onClick={stopCamera} className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-bold text-lg transition-all shadow-lg shadow-red-900/50">
              <Video className="w-6 h-6" /> Stop Camera
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">

        {/* Main Viewport */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-black rounded-2xl overflow-hidden relative border border-slate-700 shadow-2xl flex-1">
            {!isActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                <Camera className="w-16 h-16 mb-4 opacity-50" />
                <p>Camera feed inactive</p>
              </div>
            )}

            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-contain"
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />

            {/* HUD Overlay */}
            {isActive && (
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <div className="bg-black/60 backdrop-blur-md text-blue-400 px-3 py-1 rounded-md border border-blue-500/30 text-sm font-mono">
                  Model: Gemini 2.5 Flash
                </div>
                {isProcessing && (
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md text-yellow-400 px-3 py-1 rounded-md border border-yellow-500/30 text-xs font-mono">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    Processing...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Performance Graph */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 h-40">
            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Live Performance (FPS)
            </h4>
            <div className="h-full w-full">
              <ResponsiveContainer width="100%" height="80%">
                <LineChart data={perfHistory}>
                  <YAxis domain={[0, 10]} hide />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    labelFormatter={() => ''}
                  />
                  <Line type="monotone" dataKey="fps" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Controls & Gallery */}
        <div className="space-y-6 overflow-y-auto pr-2 flex flex-col h-full">

          {/* Settings */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shrink-0">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Sliders className="w-5 h-5" /> Inference Settings
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Confidence: {Math.round(confidenceThreshold * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between text-sm text-slate-400 cursor-pointer hover:text-white transition-colors">
                  <span>Dynamic Coloring</span>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${dynamicColoring ? 'bg-blue-600' : 'bg-slate-600'}`} onClick={() => setDynamicColoring(!dynamicColoring)}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${dynamicColoring ? 'left-6' : 'left-1'}`}></div>
                  </div>
                </label>
                <label className="flex items-center justify-between text-sm text-slate-400 cursor-pointer hover:text-white transition-colors">
                  <span>Show Labels</span>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${showLabels ? 'bg-blue-600' : 'bg-slate-600'}`} onClick={() => setShowLabels(!showLabels)}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${showLabels ? 'left-6' : 'left-1'}`}></div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Snapshot Gallery */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 flex-1 overflow-hidden flex flex-col">
            <h3 className="text-white font-semibold mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2"><ImageIcon className="w-5 h-5" /> Snapshots ({snapshots.length})</span>
              {snapshots.length > 0 && (
                <button onClick={() => setSnapshots([])} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )}
            </h3>

            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
              {snapshots.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm border-2 border-dashed border-slate-700 rounded-lg">
                  No snapshots yet.<br />Click "Snapshot" to capture.
                </div>
              ) : (
                snapshots.map((snap) => (
                  <div key={snap.id} className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700 group">
                    <div className="relative aspect-video">
                      <img src={snap.url} className="w-full h-full object-cover" alt="Snapshot" />
                      <a href={snap.url} download={`snapshot-${snap.id}.jpg`} className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black">
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                    <div className="p-3 text-xs flex justify-between text-slate-400">
                      <span>{snap.timestamp}</span>
                      <span className="text-blue-400 font-medium">{snap.detections} Objects</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InferenceView;