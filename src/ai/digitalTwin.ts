/**
 * BLUEPULSE AI - Digital Twin Physics Module
 * Simplified physics-based model for mooring and anchoring system dynamics
 */

export interface EnvironmentalConditions {
  waveHeight: number; // Significant wave height (m)
  wavePeriod: number; // Wave period (s)
  windSpeed: number; // Wind speed (m/s)
  currentSpeed: number; // Current speed (m/s)
  waterDepth: number; // Water depth (m)
}

export interface MooringState {
  tension: number; // kN
  angle: number; // degrees from vertical
  displacement: number; // m
  stress: number; // MPa
  strain: number; // microstrain
}

/**
 * Calculate wave-induced forces on mooring system
 * Using simplified Morison equation
 */
export function calculateWaveForce(
  waveHeight: number,
  wavePeriod: number,
  waterDepth: number,
  lineDiameter: number = 0.1 // m
): number {
  const rho = 1025; // Water density (kg/m³)
  const g = 9.81; // Gravity (m/s²)
  const omega = (2 * Math.PI) / wavePeriod;
  const k = (omega * omega) / g; // Wave number (deep water approx)
  
  // Morison equation simplified
  const Cm = 2.0; // Inertia coefficient
  const Cd = 1.2; // Drag coefficient
  
  const u_max = (Math.PI * waveHeight * omega) / (2 * Math.sinh(k * waterDepth));
  
  const inertiaForce = Cm * rho * Math.PI * Math.pow(lineDiameter / 2, 2) * u_max * omega;
  const dragForce = 0.5 * Cd * rho * lineDiameter * Math.pow(u_max, 2);
  
  return inertiaForce + dragForce;
}

/**
 * Calculate wind-induced forces on floating platform
 */
export function calculateWindForce(windSpeed: number, area: number = 100): number {
  const rho = 1.225; // Air density (kg/m³)
  const Cd = 1.0; // Drag coefficient
  
  return 0.5 * Cd * rho * area * Math.pow(windSpeed, 2) / 1000; // kN
}

/**
 * Calculate current-induced forces
 */
export function calculateCurrentForce(currentSpeed: number, area: number = 50): number {
  const rho = 1025; // Water density (kg/m³)
  const Cd = 1.0;
  
  return 0.5 * Cd * rho * area * Math.pow(currentSpeed, 2) / 1000; // kN
}

/**
 * Calculate total environmental load on mooring system
 */
export function calculateTotalLoad(conditions: EnvironmentalConditions): number {
  const waveForce = calculateWaveForce(
    conditions.waveHeight,
    conditions.wavePeriod || 10,
    conditions.waterDepth
  );
  const windForce = calculateWindForce(conditions.windSpeed);
  const currentForce = calculateCurrentForce(conditions.currentSpeed);
  
  // Combined load (simplified vector sum)
  return Math.sqrt(Math.pow(waveForce + currentForce, 2) + Math.pow(windForce, 2));
}

/**
 * Calculate mooring line tension based on environmental loads
 */
export function calculateMooringTension(
  totalLoad: number,
  numLines: number = 6,
  pretension: number = 200 // kN
): MooringState {
  const loadPerLine = totalLoad / numLines;
  const tension = pretension + loadPerLine;
  
  // Calculate angle from vertical (simplified catenary)
  const horizontalLoad = loadPerLine * 0.3;
  const angle = Math.atan2(horizontalLoad, tension) * (180 / Math.PI);
  
  // Calculate displacement
  const stiffness = 500; // kN/m (mooring stiffness)
  const displacement = loadPerLine / stiffness;
  
  // Calculate stress (assuming 100mm diameter line)
  const area = Math.PI * Math.pow(0.05, 2); // m²
  const stress = (tension * 1000) / (area * 1e6); // MPa
  
  // Calculate strain
  const E = 200000; // Young's modulus (MPa) for steel
  const strain = (stress / E) * 1e6; // microstrain
  
  return {
    tension,
    angle,
    displacement,
    stress,
    strain
  };
}

/**
 * Simulate dynamic mooring response over time
 */
export function simulateDynamicResponse(
  conditions: EnvironmentalConditions,
  duration: number = 3600, // seconds
  dt: number = 1 // time step
): MooringState[] {
  const states: MooringState[] = [];
  const totalLoad = calculateTotalLoad(conditions);
  
  for (let t = 0; t < duration; t += dt) {
    // Add dynamic variation (wave cycling)
    const wavePhase = (2 * Math.PI * t) / (conditions.wavePeriod || 10);
    const dynamicFactor = 1 + 0.3 * Math.sin(wavePhase);
    
    const state = calculateMooringTension(totalLoad * dynamicFactor);
    states.push(state);
  }
  
  return states;
}

/**
 * Calculate anchor holding capacity
 */
export function calculateAnchorCapacity(
  anchorType: 'suction' | 'drag' | 'plate',
  soilStrength: number = 50 // kPa
): number {
  let capacity = 0;
  
  switch (anchorType) {
    case 'suction':
      // Suction pile capacity
      capacity = soilStrength * 20; // Simplified
      break;
    case 'drag':
      // Drag embedment anchor
      capacity = soilStrength * 15;
      break;
    case 'plate':
      // Plate anchor
      capacity = soilStrength * 25;
      break;
  }
  
  return capacity; // kN
}

/**
 * Calculate safety factor for mooring system
 */
export function calculateSafetyFactor(
  actualTension: number,
  breakingStrength: number = 5000 // kN
): number {
  return breakingStrength / actualTension;
}

/**
 * Update digital twin state based on AI predictions
 */
export function updateDigitalTwinState(
  currentConditions: EnvironmentalConditions,
  fatigueDamage: number,
  failureProbability: number
): {
  visualState: 'optimal' | 'warning' | 'critical';
  recommendedAction: string;
  estimatedLifeReduction: number;
} {
  const totalLoad = calculateTotalLoad(currentConditions);
  const mooringState = calculateMooringTension(totalLoad);
  const safetyFactor = calculateSafetyFactor(mooringState.tension);
  
  let visualState: 'optimal' | 'warning' | 'critical' = 'optimal';
  let recommendedAction = 'Continue monitoring';
  
  if (failureProbability > 0.6 || safetyFactor < 1.5 || fatigueDamage > 0.75) {
    visualState = 'critical';
    recommendedAction = 'Immediate inspection required. Consider replacement planning.';
  } else if (failureProbability > 0.3 || safetyFactor < 2.0 || fatigueDamage > 0.5) {
    visualState = 'warning';
    recommendedAction = 'Schedule detailed inspection within 30 days.';
  }
  
  // Estimate life reduction due to current conditions
  const severityFactor = totalLoad / 500; // Normalize
  const estimatedLifeReduction = severityFactor * fatigueDamage * 5; // years
  
  return {
    visualState,
    recommendedAction,
    estimatedLifeReduction
  };
}
