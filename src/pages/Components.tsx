import { useAppStore } from '../store/useAppStore';
import Header from '../components/layout/Header';
import { cn, formatDate, getStatusColor, getStatusBg } from '../lib/utils';
import { getFatiguePrediction } from '../lib/fatigueModel';
import { Eye, AlertTriangle, Activity, Clock } from 'lucide-react';
import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getAggregatedData } from '../lib/mockData';

export default function Components() {
  const { components, setSelectedComponent } = useAppStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'mooring' | 'anchor'>('all');

  const filtered = filterType === 'all' ? components : components.filter(c => c.type === filterType);
  const selected = components.find(c => c.id === selectedId);
  const selectedData = selected ? getAggregatedData(selected, 60).slice(-24) : [];
  const selectedPrediction = selected ? getFatiguePrediction(selected) : null;

  return (
    <div className="flex-1 overflow-auto">
      <Header title="Components Management" />
      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterType('all')}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              filterType === 'all' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
            )}
          >
            All ({components.length})
          </button>
          <button
            onClick={() => setFilterType('mooring')}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              filterType === 'mooring' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
            )}
          >
            Moorings ({components.filter(c => c.type === 'mooring').length})
          </button>
          <button
            onClick={() => setFilterType('anchor')}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              filterType === 'anchor' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
            )}
          >
            Anchors ({components.filter(c => c.type === 'anchor').length})
          </button>
        </div>

        {/* Table */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Component</th>
                  <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Type</th>
                  <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Fatigue</th>
                  <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Failure Prob.</th>
                  <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Last Inspection</th>
                  <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((comp) => (
                  <tr
                    key={comp.id}
                    className={cn(
                      'border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors',
                      selectedId === comp.id && 'bg-blue-500/5'
                    )}
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-white">{comp.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-400 capitalize">{comp.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', getStatusBg(comp.status), getStatusColor(comp.status))}>
                        {comp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={cn('h-full rounded-full',
                              comp.fatigueAccumulation > 0.7 ? 'bg-red-400' : comp.fatigueAccumulation > 0.4 ? 'bg-amber-400' : 'bg-emerald-400'
                            )}
                            style={{ width: `${comp.fatigueAccumulation * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-300">{(comp.fatigueAccumulation * 100).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs font-medium',
                        comp.failureProbability > 0.5 ? 'text-red-400' : comp.failureProbability > 0.25 ? 'text-amber-400' : 'text-emerald-400'
                      )}>
                        {(comp.failureProbability * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-400">{formatDate(comp.lastInspection)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedId(comp.id === selectedId ? null : comp.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        {selected && selectedPrediction && (
          <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">{selected.name} - Detailed Analysis</h3>
              <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', getStatusBg(selected.status), getStatusColor(selected.status))}>
                {selected.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                <p className="text-[10px] text-slate-400">Miner Damage</p>
                <p className="text-lg font-bold text-amber-400">{(selectedPrediction.minerDamage * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                <p className="text-[10px] text-slate-400">Failure Probability</p>
                <p className="text-lg font-bold text-red-400">{(selectedPrediction.weibullProbability * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                <p className="text-[10px] text-slate-400">Remaining Life</p>
                <p className="text-lg font-bold text-blue-400">{selectedPrediction.estimatedRemainingLife.toFixed(1)} yr</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                <p className="text-[10px] text-slate-400">Trend</p>
                <p className={cn('text-lg font-bold',
                  selectedPrediction.trend === 'degrading' ? 'text-red-400' : selectedPrediction.trend === 'improving' ? 'text-emerald-400' : 'text-slate-400'
                )}>
                  {selectedPrediction.trend}
                </p>
              </div>
            </div>

            {/* Tension chart for selected component */}
            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
              <p className="text-xs text-slate-400 mb-2">Tension History (Last 24h)</p>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={selectedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="timestamp"
                    tick={{ fontSize: 9, fill: '#64748b' }}
                    tickFormatter={(v) => new Date(v).toLocaleTimeString('en', { hour: '2-digit' })}
                  />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Line type="monotone" dataKey="tension" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
