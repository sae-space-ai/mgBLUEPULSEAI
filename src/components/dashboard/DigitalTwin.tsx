import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';
import { useState } from 'react';

export default function DigitalTwin() {
  const { components, setSelectedComponent } = useAppStore();
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);

  const moorings = components.filter(c => c.type === 'mooring');
  const anchors = components.filter(c => c.type === 'anchor');

  const getStatusFill = (status: string) => {
    switch (status) {
      case 'optimal': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getStatusGlow = (status: string) => {
    switch (status) {
      case 'optimal': return '0 0 8px #10b981';
      case 'warning': return '0 0 8px #f59e0b';
      case 'critical': return '0 0 12px #ef4444';
      default: return 'none';
    }
  };

  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Digital Twin - Mooring System</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-slate-400">Optimal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-[10px] text-slate-400">Warning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="text-[10px] text-slate-400">Critical</span>
          </div>
        </div>
      </div>

      <div className="relative w-full aspect-[16/10] bg-slate-950/50 rounded-lg border border-slate-800 overflow-hidden">
        <svg viewBox="0 0 400 250" className="w-full h-full">
          {/* Water surface */}
          <defs>
            <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0c4a6e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#082f49" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="seabedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1c1917" />
              <stop offset="100%" stopColor="#292524" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Water */}
          <rect x="0" y="60" width="400" height="130" fill="url(#waterGradient)" />
          
          {/* Water waves */}
          <path
            d="M0,65 Q50,58 100,65 Q150,72 200,65 Q250,58 300,65 Q350,72 400,65"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="1"
            opacity="0.4"
          >
            <animate attributeName="d"
              values="M0,65 Q50,58 100,65 Q150,72 200,65 Q250,58 300,65 Q350,72 400,65;M0,65 Q50,72 100,65 Q150,58 200,65 Q250,72 300,65 Q350,58 400,65;M0,65 Q50,58 100,65 Q150,72 200,65 Q250,58 300,65 Q350,72 400,65"
              dur="4s"
              repeatCount="indefinite"
            />
          </path>

          {/* Seabed */}
          <rect x="0" y="190" width="400" height="60" fill="url(#seabedGradient)" />
          <path d="M0,190 Q100,185 200,192 Q300,198 400,190" fill="#44403c" opacity="0.5" />

          {/* Floating platform (wind turbine) */}
          <g transform="translate(200, 55)">
            {/* Platform hull */}
            <polygon points="-30,0 30,0 25,15 -25,15" fill="#334155" stroke="#475569" strokeWidth="1" />
            {/* Tower */}
            <rect x="-3" y="-45" width="6" height="45" fill="#64748b" />
            {/* Nacelle */}
            <rect x="-6" y="-50" width="12" height="8" rx="2" fill="#475569" />
            {/* Blades */}
            <g transform="translate(0, -46)">
              <line x1="0" y1="0" x2="0" y2="-25" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="3s" repeatCount="indefinite" />
              </line>
              <line x1="0" y1="0" x2="22" y2="12" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="3s" repeatCount="indefinite" />
              </line>
              <line x1="0" y1="0" x2="-22" y2="12" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="3s" repeatCount="indefinite" />
              </line>
            </g>
            {/* Hub */}
            <circle cx="0" cy="-46" r="3" fill="#64748b" />
          </g>

          {/* Mooring lines */}
          {moorings.map((mooring, i) => {
            const angle = (i * 60 - 90) * (Math.PI / 180);
            const startX = 200 + Math.cos(angle) * 25;
            const startY = 70;
            const endX = 200 + Math.cos(angle) * 140;
            const endY = 200;
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2 + 20;
            const isHovered = hoveredComponent === mooring.id;

            return (
              <g key={mooring.id}>
                <path
                  d={`M${startX},${startY} Q${midX},${midY} ${endX},${endY}`}
                  fill="none"
                  stroke={getStatusFill(mooring.status)}
                  strokeWidth={isHovered ? 3 : 2}
                  strokeDasharray={mooring.status === 'critical' ? '4,2' : 'none'}
                  opacity={isHovered ? 1 : 0.7}
                  filter={isHovered ? 'url(#glow)' : 'none'}
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredComponent(mooring.id)}
                  onMouseLeave={() => setHoveredComponent(null)}
                  onClick={() => setSelectedComponent(mooring)}
                />
                {/* Mooring connection point on platform */}
                <circle
                  cx={startX}
                  cy={startY}
                  r={isHovered ? 4 : 3}
                  fill={getStatusFill(mooring.status)}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredComponent(mooring.id)}
                  onMouseLeave={() => setHoveredComponent(null)}
                />
              </g>
            );
          })}

          {/* Anchors */}
          {anchors.map((anchor, i) => {
            const angle = (i * 60 - 60) * (Math.PI / 180);
            const x = 200 + Math.cos(angle) * 140;
            const y = 205;
            const isHovered = hoveredComponent === anchor.id;

            return (
              <g key={anchor.id}>
                {/* Anchor shape */}
                <polygon
                  points={`${x},${y - 5} ${x + 8},${y + 5} ${x - 8},${y + 5}`}
                  fill={getStatusFill(anchor.status)}
                  stroke={getStatusFill(anchor.status)}
                  strokeWidth="1"
                  opacity={isHovered ? 1 : 0.8}
                  filter={isHovered ? 'url(#glow)' : 'none'}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredComponent(anchor.id)}
                  onMouseLeave={() => setHoveredComponent(null)}
                  onClick={() => setSelectedComponent(anchor)}
                />
                {/* Anchor label */}
                {isHovered && (
                  <g>
                    <rect
                      x={x - 40}
                      y={y + 10}
                      width="80"
                      height="24"
                      rx="4"
                      fill="#1e293b"
                      stroke="#334155"
                    />
                    <text x={x} y={y + 20} textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">
                      {anchor.name.split(' ').slice(-1)[0]}
                    </text>
                    <text x={x} y={y + 30} textAnchor="middle" fill="#94a3b8" fontSize="6">
                      Fatigue: {(anchor.fatigueAccumulation * 100).toFixed(1)}%
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Depth markers */}
          <text x="10" y="80" fill="#475569" fontSize="7">0m</text>
          <text x="10" y="130" fill="#475569" fontSize="7">-100m</text>
          <text x="10" y="195" fill="#475569" fontSize="7">-200m</text>

          {/* Depth lines */}
          <line x1="30" y1="77" x2="370" y2="77" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,4" />
          <line x1="30" y1="127" x2="370" y2="127" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,4" />
        </svg>

        {/* Hovered component info overlay */}
        {hoveredComponent && (
          <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-2">
            {(() => {
              const comp = components.find(c => c.id === hoveredComponent);
              if (!comp) return null;
              return (
                <div className="text-xs">
                  <p className="font-semibold text-white">{comp.name}</p>
                  <p className="text-slate-400">Fatigue: <span className={cn(
                    comp.fatigueAccumulation > 0.7 ? 'text-red-400' : comp.fatigueAccumulation > 0.4 ? 'text-amber-400' : 'text-emerald-400'
                  )}>{(comp.fatigueAccumulation * 100).toFixed(1)}%</span></p>
                  <p className="text-slate-400">Failure Prob: <span className={cn(
                    comp.failureProbability > 0.5 ? 'text-red-400' : comp.failureProbability > 0.25 ? 'text-amber-400' : 'text-emerald-400'
                  )}>{(comp.failureProbability * 100).toFixed(1)}%</span></p>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
