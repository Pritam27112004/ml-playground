import type { Point2D } from '../data/datasets';

export interface LinearRegressionState {
  slope: number;
  intercept: number;
  loss: number;
  residuals: { start: Point2D; end: Point2D }[];
}

export function initializeLinearRegression(): LinearRegressionState {
  // Random starting slope and intercept in [-1.5, 1.5]
  const slope = (Math.random() - 0.5) * 3;
  const intercept = (Math.random() - 0.5) * 2;
  return {
    slope,
    intercept,
    loss: 0,
    residuals: []
  };
}

export function stepLinearRegression(
  points: Point2D[],
  currentState: LinearRegressionState,
  learningRate: number
): LinearRegressionState {
  const n = points.length;
  if (n === 0) return currentState;

  let slopeGrad = 0;
  let interceptGrad = 0;
  let totalErrorSq = 0;
  const residuals: { start: Point2D; end: Point2D }[] = [];

  for (const p of points) {
    const yPred = currentState.slope * p.x + currentState.intercept;
    const diff = yPred - p.y;
    
    slopeGrad += diff * p.x;
    interceptGrad += diff;
    totalErrorSq += diff * diff;

    // Save residual line segments for visualization
    residuals.push({
      start: p,
      end: { x: p.x, y: yPred }
    });
  }

  // Average gradients and MSE loss
  slopeGrad = slopeGrad / n;
  interceptGrad = interceptGrad / n;
  const loss = totalErrorSq / (2 * n);

  // Gradient descent update
  const nextSlope = currentState.slope - learningRate * slopeGrad;
  const nextIntercept = currentState.intercept - learningRate * interceptGrad;

  return {
    slope: nextSlope,
    intercept: nextIntercept,
    loss,
    residuals
  };
}
