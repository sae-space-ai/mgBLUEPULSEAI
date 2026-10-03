import { useAppStore } from '../../store/useAppStore';
import { getAggregatedData } from '../../lib/mockData';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { useState } from 'react';

export default function SensorCharts() {
  const { components } = useAppStore();
  const [selectedComponent, setSelectedComponent] = useState(components[0]?.id || '');

  const component = components.find(c => c.id === selectedComponent);
  const data = component ? getAggregatedData(component, 60).slice(-48) : [];

  const chartConfigs = [
    { key: 'tension', label: 'Tension (kN)', color: '#3b82f6', unit: 'kN' },
    { key: 'acceleration', label: 'Acceleration (m/s²)', color: '#8b5cf6', unit: 'm/s²' },
    { key: 'inclination', label: 'Inclination (°)', color: '#06b6d4', unit: '°' },
    { key: 'temperature', label: 'Temperature (°C)', color: '#f59e0b', unit: '°C' },
    { key: 'corrosion', label: 'Corrosion Index', color: '#ef4444', unit: '' },
    { key: 'cyclicLoads', label: 'Cyclic Loads', color: '#10b981', unit: '' },
  ];

  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Sensor Data Visualization</h3>
        <select
          value={selectedComponent}
          onChange={(e) => setSelectedComponent(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
        >
          {components.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {chartConfigs.map((config) => (
          <div key={config.key} className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
            <p className="text-xs text-slate-400 mb-2 font-medium">{config.label}</p>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id={`gradient-${config.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={config.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="timestamp"
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  tickFormatter={(v) => new Date(v).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} width={40} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }}
                  labelStyle={{ color: '#94a3b8' }}
                  labelFormatter={(v) => new Date(v).toLocaleString()}
                />
                <Area
                  type="monotone"
                  dataKey={config.key}
                  stroke={config.color}
                  fill={`url(#gradient-${config.key})`}
                  strokeWidth={1.5}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
}
