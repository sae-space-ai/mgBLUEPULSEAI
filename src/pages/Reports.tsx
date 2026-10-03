import { useAppStore } from '../store/useAppStore';
import Header from '../components/layout/Header';
import { getFatiguePrediction } from '../lib/fatigueModel';
import { calculateHealthScore } from '../lib/anomalyDetection';
import { FileText, Download } from 'lucide-react';
import jsPDF from 'jspdf';

export default function Reports() {
  const { components, alerts, settings } = useAppStore();

  const avgFatigue = components.reduce((s, c) => s + c.fatigueAccumulation, 0) / components.length;
  const avgFailureProb = components.reduce((s, c) => s + c.failureProbability, 0) / components.length;
  const activeAlerts = alerts.filter(a => !a.acknowledged).length;
  const healthScore = calculateHealthScore(avgFatigue, avgFailureProb, activeAlerts, components.length);

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(30, 64, 175);
    doc.text('BLUEPULSE AI', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Structural Health Report - Floating Offshore Wind Mooring Systems', pageWidth / 2, 28, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 34, { align: 'center' });

    // Executive Summary
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('1. Executive Summary', 15, 48);
    doc.setFontSize(10);
    doc.text(`Overall Structural Health Index: ${healthScore}%`, 15, 58);
    doc.text(`Average Fatigue Accumulation (Miner's Damage): ${(avgFatigue * 100).toFixed(1)}%`, 15, 65);
    doc.text(`Average Failure Probability (Weibull): ${(avgFailureProb * 100).toFixed(1)}%`, 15, 72);
    doc.text(`Active Alerts: ${activeAlerts}`, 15, 79);
    doc.text(`Total Components Monitored: ${components.length}`, 15, 86);

    // Component Status
    doc.setFontSize(14);
    doc.text('2. Component Status', 15, 100);
    doc.setFontSize(9);

    let y = 110;
    components.forEach((comp) => {
      const prediction = getFatiguePrediction(comp);
      doc.text(`${comp.name} | Status: ${comp.status} | Fatigue: ${(comp.fatigueAccumulation * 100).toFixed(1)}% | Failure Prob: ${(comp.failureProbability * 100).toFixed(1)}% | Remaining Life: ${prediction.estimatedRemainingLife.toFixed(1)}yr`, 15, y);
      y += 7;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    // Alerts
    doc.setFontSize(14);
    doc.text('3. Active Alerts', 15, y + 10);
    doc.setFontSize(9);
    y += 20;

    alerts.filter(a => !a.acknowledged).slice(0, 15).forEach((alert) => {
      doc.text(`[${alert.severity.toUpperCase()}] ${alert.componentName}: ${alert.description}`, 15, y);
      y += 6;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    // Recommendations
    doc.setFontSize(14);
    doc.text('4. Recommendations', 15, y + 10);
    doc.setFontSize(9);
    y += 20;

    const criticalComponents = components.filter(c => c.status === 'critical');
    const warningComponents = components.filter(c => c.status === 'warning');

    if (criticalComponents.length > 0) {
      doc.text('CRITICAL - Immediate action required:', 15, y);
      y += 6;
      criticalComponents.forEach(c => {
        doc.text(`  - ${c.name}: Schedule emergency inspection, consider replacement planning`, 15, y);
        y += 6;
      });
    }

    if (warningComponents.length > 0) {
      doc.text('WARNING - Schedule maintenance within 30 days:', 15, y + 5);
      y += 11;
      warningComponents.forEach(c => {
        doc.text(`  - ${c.name}: Detailed inspection and fatigue model update`, 15, y);
        y += 6;
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('BLUEPULSE AI - I3FLOAT Open Challenge 1.2.3 | Confidential', pageWidth / 2, 285, { align: 'center' });

    doc.save('bluepulse-ai-structural-report.pdf');
  };

  return (
    <div className="flex-1 overflow-auto">
      <Header title="Reports" />
      <div className="p-6 space-y-6">
        {/* Generate Report */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Generate Structural Health Report
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Download a comprehensive PDF report with structural status, alerts, and recommendations.
              </p>
            </div>
            <button
              onClick={generatePDF}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Report Preview */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Report Preview</h3>
          
          <div className="space-y-4">
            {/* Summary section */}
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
              <h4 className="text-xs font-semibold text-blue-400 mb-2">EXECUTIVE SUMMARY</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <p className="text-[10px] text-slate-400">Health Index</p>
                  <p className="text-lg font-bold text-white">{healthScore}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Avg. Fatigue</p>
                  <p className="text-lg font-bold text-white">{(avgFatigue * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Failure Prob.</p>
                  <p className="text-lg font-bold text-white">{(avgFailureProb * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Active Alerts</p>
                  <p className="text-lg font-bold text-white">{activeAlerts}</p>
                </div>
              </div>
            </div>

            {/* Component summary */}
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
              <h4 className="text-xs font-semibold text-blue-400 mb-2">COMPONENT STATUS</h4>
              <div className="space-y-2">
                {components.map(comp => (
                  <div key={comp.id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{comp.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400">Fatigue: {(comp.fatigueAccumulation * 100).toFixed(1)}%</span>
                      <span className="text-slate-400">P(fail): {(comp.failureProbability * 100).toFixed(1)}%</span>
                      <span className={`font-medium ${
                        comp.status === 'critical' ? 'text-red-400' : comp.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {comp.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts summary */}
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
              <h4 className="text-xs font-semibold text-blue-400 mb-2">ACTIVE ALERTS ({activeAlerts})</h4>
              <div className="space-y-1">
                {alerts.filter(a => !a.acknowledged).slice(0, 5).map(alert => (
                  <div key={alert.id} className="flex items-center gap-2 text-xs">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      alert.severity === 'critical' ? 'bg-red-400' : alert.severity === 'high' ? 'bg-orange-400' : alert.severity === 'medium' ? 'bg-amber-400' : 'bg-blue-400'
                    }`} />
                    <span className="text-slate-300">{alert.componentName}: {alert.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
