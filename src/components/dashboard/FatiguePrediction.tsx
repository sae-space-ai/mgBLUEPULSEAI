import { useAppStore } from '../../store/useAppStore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus, Brain } from 'lucide-react';

export default function FatiguePrediction() {
  const { components, predictions, settings } = useAppStore();

  const predictionArray = Array.from(predictions.values());
  
  // Use AI predictions if available
  const avgMinerDamage = predictionArray.length > 0
    ? predictionArray.reduce((s, p) => s + p.fatigue.minerDamage, 0) / predictionArray.length
    : components.reduce((s, c) => s + c.fatigueAccumulation, 0) / components.length;
  
  const avgWeibullProb = predictionArray.length > 0
    ? predictionArray.reduce((s, p) => s + p.failure.weibullProbability, 0) / predictionArray.length
    : components.reduce((s, c) => s + c.failureProbability, 0) / components.length;
  
  const avgRemainingLife = predictionArray.length > 0
    ? predictionArray.reduce((s, p) => s + p.failure.remainingUsefulLife, 0) / predictionArray.length
    : 15;

  // Evolution data from first component prediction
  const evolutionData = predictionArray.length > 0
    ? predictionArray[0].fatigue.evolution.map(e => ({
        month: `M+${e.month}`,
        damage: e.damage * 100,
        rate: e.rate * 100,
      }))
    : [];

  // Bar data for components
  const barData = predictionArray.length > 0
    ? predictionArray.map(p => ({
        name: p.componentId.replace('mooring-', 'M').replace('anchor-', 'A'),
        damage: p.fatigue.minerDamage * 100,
        failure: p.failure.weibullProbability * 100,
        risk: p.risk.score * 100,
        status: p.risk.level === 'critical' ? 'critical' : p.risk.level === 'high' ? 'warning' : 'optimal',
      }))
    : components.map(c => ({
        name: c.id.replace('mooring-', 'M').replace('anchor-', 'A'),
        damage: c.fatigueAccumulation * 100,
        failure: c.failureProbability * 100,
        risk: c.failureProbability * 100,
        status: c.status,
      }));

  const getBarColor = (status: string) => {
    switch (status) {
      case 'optimal': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center gap-1 mb-1">
            <p className="text-xs text-slate-400">Avg. Miner Damage</p>
            <Brain className="w-3 h-3 text-purple-400" />
          </div>
          <p className={cn('text-xl font-bold mt-1', avgMinerDamage > 0.6 ? 'text-red-400' : avgMinerDamage > 0.3 ? 'text-amber-400' : 'text-emerald-400')}>
            {(avgMinerDamage * 100).toFixed(1)}%
          </p>
          <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', avgMinerDamage > 0.6 ? 'bg-red-400' : avgMinerDamage > 0.3 ? 'bg-amber-400' : 'bg-emerald-400')}
              style={{ width: `${avgMinerDamage * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1">D = Σ(ni/Ni) | S-N: N=(S₀/S)^m, S₀=100MPa, m=3</p>
        </div>

        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center gap-1 mb-1">
            <p className="text-xs text-slate-400">Avg. Failure Probability</p>
            <Brain className="w-3 h-3 text-purple-400" />
          </div>
          <p className={cn('text-xl font-bold mt-1', avgWeibullProb > 0.5 ? 'text-red-400' : avgWeibullProb > 0.25 ? 'text-amber-400' : 'text-emerald-400')}>
            {(avgWeibullProb * 100).toFixed(1)}%
          </p>
          <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', avgWeibullProb > 0.5 ? 'bg-red-400' : avgWeibullProb > 0.25 ? 'bg-amber-400' : 'bg-emerald-400')}
              style={{ width: `${avgWeibullProb * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Weibull: F(t) = 1-exp(-(t/η)^β), β=2.5, η=20yr</p>
        </div>

        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center gap-1 mb-1">
            <p className="text-xs text-slate-400">Avg. Remaining Life</p>
            <Brain className="w-3 h-3 text-purple-400" />
          </div>
          <p className="text-xl font-bold mt-1 text-blue-400">
            {avgRemainingLife.toFixed(1)} yr
          </p>
          <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-400 transition-all"
              style={{ width: `${(avgRemainingLife / settings.designLife) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Design life: {settings.designLife} years | Safety factor: {settings.safetyFactor}x</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Fatigue evolution */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-xs font-semibold text-white">AI Fatigue Evolution Prediction</h4>
            <Brain className="w-3 h-3 text-purple-400" />
          </div>
          {evolutionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={evolutionData}>
                <defs>
                  <linearGradient id="damageGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="damage" stroke="#f59e0b" fill="url(#damageGradient)" strokeWidth={2} name="Damage %" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-xs text-slate-500">
              Waiting for AI predictions...
            </div>
          )}
        </div>

        {/* Component comparison */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-xs font-semibold text-white">AI Risk by Component</h4>
            <Brain className="w-3 h-3 text-purple-400" />
          </div>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="risk" radius={[4, 4, 0, 0]} name="Risk %">
                  {barData.map((entry, index) => (
                    <Cell key={index} fill={getBarColor(entry.status)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-xs text-slate-500">
              Waiting for AI predictions...
            </div>
          )}
        </div>
      </div>

      {/* Trend indicators */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
        <div className="flex items-center gap-2 mb-3">
          <h4 className="text-xs font-semibold text-white">AI Component Trends & Predictions</h4>
          <Brain className="w-3 h-3 text-purple-400" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {predictionArray.length > 0 ? predictionArray.map((pred) => (
            <div key={pred.componentId} className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/30">
              <p className="text-[10px] text-slate-400 truncate">{pred.componentId.replace('mooring-', 'M-').replace('anchor-', 'A-')}</p>
              <div className="flex items-center gap-1 mt-1">
                {pred.fatigue.trend === 'degrading' && <TrendingDown className="w-3 h-3 text-red-400" />}
                {pred.fatigue.trend === 'improving' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                {pred.fatigue.trend === 'stable' && <Minus className="w-3 h-3 text-slate-400" />}
                <span className={cn('text-[10px] font-medium', 
                  pred.fatigue.trend === 'degrading' ? 'text-red-400' : pred.fatigue.trend === 'improving' ? 'text-emerald-400' : 'text-slate-400'
                )}>
                  {pred.fatigue.trend}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">RUL: {pred.failure.remainingUsefulLife.toFixed(1)}yr</p>
              <p className="text-[10px] text-slate-500">Risk: {(pred.risk.score * 100).toFixed(0)}%</p>
            </div>
          )) : components.map((comp) => (
            <div key={comp.id} className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/30">
              <p className="text-[10px] text-slate-400 truncate">{comp.id.replace('mooring-', 'M-').replace('anchor-', 'A-')}</p>
              <div className="flex items-center gap-1 mt-1">
                <Minus className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] font-medium text-slate-400">analyzing</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Loading...</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
