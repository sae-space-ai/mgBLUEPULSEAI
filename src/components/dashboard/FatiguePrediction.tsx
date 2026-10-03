import { useAppStore } from '../../store/useAppStore';
import { getFatiguePrediction, generateFatigueEvolution } from '../../lib/fatigueModel';
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
} from 'recharts';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function FatiguePrediction() {
  const { components, settings } = useAppStore();

  const predictions = components.map(c => getFatiguePrediction(c));
  const evolutionData = generateFatigueEvolution(components[0], 12);

  const avgMinerDamage = predictions.reduce((s, p) => s + p.minerDamage, 0) / predictions.length;
  const avgWeibullProb = predictions.reduce((s, p) => s + p.weibullProbability, 0) / predictions.length;
  const avgRemainingLife = predictions.reduce((s, p) => s + p.estimatedRemainingLife, 0) / predictions.length;

  const barData = components.map(c => ({
    name: c.name.split(' ').slice(-1)[0],
    damage: c.fatigueAccumulation * 100,
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
          <p className="text-xs text-slate-400">Avg. Miner Damage</p>
          <p className={cn('text-xl font-bold mt-1', avgMinerDamage > 0.6 ? 'text-red-400' : avgMinerDamage > 0.3 ? 'text-amber-400' : 'text-emerald-400')}>
            {(avgMinerDamage * 100).toFixed(1)}%
          </p>
          <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', avgMinerDamage > 0.6 ? 'bg-red-400' : avgMinerDamage > 0.3 ? 'bg-amber-400' : 'bg-emerald-400')}
              style={{ width: `${avgMinerDamage * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1">D = Σ(ni/Ni) - S-N curve: N=(S₀/S)^m</p>
        </div>

        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
          <p className="text-xs text-slate-400">Avg. Failure Probability</p>
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
          <p className="text-xs text-slate-400">Avg. Remaining Life</p>
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
          <h4 className="text-xs font-semibold text-white mb-3">Fatigue Evolution (Last 12 Months)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 9, fill: '#64748b' }} domain={[0, 1]} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }}
              />
              <Line type="monotone" dataKey="damage" stroke="#f59e0b" strokeWidth={2} dot={false} name="Miner Damage" />
              <Line type="monotone" dataKey="probability" stroke="#ef4444" strokeWidth={2} dot={false} name="Failure Prob." />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Component comparison */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
          <h4 className="text-xs font-semibold text-white mb-3">Fatigue by Component (%)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 9, fill: '#64748b' }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }}
              />
              <Bar dataKey="damage" radius={[4, 4, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={index} fill={getBarColor(entry.status)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend indicators */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
        <h4 className="text-xs font-semibold text-white mb-3">Component Trends</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {predictions.map((pred) => {
            const comp = components.find(c => c.id === pred.componentId);
            return (
              <div key={pred.componentId} className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/30">
                <p className="text-[10px] text-slate-400 truncate">{comp?.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  {pred.trend === 'degrading' && <TrendingDown className="w-3 h-3 text-red-400" />}
                  {pred.trend === 'improving' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                  {pred.trend === 'stable' && <Minus className="w-3 h-3 text-slate-400" />}
                  <span className={cn('text-[10px] font-medium', 
                    pred.trend === 'degrading' ? 'text-red-400' : pred.trend === 'improving' ? 'text-emerald-400' : 'text-slate-400'
                  )}>
                    {pred.trend}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Life: {pred.estimatedRemainingLife.toFixed(1)}yr</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
