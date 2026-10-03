import { useAppStore } from '../store/useAppStore';
import Header from '../components/layout/Header';
import { Settings as SettingsIcon, Sliders, Shield, Wind, Waves } from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings } = useAppStore();

  return (
    <div className="flex-1 overflow-auto">
      <Header title="Settings" />
      <div className="p-6 space-y-6">
        {/* Alert Thresholds */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
            <Sliders className="w-4 h-4 text-blue-400" />
            Alert Thresholds
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Tension Threshold (kN)</label>
              <input
                type="number"
                value={settings.tensionThreshold}
                onChange={(e) => updateSettings({ tensionThreshold: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Acceleration Threshold (m/s²)</label>
              <input
                type="number"
                step="0.1"
                value={settings.accelerationThreshold}
                onChange={(e) => updateSettings({ accelerationThreshold: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Fatigue Warning Level (%)</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.fatigueWarningLevel}
                onChange={(e) => updateSettings({ fatigueWarningLevel: Number(e.target.value) })}
                className="w-full accent-amber-400"
              />
              <span className="text-xs text-amber-400">{(settings.fatigueWarningLevel * 100).toFixed(0)}%</span>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Fatigue Critical Level (%)</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.fatigueCriticalLevel}
                onChange={(e) => updateSettings({ fatigueCriticalLevel: Number(e.target.value) })}
                className="w-full accent-red-400"
              />
              <span className="text-xs text-red-400">{(settings.fatigueCriticalLevel * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Fatigue Model Parameters */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-purple-400" />
            Fatigue Model Parameters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Safety Factor</label>
              <input
                type="number"
                step="0.1"
                value={settings.safetyFactor}
                onChange={(e) => updateSettings({ safetyFactor: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">Applied to S-N curve and fatigue life calculations</p>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Design Life (years)</label>
              <input
                type="number"
                value={settings.designLife}
                onChange={(e) => updateSettings({ designLife: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">Expected operational lifetime of mooring system</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-slate-400 mb-2">Model Configuration</p>
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30 text-xs text-slate-300 space-y-1">
                <p>S-N Curve: N = (S₀/S)^m where S₀ = 100 MPa, m = 3</p>
                <p>Miner's Rule: D = Σ(ni/Ni), failure when D ≥ 1.0</p>
                <p>Weibull Distribution: F(t) = 1 - exp(-(t/η)^β), β = 2.5, η = 20 years</p>
                <p>Anomaly Detection: Z-score threshold = 3.0 (simulated Isolation Forest)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Environmental Conditions Simulation */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
            <Waves className="w-4 h-4 text-cyan-400" />
            Environmental Conditions (Simulation)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs text-slate-400 block mb-1 flex items-center gap-1">
                <Waves className="w-3 h-3 text-blue-400" /> Significant Wave Height (m)
              </label>
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={settings.waveHeight}
                onChange={(e) => updateSettings({ waveHeight: Number(e.target.value) })}
                className="w-full accent-blue-400"
              />
              <span className="text-xs text-blue-400">{settings.waveHeight} m</span>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1 flex items-center gap-1">
                <Wind className="w-3 h-3 text-cyan-400" /> Wind Speed (m/s)
              </label>
              <input
                type="range"
                min="0"
                max="35"
                step="1"
                value={settings.windSpeed}
                onChange={(e) => updateSettings({ windSpeed: Number(e.target.value) })}
                className="w-full accent-cyan-400"
              />
              <span className="text-xs text-cyan-400">{settings.windSpeed} m/s</span>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Current Speed (m/s)</label>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={settings.currentSpeed}
                onChange={(e) => updateSettings({ currentSpeed: Number(e.target.value) })}
                className="w-full accent-teal-400"
              />
              <span className="text-xs text-teal-400">{settings.currentSpeed} m/s</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-4">
            These parameters simulate different sea states and environmental loads for fatigue analysis.
            Higher values will increase calculated fatigue rates and failure probabilities.
          </p>
        </div>
      </div>
    </div>
  );
}
