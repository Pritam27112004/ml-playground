export interface Point2D {
  x: number;
  y: number;
}

export interface LabeledPoint extends Point2D {
  label: 0 | 1;
}

// Deterministic random number generator for reproducibility
function createRandom(seed: number) {
  let s = seed;
  return () => {
    const x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };
}

export function generateEasyLinear(count = 50): Point2D[] {
  const rand = createRandom(42);
  const m = 0.8;
  const c = -0.5;
  const points: Point2D[] = [];
  for (let i = 0; i < count; i++) {
    // x in [-4, 4]
    const x = -4 + rand() * 8;
    // Low noise
    const noise = (rand() - 0.5) * 0.6;
    const y = m * x + c + noise;
    points.push({ x, y });
  }
  return points.sort((a, b) => a.x - b.x);
}

export function generateNoisyLinear(count = 60): Point2D[] {
  const rand = createRandom(101);
  const m = -0.5;
  const c = 1.0;
  const points: Point2D[] = [];
  for (let i = 0; i < count; i++) {
    const x = -4 + rand() * 8;
    // Higher noise
    const noise = (rand() - 0.5) * 2.8;
    const y = m * x + c + noise;
    points.push({ x, y });
  }
  return points.sort((a, b) => a.x - b.x);
}

export function generateBinaryLinear(count = 60): LabeledPoint[] {
  const rand = createRandom(2023);
  const points: LabeledPoint[] = [];
  // Line: y = x + 0.5
  // Separable classes with margin
  let i = 0;
  while (i < count) {
    const x = -4 + rand() * 8;
    const y = -4 + rand() * 8;
    const dist = y - (x + 0.2);
    
    // We want a clear margin separation
    if (Math.abs(dist) < 0.4) continue;
    
    const label = dist > 0 ? 1 : 0;
    points.push({ x, y, label });
    i++;
  }
  return points;
}

export function generateXOR(count = 70): LabeledPoint[] {
  const rand = createRandom(1337);
  const points: LabeledPoint[] = [];
  let i = 0;
  while (i < count) {
    const x = -4 + rand() * 8;
    const y = -4 + rand() * 8;
    
    // Skip points close to axes to keep a clean visual split
    if (Math.abs(x) < 0.3 || Math.abs(y) < 0.3) continue;
    
    // XOR logic: Q1 & Q3 are label 1, Q2 & Q4 are label 0
    const label = (x * y > 0) ? 1 : 0;
    points.push({ x, y, label });
    i++;
  }
  return points;
}

export function generateCircular(count = 85): LabeledPoint[] {
  const rand = createRandom(777);
  const points: LabeledPoint[] = [];
  let i = 0;
  while (i < count) {
    const x = -4.5 + rand() * 9;
    const y = -4.5 + rand() * 9;
    const rSq = x * x + y * y;
    
    // Ring boundaries: inner circle r < 1.8, outer ring 2.6 < r < 4.2
    if (rSq < 1.8 * 1.8) {
      points.push({ x, y, label: 1 });
      i++;
    } else if (rSq > 2.6 * 2.6 && rSq < 4.2 * 4.2) {
      points.push({ x, y, label: 0 });
      i++;
    }
  }
  return points;
}

export function generateMultiCluster(count = 80): Point2D[] {
  const rand = createRandom(999);
  const points: Point2D[] = [];
  
  // 3 Cluster centers
  const centers = [
    { x: -2.5, y: -2.0 },
    { x: 2.5, y: 2.5 },
    { x: -1.5, y: 2.5 }
  ];
  
  for (let i = 0; i < count; i++) {
    // Pick center
    const center = centers[i % centers.length];
    // Add Gaussian-like noise (Box-Muller approximation)
    const u1 = rand() || 0.0001; // avoid 0
    const u2 = rand();
    const r = Math.sqrt(-2.0 * Math.log(u1)) * 0.7; // standard dev approx 0.7
    const theta = 2.0 * Math.PI * u2;
    
    const x = center.x + r * Math.cos(theta);
    const y = center.y + r * Math.sin(theta);
    points.push({ x, y });
  }
  return points;
}
