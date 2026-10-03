import { SensorReading, FatiguePrediction, MooringComponent } from '../types';

// S-N curve parameters
const S0 = 100; // MPa - reference stress
const m = 3; // S-N curve exponent

// Weibull distribution parameters
const beta = 2.5; // shape parameter
const eta = 20; // scale parameter (years)

// Calculate number of cycles to failure at a given stress amplitude
function cyclesToFailure(stressAmplitude: number): number {
  if (stressAmplitude <= 0) return Infinity;
  return Math.pow(S0 / stressAmplitude, m);
}

// Calculate Miner's damage for a set of sensor readings
export function calculateMinerDamage(readings: SensorReading[]): number {
  let totalDamage = 0;
  const stressBins = new Map<number, number>();

  // Bin stress amplitudes into ranges
  readings.forEach(r => {
    const bin = Math.round(r.tension / 50) * 50;
    stressBins.set(bin, (stressBins.get(bin) || 0) + 1);
  });

  // Calculate damage for each bin
  stressBins.forEach((count, stressAmplitude) => {
    if (stressAmplitude > 0) {
      const Ni = cyclesToFailure(stressAmplitude);
      if (Ni < Infinity) {
        totalDamage += count / Ni;
      }
    }
  });

  return Math.min(1, totalDamage);
}

// Calculate Weibull failure probability
export function calculateWeibullProbability(time: number): number {
  if (time <= 0) return 0;
  return 1 - Math.exp(-Math.pow(time / eta, beta));
}

// Get fatigue prediction for a component
export function getFatiguePrediction(component: MooringComponent): FatiguePrediction {
  const recentData = component.sensorData.slice(-1000);
  const minerDamage = calculateMinerDamage(recentData);
  
  // Estimate time in service (years) based on data span
  const timeInService = component.fatigueAccumulation * eta * 0.8;
  const weibullProb = calculateWeibullProbability(timeInService);
  
  // Combined failure probability
  const combinedProb = Math.min(1, (minerDamage * 0.4 + weibullProb * 0.6));
  
  // Estimated remaining life
  const remainingLife = Math.max(0, eta * (1 - combinedProb));
  
  // Trend analysis
  const recentFatigue = component.sensorData.slice(-100);
  const olderFatigue = component.sensorData.slice(-200, -100);
  
  const recentAvg = recentFatigue.reduce((s, r) => s + r.tension, 0) / recentFatigue.length;
  const olderAvg = olderFatigue.reduce((s, r) => s + r.tension, 0) / olderFatigue.length;
  
  let trend: 'improving' | 'stable' | 'degrading' = 'stable';
  if (recentAvg > olderAvg * 1.05) trend = 'degrading';
  else if (recentAvg < olderAvg * 0.95) trend = 'improving';

  return {
    componentId: component.id,
    minerDamage: Math.min(1, minerDamage + component.fatigueAccumulation * 0.5),
    weibullProbability: combinedProb,
    estimatedRemainingLife: remainingLife,
    trend,
  };
}

// Generate fatigue evolution data for charts
export function generateFatigueEvolution(component: MooringComponent, months = 12): { month: string; damage: number; probability: number }[] {
  const data = [];
  const currentDamage = component.fatigueAccumulation;
  
  for (let i = months; i >= 0; i--) {
    const factor = 1 - (i / months) * 0.4;
    const damage = currentDamage * factor;
    const prob = calculateWeibullProbability(damage * eta * 0.8);
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    
    data.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      damage: Math.min(1, damage),
      probability: Math.min(1, prob),
    });
  }
  
  return data;
}

// Simulate environmental impact on fatigue
export function calculateEnvironmentalImpact(waveHeight: number, windSpeed: number, currentSpeed: number): number {
  // Simplified model: higher environmental loads increase fatigue rate
  const waveFactor = Math.pow(waveHeight / 5, 2); // significant wave height
  const windFactor = Math.pow(windSpeed / 15, 1.5);
  const currentFactor = Math.pow(currentSpeed / 2, 1.2);
  
  return (waveFactor * 0.5 + windFactor * 0.3 + currentFactor * 0.2);
}
