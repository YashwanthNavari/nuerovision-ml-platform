import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';

const EvaluationView: React.FC = () => {
  const confusionMatrixData = [
    { name: 'Person', Person: 0.92, Car: 0.03, Bike: 0.04, Dog: 0.01 },
    { name: 'Car', Person: 0.02, Car: 0.95, Bike: 0.03, Dog: 0.00 },
    { name: 'Bike', Person: 0.05, Car: 0.04, Bike: 0.89, Dog: 0.02 },
    { name: 'Dog', Person: 0.01, Car: 0.01, Bike: 0.02, Dog: 0.96 },
  ];

  const classMetrics = [
    { name: 'Person', precision: 0.92, recall: 0.88, f1: 0.90 },
    { name: 'Car', precision: 0.95, recall: 0.94, f1: 0.945 },
    { name: 'Bike', precision: 0.89, recall: 0.85, f1: 0.87 },
    { name: 'Dog', precision: 0.96, recall: 0.97, f1: 0.965 },
  ];

  const radarData = [
    { subject: 'mAP@0.5', A: 94, fullMark: 100 },
    { subject: 'mAP@0.5:0.95', A: 78, fullMark: 100 },
    { subject: 'Precision', A: 93, fullMark: 100 },
    { subject: 'Recall', A: 91, fullMark: 100 },
    { subject: 'Speed (FPS)', A: 85, fullMark: 100 },
    { subject: 'F1-Score', A: 92, fullMark: 100 },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
         <h2 className="text-3xl font-bold text-white mb-2">Model Evaluation</h2>
         <p className="text-slate-400">Comprehensive analysis of model performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Class Metrics */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
           <h3 className="text-lg font-semibold text-white mb-6">Per-Class Performance</h3>
           <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classMetrics} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" domain={[0, 1]} />
                  <YAxis dataKey="name" type="category" stroke="#e2e8f0" width={60} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                    cursor={{fill: '#334155', opacity: 0.4}}
                  />
                  <Legend />
                  <Bar dataKey="precision" fill="#3b82f6" name="Precision" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="recall" fill="#22c55e" name="Recall" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="f1" fill="#a855f7" name="F1 Score" radius={[0, 4, 4, 0]} />
                </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Overall Radar */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
           <h3 className="text-lg font-semibold text-white mb-6">Overall Model Capability</h3>
           <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                 <PolarGrid stroke="#334155" />
                 <PolarAngleAxis dataKey="subject" stroke="#94a3b8" />
                 <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                 <Radar name="YOLOv8-Custom" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                 <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
               </RadarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Confusion Matrix (Simplified Visualization) */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-6">Confusion Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead>
              <tr>
                <th className="p-3 text-slate-400 font-medium border-b border-slate-700">Actual \ Predicted</th>
                {confusionMatrixData.map(d => (
                  <th key={d.name} className="p-3 text-white font-medium border-b border-slate-700">{d.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {confusionMatrixData.map((row) => (
                <tr key={row.name}>
                  <td className="p-3 text-white font-medium border-r border-slate-700">{row.name}</td>
                  <td className="p-3" style={{backgroundColor: `rgba(59, 130, 246, ${row.Person})`, color: row.Person > 0.5 ? 'white' : 'gray'}}>{row.Person.toFixed(2)}</td>
                  <td className="p-3" style={{backgroundColor: `rgba(59, 130, 246, ${row.Car})`, color: row.Car > 0.5 ? 'white' : 'gray'}}>{row.Car.toFixed(2)}</td>
                  <td className="p-3" style={{backgroundColor: `rgba(59, 130, 246, ${row.Bike})`, color: row.Bike > 0.5 ? 'white' : 'gray'}}>{row.Bike.toFixed(2)}</td>
                  <td className="p-3" style={{backgroundColor: `rgba(59, 130, 246, ${row.Dog})`, color: row.Dog > 0.5 ? 'white' : 'gray'}}>{row.Dog.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EvaluationView;
