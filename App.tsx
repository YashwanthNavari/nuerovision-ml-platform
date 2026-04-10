import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import DatasetView from './components/DatasetView';
import TrainingView from './components/TrainingView';
import EvaluationView from './components/EvaluationView';
import InferenceView from './components/InferenceView';
import { AppView } from './types';
import { Brain, ExternalLink } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);

  const renderContent = () => {
    switch (currentView) {
      case AppView.DATASET:
        return <DatasetView />;
      case AppView.TRAINING:
        return <TrainingView />;
      case AppView.EVALUATION:
        return <EvaluationView />;
      case AppView.INFERENCE:
        return <InferenceView />;
      case AppView.DASHBOARD:
      default:
        return <DashboardHome onChangeView={setCurrentView} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 font-sans">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      <main className="ml-64 w-full min-h-screen">
        {renderContent()}
      </main>
    </div>
  );
};

const DashboardHome: React.FC<{ onChangeView: (view: AppView) => void }> = ({ onChangeView }) => (
  <div className="p-12 max-w-6xl mx-auto">
    <header className="mb-12">
      <h1 className="text-4xl font-extrabold text-white tracking-tight mb-4">
        ML-Centric Real-Time Object Detection
      </h1>
      <p className="text-xl text-slate-400 max-w-3xl leading-relaxed">
        An end-to-end deep learning platform demonstrating the full lifecycle of a machine learning project: 
        Dataset Creation, Model Training, Evaluation, and Real-Time Deployment using YOLO-like architectures and Gemini inference.
      </p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <DashboardCard 
        title="1. Dataset" 
        desc="Annotate & Augment" 
        icon="Data" 
        color="blue" 
        onClick={() => onChangeView(AppView.DATASET)}
      />
      <DashboardCard 
        title="2. Training" 
        desc="Fine-tune Model" 
        icon="Train" 
        color="purple" 
        onClick={() => onChangeView(AppView.TRAINING)}
      />
      <DashboardCard 
        title="3. Evaluation" 
        desc="Analyze Metrics" 
        icon="Chart" 
        color="green" 
        onClick={() => onChangeView(AppView.EVALUATION)}
      />
      <DashboardCard 
        title="4. Deployment" 
        desc="Real-time Inference" 
        icon="Camera" 
        color="amber" 
        onClick={() => onChangeView(AppView.INFERENCE)}
      />
    </div>

    <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <Brain className="w-8 h-8 text-blue-500" />
        Technical Architecture
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <ArchitectureStep number="01" title="Data Ingestion" desc="Raw images are collected and annotated using bounding boxes (XML/JSON)." />
          <ArchitectureStep number="02" title="Preprocessing" desc="Data augmentation (Flip, Blur, Rotate) and normalization to improve robustness." />
          <ArchitectureStep number="03" title="Backbone Network" desc="Feature extraction using CNN layers (ResNet/CSPDarknet)." />
          <ArchitectureStep number="04" title="Detection Head" desc="Bounding box regression and class probability prediction." />
        </div>
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-700 flex items-center justify-center relative overflow-hidden">
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/0 to-slate-900/0"></div>
           <div className="text-center space-y-4 relative z-10">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-blue-500/20 animate-pulse">
                 <Brain className="w-12 h-12 text-white" />
              </div>
              <div>
                 <h3 className="text-xl font-bold text-white">YOLO Architecture</h3>
                 <p className="text-slate-400 text-sm mt-1">Single-stage object detector</p>
              </div>
              <div className="flex gap-2 justify-center mt-4">
                 <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-mono border border-slate-700">Conv2D</span>
                 <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-mono border border-slate-700">BatchNormalization</span>
                 <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-mono border border-slate-700">LeakyReLU</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  </div>
);

const DashboardCard = ({ title, desc, icon, color, onClick }: any) => {
  const colors: any = {
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-500 hover:border-blue-500",
    purple: "bg-purple-500/10 border-purple-500/20 text-purple-500 hover:border-purple-500",
    green: "bg-green-500/10 border-green-500/20 text-green-500 hover:border-green-500",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-500 hover:border-amber-500",
  };

  return (
    <button 
      onClick={onClick}
      className={`p-6 rounded-xl border text-left transition-all duration-300 hover:scale-105 ${colors[color]} group`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <ExternalLink className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <p className="text-slate-400 font-medium">{desc}</p>
    </button>
  );
};

const ArchitectureStep = ({ number, title, desc }: any) => (
  <div className="flex gap-4">
    <span className="text-2xl font-bold text-slate-700 font-mono">{number}</span>
    <div>
      <h4 className="text-lg font-semibold text-white">{title}</h4>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default App;
