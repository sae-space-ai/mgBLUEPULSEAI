import { useAppStore } from '../../store/useAppStore';
import { cn, formatDate } from '../../lib/utils';
import { AlertTriangle, AlertCircle, Info, CheckCircle, X } from 'lucide-react';

export default function AlertsList() {
  const { alerts, acknowledgeAlert } = useAppStore();

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'high': return <AlertCircle className="w-4 h-4 text-orange-400" />;
      case 'medium': return <Info className="w-4 h-4 text-amber-400" />;
      case 'low': return <Info className="w-4 h-4 text-blue-400" />;
      default: return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500/30 bg-red-500/5';
      case 'high': return 'border-orange-500/30 bg-orange-500/5';
      case 'medium': return 'border-amber-500/30 bg-amber-500/5';
      case 'low': return 'border-blue-500/30 bg-blue-500/5';
      default: return 'border-slate-700 bg-slate-800/50';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">
          Active Alerts ({alerts.filter(a => !a.acknowledged).length})
        </h3>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              'rounded-lg border p-3 transition-all',
              getSeverityBg(alert.severity),
              alert.acknowledged && 'opacity-50'
            )}
          >
            <div className="flex items-start gap-3">
              {getSeverityIcon(alert.severity)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn('text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border', getSeverityBadge(alert.severity))}>
                    {alert.severity}
                  </span>
                  <span className="text-xs text-slate-300 font-medium">{alert.componentName}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{alert.description}</p>
                <p className="text-[10px] text-slate-500 mt-1">
                  <span className="text-emerald-400">→ Action:</span> {alert.recommendedAction}
                </p>
                <p className="text-[10px] text-slate-600 mt-1">{formatDate(alert.timestamp)}</p>
              </div>
              {!alert.acknowledged && (
                <button
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="p-1 rounded hover:bg-slate-700/50 transition-colors"
                  title="Acknowledge"
                >
                  <CheckCircle className="w-4 h-4 text-slate-400 hover:text-emerald-400" />
                </button>
              )}
              {alert.acknowledged && (
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Acknowledged
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
