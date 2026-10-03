/**
 * BLUEPULSE AI - Fatigue Model Module
 * Implements Miner's Rule for fatigue damage accumulation
 * and S-N curve based failure analysis
 */

// S-N Curve parameters
const S0 = 100; // Reference stress (MPa)
const m = 3; // S-N curve exponent

/**
 * Calculate cycles to failure using S-N curve
 * N = (S0 / S)^m
 */
export function cyclesToFailure(stressAmplitude: number): number {
  if (stressAmplitude <= 0) return Infinity;
  return Math.pow(S0 / stressAmplitude, m);
}

/**
 * Calculate Miner's damage for a set of stress cycles
 * D = Σ(ni / Ni)
 */
export function calculateMinerDamage(stressCycles: Map<number, number>): number {
  let totalDamage = 0;
  
  stressCycles.forEach((ni, stressAmplitude) => {
    const Ni = cyclesToFailure(stressAmplitude);
    if (Ni < Infinity) {
      totalDamage += ni / Ni;
    }
  });
  
  return Math.min(1, totalDamage);
}

/**
 * Extract stress cycles from sensor data using rainflow counting (simplified)
 */
export function extractStressCycles(tensions: number[]): Map<number, number> {
  const cycles = new Map<number, number>();
  const binSize = 10; // MPa bins
  
  // Simplified rainflow: count stress ranges
  for (let i = 1; i < tensions.length; i++) {
    const stressRange = Math.abs(tensions[i] - tensions[i - 1]);
    const bin = Math.floor(stressRange / binSize) * binSize + binSize / 2;
    cycles.set(bin, (cycles.get(bin) || 0) + 1);
  }
  
  return cycles;
}

/**
 * Calculate fatigue damage from sensor readings
 */
export function calculateFatigueFromReadings(readings: { tension: number }[]): number {
  const tensions = readings.map(r => r.tension / 10); // Scale to MPa equivalent
  const cycles = extractStressCycles(tensions);
  return calculateMinerDamage(cycles);
}

/**
 * Predict fatigue evolution over time
 */
export function predictFatigueEvolution(
  currentDamage: number,
  environmentalFactor: number,
  months: number = 12
): { month: number; damage: number; rate: number }[] {
  const evolution = [];
  let damage = currentDamage;
  
  for (let i = 0; i <= months; i++) {
    const rate = environmentalFactor * (1 - damage) * 0.01; // Damage rate decreases as damage increases
    evolution.push({
      month: i,
      damage: Math.min(1, damage),
      rate
    });
    damage += rate;
  }
  
  return evolution;
}
