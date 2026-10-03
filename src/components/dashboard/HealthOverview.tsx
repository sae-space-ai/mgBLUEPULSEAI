import { useAppStore } from '../../store/useAppStore';
import { Activity, AlertTriangle, Clock, Shield, TrendingDown, Zap, Brain } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function HealthOverview() {
  const { components, alerts, systemKPIs, predictions } = useAppStore();

  // Use AI KPIs if available, otherwise calculate from raw data
  const healthScore = systemKPIs?.overallHealth ?? 75;
  const avgFatigue = predictions.size > 0
    ? Array.from(predictions.values()).reduce((s, p) => s + p.fatigue.minerDamage, 0) / predictions.size
    : components.reduce((s, c) => s + c.fatigueAccumulation, 0) / components.length;
  const avgFailureProb = predictions.size > 0
    ? Array.from(predictions.values()).reduce((s, p) => s + p.failure.weibullProbability, 0) / predictions.size
    : components.reduce((s, c) => s + c.failureProbability, 0) / components.length;
  const activeAlerts = alerts.filter(a => !a.acknowledged).length;
  const criticalCount = systemKPIs?.criticalComponents ?? components.filter(c => c.status === 'critical').length;
  const warningCount = components.filter(c => c.status === 'warning').length;
  const optimalCount = components.filter(c => c.status === 'optimal').length;

  const nextMaintenance = components
    .sort((a, b) => b.fatigueAccumulation - a.fatigueAccumulation)[0];

  const cards = [
    {
      title: 'Structural Health',
      value: `${healthScore.toFixed(0)}%`,
      subtitle: 'AI-computed health index',
      icon: Shield,
      color: healthScore > 70 ? 'text-emerald-400' : healthScore > 40 ? 'text-amber-400' : 'text-red-400',
      bgColor: healthScore > 70 ? 'from-emerald-500/10' : healthScore > 40 ? 'from-amber-500/10' : 'from-red-500/10',
    },
    {
      title: 'Avg. Fatigue (Miner)',
      value: `${(avgFatigue * 100).toFixed(1)}%`,
      subtitle: 'D = Σ(ni/Ni) - AI computed',
      icon: TrendingDown,
      color: avgFatigue < 0.4 ? 'text-emerald-400' : avgFatigue < 0.7 ? 'text-amber-400' : 'text-red-400',
      bgColor: 'from-blue-500/10',
    },
    {
      title: 'Failure Probability',
      value: `${(avgFailureProb * 100).toFixed(1)}%`,
      subtitle: 'Weibull: F(t) = 1-exp(-(t/η)^β)',
      icon: Zap,
      color: avgFailureProb < 0.3 ? 'text-emerald-400' : avgFailureProb < 0.5 ? 'text-amber-400' : 'text-red-400',
      bgColor: 'from-purple-500/10',
    },
    {
      title: 'Active Alerts',
      value: `${activeAlerts}`,
      subtitle: `${criticalCount} critical, ${warningCount} warning`,
      icon: AlertTriangle,
      color: activeAlerts === 0 ? 'text-emerald-400' : activeAlerts < 5 ? 'text-amber-400' : 'text-red-400',
      bgColor: 'from-orange-500/10',
    },
    {
      title: 'AI Anomalies',
      value: `${systemKPIs?.totalAnomalies ?? 0}`,
      subtitle: 'Isolation Forest + Z-score',
      icon: Brain,
      color: 'text-purple-400',
      bgColor: 'from-violet-500/10',
    },
    {
      title: 'Next Maintenance',
      value: nextMaintenance?.name.split(' ').slice(-1)[0] || 'N/A',
      subtitle: `Fatigue: ${((nextMaintenance?.fatigueAccumulation || 0) * 100).toFixed(1)}%`,
      icon: Clock,
      color: 'text-cyan-400',
      bgColor: 'from-teal-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={cn(
              'relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br p-4',
              card.bgColor,
              'to-transparent'
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">{card.title}</p>
                <p className={cn('text-2xl font-bold mt-1', card.color)}>{card.value}</p>
                <p className="text-xs text-slate-500 mt-1">{card.subtitle}</p>
              </div>
              <div className={cn('p-2 rounded-lg bg-slate-800/50', card.color)}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
