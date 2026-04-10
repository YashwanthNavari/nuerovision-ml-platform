import React from 'react';
import { LayoutDashboard, Database, BrainCircuit, BarChart3, Camera, Settings, Cpu } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const menuItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppView.DATASET, label: 'Dataset', icon: Database },
    { id: AppView.TRAINING, label: 'Training', icon: BrainCircuit },
    { id: AppView.EVALUATION, label: 'Evaluation', icon: BarChart3 },
    { id: AppView.INFERENCE, label: 'Live Inference', icon: Camera },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">NeuroVision</h1>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-800 space-y-6">
        {/* Simulated GPU Monitor */}
        <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 space-y-3 shadow-inner">
            <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-medium text-slate-300">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                    Tesla T4
                </span>
                <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">16GB</span>
            </div>
            
            <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                    <span>VRAM Usage</span>
                    <span className="text-blue-400">5.2GB / 16GB</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 w-[32%] rounded-full"></div>
                </div>
            </div>

            <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                    <span>Volatile Util</span>
                    <span className="text-purple-400">12%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 w-[12%] rounded-full"></div>
                </div>
            </div>
        </div>

        <div className="flex items-center gap-3 text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Settings</span>
        </div>
        <div className="text-[10px] text-slate-700 font-mono text-center">
          Build v2.4.0 • Gemini 2.5
        </div>
      </div>
    </div>
  );
};

export default Sidebar;