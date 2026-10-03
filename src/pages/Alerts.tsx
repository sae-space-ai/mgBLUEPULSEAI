import { useAppStore } from '../store/useAppStore';
import Header from '../components/layout/Header';
import AlertsList from '../components/dashboard/AlertsList';
import { detectAnomalies, generateAnomalyAlerts } from '../lib/anomalyDetection';
import { useState, useMemo } from 'react';
import { cn } from '../lib/utils';
import { AlertTriangle, Filter } from 'lucide-react';

export default function Alerts() {
  const { components, alerts, acknowledgeAlert } = useAppStore();
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Detect anomalies across all components
  const allAnomalies = useMemo(() => {
    return components.flatMap(comp => {
      const recentData = comp.sensorData.slice(-500);
      const anomalies = detectAnomalies(recentData, 3);
      return generateAnomalyAlerts(anomalies, comp.name, comp.id);
    });
  }, [components]);

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

  return (
    <div className="flex-1 overflow-auto">
      <Header title="Alerts & Anomaly Detection" />
      <div className="p-6 space-y-6">
        {/* Summary */}
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
          <span className="text-xs text-slate-400 ml-auto">
            {allAnomalies.length} anomalies detected by AI model
          </span>
        </div>

        {/* Alerts list */}
        <AlertsList />

        {/* Anomaly detection info */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-purple-400" />
            AI Anomaly Detection Summary
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            Isolation Forest / Z-score based anomaly detection (threshold: z &gt; 3) applied to all sensor parameters.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allAnomalies.slice(0, 6).map((anomaly, idx) => (
              <div key={idx} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                <div className="flex items-center gap-2">
                  <span className={cn('text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border',
                    anomaly.severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    anomaly.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                    'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  )}>
                    {anomaly.severity}
                  </span>
                  <span className="text-xs text-slate-300">{anomaly.componentName}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">{anomaly.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
