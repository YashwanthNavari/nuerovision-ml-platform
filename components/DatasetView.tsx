import React, { useState, useRef } from 'react';
import { Plus, Tag, Trash2, CheckCircle2, AlertCircle, Wand2, Layers, ScanFace, Grip } from 'lucide-react';
import { DatasetImage } from '../types';

const INITIAL_IMAGES: DatasetImage[] = [
  { id: '1', url: 'https://picsum.photos/seed/car1/400/300', annotated: true, label: 'Car' },
  { id: '2', url: 'https://picsum.photos/seed/person1/400/300', annotated: true, label: 'Person' },
  { id: '3', url: 'https://picsum.photos/seed/dog1/400/300', annotated: false },
  { id: '4', url: 'https://picsum.photos/seed/cat1/400/300', annotated: false },
  { id: '5', url: 'https://picsum.photos/seed/bike1/400/300', annotated: true, label: 'Bicycle' },
  { id: '6', url: 'https://picsum.photos/seed/truck1/400/300', annotated: false },
  { id: '7', url: 'https://picsum.photos/seed/urban1/400/300', annotated: true, label: 'Building' },
  { id: '8', url: 'https://picsum.photos/seed/road1/400/300', annotated: false },
];

const DatasetView: React.FC = () => {
  const [images, setImages] = useState<DatasetImage[]>(INITIAL_IMAGES);
  const [selectedImage, setSelectedImage] = useState<DatasetImage | null>(null);
  const [augSettings, setAugSettings] = useState({
    flip: true,
    rotation: true,
    mosaic: false,
    mixup: false,
    grayscale: false,
    resize: true
  });

  const toggleAnnotation = (id: string) => {
    setImages(prev => prev.map(img =>
      img.id === id ? { ...img, annotated: !img.annotated, label: !img.annotated ? 'Custom Object' : undefined } : img
    ));
  };

  const toggleSetting = (key: keyof typeof augSettings) => {
    setAugSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImages: DatasetImage[] = Array.from(files).map((file: File, index) => ({
        id: `custom-${Date.now()}-${index}`,
        url: URL.createObjectURL(file),
        annotated: false,
        label: 'Unlabeled'
      }));
      setImages(prev => [...newImages, ...prev]);
    }
  };

  return (
    <div className="flex min-h-screen items-start">
      {/* Main Content Area */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Dataset Management</h2>
            <p className="text-slate-400">Manage annotations and configure your data pipeline.</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            multiple
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-lg shadow-blue-900/20"
          >
            <Plus className="w-5 h-5" />
            Add Images
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Dataset Size</h3>
                <p className="text-3xl font-bold text-white">{images.length}</p>
              </div>
              <div className="p-2 bg-slate-700 rounded-lg">
                <DatabaseIcon className="w-5 h-5 text-slate-300" />
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Annotated</h3>
                <p className="text-3xl font-bold text-green-400">
                  {images.filter(i => i.annotated).length}
                  <span className="text-sm text-slate-500 font-normal ml-2">/ {images.length}</span>
                </p>
              </div>
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Classes</h3>
                <p className="text-3xl font-bold text-blue-400">4</p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Tag className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
          {images.map((img) => (
            <div
              key={img.id}
              className={`group relative bg-slate-800 rounded-xl overflow-hidden border transition-all cursor-pointer ${selectedImage?.id === img.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-700 hover:border-slate-600'
                }`}
              onClick={() => setSelectedImage(img)}
            >
              <div className="relative aspect-video">
                <img src={img.url} alt="Dataset" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2">
                  {img.annotated ? (
                    <div className="bg-green-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-md shadow-sm">
                      <CheckCircle2 className="w-3 h-3" />
                      READY
                    </div>
                  ) : (
                    <div className="bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-md shadow-sm">
                      <AlertCircle className="w-3 h-3" />
                      NEW
                    </div>
                  )}
                </div>

                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleAnnotation(img.id); }}
                    className="bg-white text-slate-900 p-2 rounded-lg hover:bg-slate-200 transition-colors shadow-lg"
                  >
                    <Tag className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-3">
                <div className="flex justify-between items-center">
                  <p className="text-slate-300 font-medium text-sm truncate">img_data_{img.id}.jpg</p>
                  {img.label && (
                    <span className="text-[10px] uppercase font-bold bg-slate-700 text-blue-300 px-1.5 py-0.5 rounded border border-slate-600">
                      {img.label}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Annotation Editor (Bottom Panel if selected) */}
        {selectedImage && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 animate-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ScanFace className="w-5 h-5 text-blue-500" />
              Annotation Editor
            </h3>
            <div className="flex gap-8">
              <div className="relative w-2/3 bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
                <img src={selectedImage.url} className="w-full h-auto" alt="Editor" />
                {selectedImage.annotated && (
                  <div className="absolute top-[20%] left-[30%] w-[40%] h-[50%] border-2 border-green-500 bg-green-500/10">
                    <span className="absolute -top-6 left-0 bg-green-500 text-white text-xs px-2 py-0.5 rounded-t font-medium">
                      {selectedImage.label || 'Object'}
                    </span>
                  </div>
                )}
              </div>
              <div className="w-1/3 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Class Label</label>
                  <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                    <option>Person</option>
                    <option>Car</option>
                    <option>Bicycle</option>
                    <option>Dog</option>
                  </select>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Shortcuts</h4>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-xs text-slate-400 font-mono">W</span>
                    <span className="text-xs text-slate-500 py-1">Draw Box</span>
                  </div>
                </div>
                <button
                  className={`w-full py-2.5 rounded-lg font-bold transition-all ${selectedImage.annotated
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20'
                    }`}
                  onClick={() => toggleAnnotation(selectedImage.id)}
                >
                  {selectedImage.annotated ? 'Remove Annotation' : 'Save Annotation'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar: Pipeline Config */}
      <div className="w-80 border-l border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 h-screen overflow-y-auto p-6 flex flex-col gap-8 shrink-0">
        <div>
          <h3 className="text-white font-bold flex items-center gap-2 mb-1">
            <Wand2 className="w-4 h-4 text-blue-500" />
            Preprocessing
          </h3>
          <p className="text-slate-500 text-[11px] leading-tight mb-4">Base transformations applied to all images before training.</p>

          <div className="space-y-3">
            <AugmentationToggle label="Resize (640px)" checked={augSettings.resize} onChange={() => toggleSetting('resize')} />
            <AugmentationToggle label="Grayscale" checked={augSettings.grayscale} onChange={() => toggleSetting('grayscale')} />
            <AugmentationToggle label="Auto-Orient" checked={true} onChange={() => { }} disabled />
          </div>
        </div>

        <div className="w-full h-px bg-slate-800"></div>

        <div>
          <h3 className="text-white font-bold flex items-center gap-2 mb-1">
            <Layers className="w-4 h-4 text-purple-500" />
            Augmentation
          </h3>
          <p className="text-slate-500 text-[11px] leading-tight mb-4">Online augmentation strategy to improve model generalization.</p>

          <div className="space-y-3">
            <AugmentationToggle label="Horizontal Flip" checked={augSettings.flip} onChange={() => toggleSetting('flip')} />
            <AugmentationToggle label="Random Rotation" checked={augSettings.rotation} onChange={() => toggleSetting('rotation')} />
            <AugmentationToggle label="Mosaic (YOLOv4)" checked={augSettings.mosaic} onChange={() => toggleSetting('mosaic')} />
            <AugmentationToggle label="MixUp" checked={augSettings.mixup} onChange={() => toggleSetting('mixup')} />
          </div>

          <div className="mt-6 bg-blue-900/10 rounded-lg p-3 border border-blue-500/20">
            <div className="flex justify-between text-xs text-blue-400 mb-1">
              <span>Est. Effective Data</span>
              <span className="font-bold">3x</span>
            </div>
            <div className="text-[10px] text-slate-500 leading-tight">
              Active augmentations will dynamically triple your training variety per epoch.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AugmentationToggle = ({ label, checked, onChange, disabled }: any) => (
  <label className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer select-none ${checked
    ? 'bg-slate-800 border-blue-500/50 shadow-sm'
    : 'bg-slate-800/30 border-slate-800 hover:border-slate-700'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
    <span className={`text-sm font-medium ${checked ? 'text-slate-200' : 'text-slate-400'}`}>{label}</span>
    <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${checked ? 'bg-blue-600 border-blue-600' : 'border-slate-600'
      }`}>
      {checked && <CheckCircle2 className="w-3 h-3 text-white" />}
    </div>
    <input type="checkbox" className="hidden" checked={checked} onChange={onChange} disabled={disabled} />
  </label>
);

const DatabaseIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>
);

export default DatasetView;