import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import Header from '../components/layout/Header';
import HealthOverview from '../components/dashboard/HealthOverview';
import SensorCharts from '../components/dashboard/SensorCharts';
import DigitalTwin from '../components/dashboard/DigitalTwin';
import FatiguePrediction from '../components/dashboard/FatiguePrediction';
import AlertsList from '../components/dashboard/AlertsList';
import AIPredictionPanel from '../components/dashboard/AIPredictionPanel';
import { Brain, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { runAIPredictions, isLoading, lastPredictionUpdate } = useAppStore();

  useEffect(() => {
    // Run AI predictions on mount
    runAIPredictions();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      runAIPredictions();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [runAIPredictions]);

  return (
    <div className="flex-1 overflow-auto">
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* AI Status Bar */}
        <div className="flex items-center justify-between bg-slate-900/50 rounded-xl border border-slate-800 px-4 py-2">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-slate-300">BLUEPULSE AI Engine</span>
            {isLoading ? (
              <span className="flex items-center gap-1 text-xs text-amber-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                Processing predictions...
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active - Last update: {lastPredictionUpdate ? new Date(lastPredictionUpdate).toLocaleTimeString() : 'N/A'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-500">
            <span>Models: Isolation Forest + Weibull + Miner's Rule</span>
            <span>|</span>
            <span>12 components analyzed</span>
          </div>
        </div>

        {/* Health Overview */}
        <HealthOverview />

        {/* AI Prediction Panel */}
        <AIPredictionPanel />

        {/* Digital Twin + Alerts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <DigitalTwin />
          <AlertsList />
        </div>

        {/* Sensor Charts */}
        <SensorCharts />

        {/* Fatigue Prediction */}
        <FatiguePrediction />
      </div>
    </div>
  );
}
