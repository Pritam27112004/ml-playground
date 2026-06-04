import type { LabeledPoint } from '../data/datasets';

export interface SVMState {
  w1: number;
  w2: number;
  bias: number;
  loss: number;
  accuracy: number;
  supportVectorIndices: number[];
}

export function initializeSVM(): SVMState {
  return {
    w1: (Math.random() - 0.5) * 2,
    w2: (Math.random() - 0.5) * 2,
    bias: (Math.random() - 0.5) * 1,
    loss: 0,
    accuracy: 0,
    supportVectorIndices: []
  };
}

export function stepSVM(
  points: LabeledPoint[],
  currentState: SVMState,
  learningRate: number,
  lambda = 0.08 // L2 Regularization parameter
): SVMState {
  const n = points.length;
  if (n === 0) return currentState;

  let dw1 = lambda * currentState.w1;
  let dw2 = lambda * currentState.w2;
  let dbias = 0;
  
  let totalHingeLoss = 0;
  let correctCount = 0;
  const supportVectorIndices: number[] = [];

  for (let i = 0; i < n; i++) {
    const p = points[i];
    // Map label 0 -> -1, 1 -> +1
    const yVal = p.label === 1 ? 1 : -1;
    const score = currentState.w1 * p.x + currentState.w2 * p.y + currentState.bias;
    const margin = yVal * score;

    // Hinge loss: max(0, 1 - margin)
    const lossVal = Math.max(0, 1 - margin);
    totalHingeLoss += lossVal;

    // If point violates or lies on the margin boundary, it's a support vector (or active constraint)
    if (margin <= 1.05) {
      supportVectorIndices.push(i);
      
      // Gradient contribution from hinge loss
      dw1 -= (yVal * p.x) / n;
      dw2 -= (yVal * p.y) / n;
      dbias -= yVal / n;
    }

    // Prediction accuracy
    const predClass = score >= 0 ? 1 : 0;
    if (predClass === p.label) {
      correctCount++;
    }
  }

  // Regularization term added to total loss
  const l2NormSq = currentState.w1 * currentState.w1 + currentState.w2 * currentState.w2;
  const loss = (0.5 * lambda * l2NormSq) + (totalHingeLoss / n);
  const accuracy = correctCount / n;

  // Subgradient descent step
  const nextW1 = currentState.w1 - learningRate * dw1;
  const nextW2 = currentState.w2 - learningRate * dw2;
  const nextBias = currentState.bias - learningRate * dbias;

  return {
    w1: nextW1,
    w2: nextW2,
    bias: nextBias,
    loss,
    accuracy,
    supportVectorIndices
  };
}
