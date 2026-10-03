import { useAppStore } from '../store/useAppStore';
import Header from '../components/layout/Header';
import { cn, formatDate, getStatusColor, getStatusBg } from '../lib/utils';
import { Eye, Brain, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useState } from 'react';
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
import { getAggregatedData } from '../lib/mockData';

export default function Components() {
  const { components, predictions, setSelectedComponent } = useAppStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'mooring' | 'anchor'>('all');

  const filtered = filterType === 'all' ? components : components.filter(c => c.type === filterType);
  const selected = components.find(c => c.id === selectedId);
  const selectedData = selected ? getAggregatedData(selected, 60).slice(-24) : [];
  const selectedPrediction = selectedId ? predictions.get(selectedId) : null;

  return (
    <div className="flex-1 overflow-auto">
      <Header title="Components Management" />
      <div className="p-6 space-y-6">
        {/* AI Status */}
        <div className="flex items-center gap-2 bg-slate-900/50 rounded-xl border border-slate-800 px-4 py-2">
          <Brain className="w-4 h-4 text-purple-400" />
          <span className="text-xs text-slate-300">AI predictions active for {predictions.size} components</span>
          <span className="text-[10px] text-slate-500 ml-auto">
            Models: Isolation Forest + Weibull + Miner's Rule + Physics-based Digital Twin
          </span>
        </div>

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
                  <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">AI Risk</th>
                  <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Fatigue (Miner)</th>
                  <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">P(Fail) Weibull</th>
                  <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">RUL</th>
                  <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Trend</th>
                  <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((comp) => {
                  const pred = predictions.get(comp.id);
                  return (
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
                        {pred ? (
                          <span className={cn('text-xs font-bold',
                            pred.risk.level === 'critical' ? 'text-red-400' :
                            pred.risk.level === 'high' ? 'text-orange-400' :
                            pred.risk.level === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                          )}>
                            {(pred.risk.score * 100).toFixed(0)}%
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">--</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={cn('h-full rounded-full',
                                (pred?.fatigue.minerDamage || comp.fatigueAccumulation) > 0.7 ? 'bg-red-400' :
                                (pred?.fatigue.minerDamage || comp.fatigueAccumulation) > 0.4 ? 'bg-amber-400' : 'bg-emerald-400'
                              )}
                              style={{ width: `${(pred?.fatigue.minerDamage || comp.fatigueAccumulation) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-300">
                            {((pred?.fatigue.minerDamage || comp.fatigueAccumulation) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('text-xs font-medium',
                          (pred?.failure.weibullProbability || comp.failureProbability) > 0.5 ? 'text-red-400' :
                          (pred?.failure.weibullProbability || comp.failureProbability) > 0.25 ? 'text-amber-400' : 'text-emerald-400'
                        )}>
                          {((pred?.failure.weibullProbability || comp.failureProbability) * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-blue-400">
                          {pred ? `${pred.failure.remainingUsefulLife.toFixed(1)}yr` : '--'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {pred && (
                          <div className="flex items-center gap-1">
                            {pred.fatigue.trend === 'degrading' && <TrendingDown className="w-3 h-3 text-red-400" />}
                            {pred.fatigue.trend === 'improving' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                            {pred.fatigue.trend === 'stable' && <Minus className="w-3 h-3 text-slate-400" />}
                            <span className={cn('text-[10px]',
                              pred.fatigue.trend === 'degrading' ? 'text-red-400' :
                              pred.fatigue.trend === 'improving' ? 'text-emerald-400' : 'text-slate-400'
                            )}>
                              {pred.fatigue.trend}
                            </span>
                          </div>
                        )}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        {selected && selectedPrediction && (
          <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">{selected.name} - AI Analysis</h3>
                <Brain className="w-4 h-4 text-purple-400" />
              </div>
              <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border',
                selectedPrediction.risk.level === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                selectedPrediction.risk.level === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                selectedPrediction.risk.level === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              )}>
                {selectedPrediction.risk.level.toUpperCase()} RISK
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                <p className="text-[10px] text-slate-400">AI Risk Score</p>
                <p className={cn('text-lg font-bold',
                  selectedPrediction.risk.level === 'critical' ? 'text-red-400' :
                  selectedPrediction.risk.level === 'high' ? 'text-orange-400' :
                  selectedPrediction.risk.level === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                )}>
                  {(selectedPrediction.risk.score * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                <p className="text-[10px] text-slate-400">Miner Damage</p>
                <p className="text-lg font-bold text-amber-400">{(selectedPrediction.fatigue.minerDamage * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                <p className="text-[10px] text-slate-400">Failure Probability</p>
                <p className="text-lg font-bold text-red-400">{(selectedPrediction.failure.weibullProbability * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                <p className="text-[10px] text-slate-400">Remaining Life</p>
                <p className="text-lg font-bold text-blue-400">{selectedPrediction.failure.remainingUsefulLife.toFixed(1)} yr</p>
              </div>
            </div>

            {/* AI Recommendation */}
            <div className={cn('rounded-lg p-3 border mb-4',
              selectedPrediction.maintenance.priority === 'immediate' ? 'bg-red-500/5 border-red-500/20' :
              selectedPrediction.maintenance.priority === 'high' ? 'bg-orange-500/5 border-orange-500/20' :
              'bg-slate-800/50 border-slate-700/30'
            )}>
              <p className="text-xs text-slate-400">AI Maintenance Recommendation</p>
              <p className="text-sm text-white mt-1">{selectedPrediction.maintenance.recommendation}</p>
              <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500">
                <span>Priority: <span className={cn('font-bold',
                  selectedPrediction.maintenance.priority === 'immediate' ? 'text-red-400' :
                  selectedPrediction.maintenance.priority === 'high' ? 'text-orange-400' : 'text-amber-400'
                )}>{selectedPrediction.maintenance.priority}</span></span>
                <span>Est. Cost: EUR {selectedPrediction.maintenance.estimatedCost.toLocaleString()}</span>
                <span>Downtime: {selectedPrediction.maintenance.estimatedDowntime}h</span>
              </div>
            </div>

            {/* Tension chart */}
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
