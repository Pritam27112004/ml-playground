import type { Point2D } from '../data/datasets';

export interface KMeansState {
  centroids: Point2D[];
  assignments: number[]; // index of closest centroid for each point
  inertia: number; // sum of squared distances to closest centroid
  currentSubStep: 'assign' | 'update' | 'initialized';
  hasConverged: boolean;
}

export function initializeKMeans(points: Point2D[], k = 3): KMeansState {
  // Random initialization: choose k random points from dataset to be initial centroids
  const centroids: Point2D[] = [];
  const n = points.length;
  
  if (n >= k) {
    // Choose unique random points
    const chosenIndices = new Set<number>();
    while (chosenIndices.size < k) {
      chosenIndices.add(Math.floor(Math.random() * n));
    }
    chosenIndices.forEach(idx => {
      centroids.push({ ...points[idx] });
    });
  } else {
    // Fallback: random points in coordinate space
    for (let i = 0; i < k; i++) {
      centroids.push({
        x: (Math.random() - 0.5) * 6,
        y: (Math.random() - 0.5) * 6
      });
    }
  }

  return {
    centroids,
    assignments: Array(n).fill(-1),
    inertia: 0,
    currentSubStep: 'initialized',
    hasConverged: false
  };
}

function getDistanceSq(p1: Point2D, p2: Point2D): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return dx * dx + dy * dy;
}

export function stepKMeans(
  points: Point2D[],
  currentState: KMeansState
): KMeansState {
  const n = points.length;
  const k = currentState.centroids.length;
  if (n === 0) return currentState;

  if (currentState.currentSubStep === 'initialized' || currentState.currentSubStep === 'update') {
    // Perform ASSIGN step: assign each point to the closest centroid
    const nextAssignments = [...currentState.assignments];
    let totalInertia = 0;

    for (let i = 0; i < n; i++) {
      const p = points[i];
      let minDistSq = Infinity;
      let assignedCentroid = 0;

      for (let cIdx = 0; cIdx < k; cIdx++) {
        const distSq = getDistanceSq(p, currentState.centroids[cIdx]);
        if (distSq < minDistSq) {
          minDistSq = distSq;
          assignedCentroid = cIdx;
        }
      }

      nextAssignments[i] = assignedCentroid;
      totalInertia += minDistSq;
    }

    // Check if assignments changed. If they didn't, we are converged!
    let changed = false;
    for (let i = 0; i < n; i++) {
      if (nextAssignments[i] !== currentState.assignments[i]) {
        changed = true;
        break;
      }
    }

    return {
      centroids: currentState.centroids,
      assignments: nextAssignments,
      inertia: totalInertia,
      currentSubStep: 'assign',
      hasConverged: !changed && currentState.currentSubStep !== 'initialized'
    };
  } else {
    // Perform UPDATE step: move centroids to the mean of their assigned points
    const nextCentroids = currentState.centroids.map((centroid, cIdx) => {
      const assignedPoints = points.filter((_, pIdx) => currentState.assignments[pIdx] === cIdx);
      if (assignedPoints.length === 0) {
        // Centroid has no points, keep it where it is
        return { ...centroid };
      }
      
      let sumX = 0;
      let sumY = 0;
      for (const p of assignedPoints) {
        sumX += p.x;
        sumY += p.y;
      }

      return {
        x: sumX / assignedPoints.length,
        y: sumY / assignedPoints.length
      };
    });

    // Check if centroids moved significantly
    let centroidsMoved = false;
    for (let i = 0; i < k; i++) {
      const distSq = getDistanceSq(currentState.centroids[i], nextCentroids[i]);
      if (distSq > 1e-6) {
        centroidsMoved = true;
        break;
      }
    }

    // Recompute inertia with new centroids
    let totalInertia = 0;
    for (let i = 0; i < n; i++) {
      const p = points[i];
      const assignedIdx = currentState.assignments[i];
      totalInertia += getDistanceSq(p, nextCentroids[assignedIdx]);
    }

    return {
      centroids: nextCentroids,
      assignments: currentState.assignments,
      inertia: totalInertia,
      currentSubStep: 'update',
      hasConverged: !centroidsMoved
    };
  }
}
