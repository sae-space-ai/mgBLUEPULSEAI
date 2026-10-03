import { useAppStore } from '../../store/useAppStore';
import { Bell, Search, Wind, Waves, Thermometer } from 'lucide-react';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { alerts, settings } = useAppStore();
  const activeAlerts = alerts.filter(a => !a.acknowledged).length;

  return (
    <header className="h-16 bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="text-xs text-slate-400">Floating Offshore Wind - Mooring & Anchoring Systems</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Environmental conditions */}
        <div className="hidden md:flex items-center gap-3 bg-slate-800/50 rounded-lg px-3 py-1.5 border border-slate-700/50">
          <div className="flex items-center gap-1.5 text-xs">
            <Waves className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-300">{settings.waveHeight}m</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300">{settings.windSpeed}m/s</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300">12°C</span>
          </div>
        </div>

        {/* Search */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-1.5 border border-slate-700/50">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search components..."
            className="bg-transparent text-sm text-white placeholder-slate-500 outline-none w-40"
          />
        </div>

        {/* Alerts badge */}
        <div className="relative">
          <Bell className="w-5 h-5 text-slate-400" />
          {activeAlerts > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
              {activeAlerts}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
