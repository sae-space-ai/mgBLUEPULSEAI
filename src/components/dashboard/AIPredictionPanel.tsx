import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';
import { Brain, TrendingUp, TrendingDown, Minus, AlertTriangle, Shield, Target, Zap } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

export default function AIPredictionPanel() {
  const { predictions, systemKPIs, isLoading } = useAppStore();

  if (isLoading || predictions.size === 0) {
    return (
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-semibold text-white">AI Prediction Engine</h3>
        </div>
        <p className="text-xs text-slate-400">Initializing AI models and analyzing sensor data...</p>
      </div>
    );
  }

  const predictionArray = Array.from(predictions.values());
  
  // Risk distribution data
  const riskData = predictionArray.map(p => ({
    name: p.componentId.replace('mooring-', 'M').replace('anchor-', 'A'),
    risk: p.risk.score * 100,
    fatigue: p.fatigue.minerDamage * 100,
    failure: p.failure.weibullProbability * 100,
  }));

  // Radar chart for system overview
  const radarData = [
    { metric: 'Fatigue', value: (predictionArray.reduce((s, p) => s + p.fatigue.minerDamage, 0) / predictionArray.length) * 100 },
    { metric: 'Failure Prob', value: (predictionArray.reduce((s, p) => s + p.failure.weibullProbability, 0) / predictionArray.length) * 100 },
    { metric: 'Anomalies', value: (predictionArray.reduce((s, p) => s + p.anomalies.anomalyScore, 0) / predictionArray.length) * 100 },
    { metric: 'Environment', value: (predictionArray.reduce((s, p) => s + p.risk.factors.environment, 0) / predictionArray.length) * 100 },
    { metric: 'Risk', value: (predictionArray.reduce((s, p) => s + p.risk.score, 0) / predictionArray.length) * 100 },
  ];

  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-semibold text-white">AI Prediction Results</h3>
          <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
            {predictions.size} components analyzed
          </span>
        </div>
      </div>

      {/* System KPIs */}
      {systemKPIs && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
            <p className="text-[10px] text-slate-400">Overall Health</p>
            <p className={cn('text-lg font-bold',
              systemKPIs.overallHealth > 70 ? 'text-emerald-400' : systemKPIs.overallHealth > 40 ? 'text-amber-400' : 'text-red-400'
            )}>
              {systemKPIs.overallHealth.toFixed(1)}%
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
            <p className="text-[10px] text-slate-400">Availability</p>
            <p className="text-lg font-bold text-blue-400">{systemKPIs.availability.toFixed(1)}%</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
            <p className="text-[10px] text-slate-400">Total Anomalies</p>
            <p className="text-lg font-bold text-amber-400">{systemKPIs.totalAnomalies}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
            <p className="text-[10px] text-slate-400">Critical</p>
            <p className="text-lg font-bold text-red-400">{systemKPIs.criticalComponents}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
            <p className="text-[10px] text-slate-400">Avg Risk</p>
            <p className={cn('text-lg font-bold',
              systemKPIs.averageRisk > 0.5 ? 'text-red-400' : systemKPIs.averageRisk > 0.3 ? 'text-amber-400' : 'text-emerald-400'
            )}>
              {(systemKPIs.averageRisk * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
            <p className="text-[10px] text-slate-400">Maint. Cost</p>
            <p className="text-lg font-bold text-cyan-400">€{(systemKPIs.totalMaintenanceCost / 1000).toFixed(0)}k</p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Risk by component */}
        <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
          <p className="text-xs text-slate-400 mb-2 font-medium">AI Risk Score by Component</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={riskData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 9, fill: '#64748b' }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }}
              />
              <Bar dataKey="risk" fill="#8b5cf6" radius={[2, 2, 0, 0]} name="Risk %" />
              <Bar dataKey="fatigue" fill="#f59e0b" radius={[2, 2, 0, 0]} name="Fatigue %" />
              <Bar dataKey="failure" fill="#ef4444" radius={[2, 2, 0, 0]} name="Failure %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* System radar */}
        <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
          <p className="text-xs text-slate-400 mb-2 font-medium">System Health Radar</p>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <PolarRadiusAxis tick={{ fontSize: 8, fill: '#64748b' }} domain={[0, 100]} />
              <Radar name="Score" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Component predictions summary */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {predictionArray.slice(0, 8).map(pred => (
          <div key={pred.componentId} className={cn(
            'rounded-lg p-2 border text-xs',
            pred.risk.level === 'critical' ? 'bg-red-500/5 border-red-500/20' :
            pred.risk.level === 'high' ? 'bg-orange-500/5 border-orange-500/20' :
            pred.risk.level === 'medium' ? 'bg-amber-500/5 border-amber-500/20' :
            'bg-emerald-500/5 border-emerald-500/20'
          )}>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium truncate">{pred.componentId.replace('mooring-', 'M-').replace('anchor-', 'A-')}</span>
              {pred.fatigue.trend === 'degrading' && <TrendingDown className="w-3 h-3 text-red-400" />}
              {pred.fatigue.trend === 'improving' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
              {pred.fatigue.trend === 'stable' && <Minus className="w-3 h-3 text-slate-400" />}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn('font-bold',
                pred.risk.level === 'critical' ? 'text-red-400' :
                pred.risk.level === 'high' ? 'text-orange-400' :
                pred.risk.level === 'medium' ? 'text-amber-400' : 'text-emerald-400'
              )}>
                Risk: {(pred.risk.score * 100).toFixed(0)}%
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">RUL: {pred.failure.remainingUsefulLife.toFixed(1)}yr</span>
            </div>
            <p className="text-[9px] text-slate-500 mt-1 truncate">{pred.maintenance.priority} priority</p>
          </div>
        ))}
      </div>
    </div>
  );
}
