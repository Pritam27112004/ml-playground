import type { LabeledPoint } from '../data/datasets';

export interface LogisticRegressionState {
  w1: number;
  w2: number;
  bias: number;
  loss: number;
  accuracy: number;
}

export function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, z))));
}

export function initializeLogisticRegression(): LogisticRegressionState {
  // Random small weights
  return {
    w1: (Math.random() - 0.5) * 2,
    w2: (Math.random() - 0.5) * 2,
    bias: (Math.random() - 0.5) * 1,
    loss: 0,
    accuracy: 0
  };
}

export function stepLogisticRegression(
  points: LabeledPoint[],
  currentState: LogisticRegressionState,
  learningRate: number
): LogisticRegressionState {
  const n = points.length;
  if (n === 0) return currentState;

  let dw1 = 0;
  let dw2 = 0;
  let dbias = 0;
  let totalLoss = 0;
  let correctCount = 0;

  for (const p of points) {
    const z = currentState.w1 * p.x + currentState.w2 * p.y + currentState.bias;
    const yPred = sigmoid(z);
    
    // Gradient terms
    const diff = yPred - p.label;
    dw1 += diff * p.x;
    dw2 += diff * p.y;
    dbias += diff;

    // Binary cross-entropy loss (clamped to prevent log(0))
    const clampedPred = Math.max(1e-15, Math.min(1 - 1e-15, yPred));
    const lossTerm = p.label * Math.log(clampedPred) + (1 - p.label) * Math.log(1 - clampedPred);
    totalLoss += -lossTerm;

    // Accuracy checking
    const predClass = yPred >= 0.5 ? 1 : 0;
    if (predClass === p.label) {
      correctCount++;
    }
  }

  // Average gradients & loss
  dw1 = dw1 / n;
  dw2 = dw2 / n;
  dbias = dbias / n;
  const loss = totalLoss / n;
  const accuracy = correctCount / n;

  // Gradient updates
  const nextW1 = currentState.w1 - learningRate * dw1;
  const nextW2 = currentState.w2 - learningRate * dw2;
  const nextBias = currentState.bias - learningRate * dbias;

  return {
    w1: nextW1,
    w2: nextW2,
    bias: nextBias,
    loss,
    accuracy
  };
}
