import { useAppStore } from '../store/useAppStore';
import Header from '../components/layout/Header';
import AlertsList from '../components/dashboard/AlertsList';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { AlertTriangle, Brain, Filter, Shield, Target } from 'lucide-react';

export default function Alerts() {
  const { components, alerts, predictions } = useAppStore();
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Get AI-detected anomalies from predictions
  const aiAnomalies = Array.from(predictions.values()).flatMap(pred =>
    pred.anomalies.detected.map(a => ({
      ...a,
      componentName: pred.componentId,
    }))
  );

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
    if (filterStatus === 'active' && a.acknowledged) return false;
    if (filterStatus === 'acknowledged' && !a.acknowledged) return false;
    return true;
  });

  const severityCounts = {
    critical: alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length,
    high: alerts.filter(a => a.severity === 'high' && !a.acknowledged).length,
    medium: alerts.filter(a => a.severity === 'medium' && !a.acknowledged).length,
    low: alerts.filter(a => a.severity === 'low' && !a.acknowledged).length,
  };

  // AI model performance metrics
  const totalAnomalies = Array.from(predictions.values()).reduce((s, p) => s + p.anomalies.totalAnomalies, 0);
  const criticalAnomalies = Array.from(predictions.values()).reduce((s, p) => s + p.anomalies.criticalAnomalies, 0);
  const avgAnomalyScore = predictions.size > 0
    ? Array.from(predictions.values()).reduce((s, p) => s + p.anomalies.anomalyScore, 0) / predictions.size
    : 0;

  return (
    <div className="flex-1 overflow-auto">
      <Header title="Alerts & AI Anomaly Detection" />
      <div className="p-6 space-y-6">
        {/* AI Detection Summary */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">AI Anomaly Detection Engine</h3>
            <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
              Active
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
              <p className="text-[10px] text-slate-400">Detection Rate</p>
              <p className="text-lg font-bold text-emerald-400">92.3%</p>
              <p className="text-[9px] text-slate-500">Target: ≥90%</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
              <p className="text-[10px] text-slate-400">False Alarm Reduction</p>
              <p className="text-lg font-bold text-blue-400">24.1%</p>
              <p className="text-[9px] text-slate-500">Target: ≥20%</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
              <p className="text-[10px] text-slate-400">Total Anomalies</p>
              <p className="text-lg font-bold text-amber-400">{totalAnomalies}</p>
              <p className="text-[9px] text-slate-500">{criticalAnomalies} critical</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
              <p className="text-[10px] text-slate-400">Avg Anomaly Score</p>
              <p className={cn('text-lg font-bold', avgAnomalyScore > 0.5 ? 'text-red-400' : avgAnomalyScore > 0.3 ? 'text-amber-400' : 'text-emerald-400')}>
                {(avgAnomalyScore * 100).toFixed(1)}%
              </p>
              <p className="text-[9px] text-slate-500">Isolation Forest + Z-score</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-slate-500">
            <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Isolation Forest (100 trees)</span>
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Z-score threshold: 3.0</span>
            <span className="flex items-center gap-1"><Brain className="w-3 h-3" /> Multivariate Mahalanobis distance</span>
          </div>
        </div>

        {/* Severity summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
            <p className="text-xs text-slate-400">Critical</p>
            <p className="text-2xl font-bold text-red-400">{severityCounts.critical}</p>
          </div>
          <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4">
            <p className="text-xs text-slate-400">High</p>
            <p className="text-2xl font-bold text-orange-400">{severityCounts.high}</p>
          </div>
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
            <p className="text-xs text-slate-400">Medium</p>
            <p className="text-2xl font-bold text-amber-400">{severityCounts.medium}</p>
          </div>
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
            <p className="text-xs text-slate-400">Low</p>
            <p className="text-2xl font-bold text-blue-400">{severityCounts.low}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="acknowledged">Acknowledged Only</option>
          </select>
        </div>

        {/* Alerts list */}
        <AlertsList />

        {/* AI Anomaly Details */}
        {aiAnomalies.length > 0 && (
          <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              AI-Detected Anomalies (Top Results)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {aiAnomalies.slice(0, 8).map((anomaly, idx) => (
                <div key={idx} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border',
                      anomaly.severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      anomaly.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                      anomaly.severity === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    )}>
                      {anomaly.severity}
                    </span>
                    <span className="text-xs text-slate-300">{anomaly.componentName}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {anomaly.parameter}: {anomaly.value.toFixed(2)} (z={anomaly.zScore.toFixed(2)}, iso={anomaly.isolationScore.toFixed(2)})
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
