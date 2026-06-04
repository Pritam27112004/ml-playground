import type { LabeledPoint } from '../data/datasets';

export interface BoundingBox {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface TreeNode {
  id: string;
  name: string; // label for display
  feature?: 'x' | 'y';
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  prediction?: 0 | 1;
  isLeaf: boolean;
  box: BoundingBox;
  pointCount: number;
}

export interface DecisionTreeState {
  root: TreeNode;
  depth: number;
  maxDepth: number;
  loss: number; // Overall Gini impurity of leaves
  accuracy: number;
  currentStep: number; // 0: Root, 1: Split 1, 2: Split 2, 3: Split 3 (fully built)
}

function calculateGini(points: LabeledPoint[]): number {
  if (points.length === 0) return 0;
  const class0 = points.filter(p => p.label === 0).length;
  const p0 = class0 / points.length;
  const p1 = 1 - p0;
  return 1 - (p0 * p0 + p1 * p1);
}

function getMajorityClass(points: LabeledPoint[]): 0 | 1 {
  const class0 = points.filter(p => p.label === 0).length;
  const class1 = points.length - class0;
  return class0 >= class1 ? 0 : 1;
}

// Find best split for a set of points within a bounding box
interface SplitResult {
  feature: 'x' | 'y';
  threshold: number;
  gini: number;
}

function findBestSplit(points: LabeledPoint[]): SplitResult | null {
  if (points.length <= 1) return null;

  let bestGini = 1.0;
  let bestFeature: 'x' | 'y' = 'x';
  let bestThreshold = 0;
  let found = false;

  const features: ('x' | 'y')[] = ['x', 'y'];

  for (const feature of features) {
    // Sort points by feature value
    const sortedVals = points.map(p => p[feature]).sort((a, b) => a - b);
    
    // Test thresholds between adjacent points
    for (let i = 0; i < sortedVals.length - 1; i++) {
      const val1 = sortedVals[i];
      const val2 = sortedVals[i + 1];
      if (val1 === val2) continue;
      const t = (val1 + val2) / 2;

      // Split points
      const leftGroup = points.filter(p => p[feature] < t);
      const rightGroup = points.filter(p => p[feature] >= t);

      if (leftGroup.length === 0 || rightGroup.length === 0) continue;

      const giniLeft = calculateGini(leftGroup);
      const giniRight = calculateGini(rightGroup);
      const weightedGini = (leftGroup.length / points.length) * giniLeft + (rightGroup.length / points.length) * giniRight;

      if (weightedGini < bestGini) {
        bestGini = weightedGini;
        bestFeature = feature;
        bestThreshold = t;
        found = true;
      }
    }
  }

  return found ? { feature: bestFeature, threshold: bestThreshold, gini: bestGini } : null;
}

export function initializeDecisionTree(points: LabeledPoint[]): DecisionTreeState {
  const rootMajority = getMajorityClass(points);
  const rootBox: BoundingBox = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 };
  
  const rootNode: TreeNode = {
    id: 'root',
    name: 'Root Node',
    prediction: rootMajority,
    isLeaf: true,
    box: rootBox,
    pointCount: points.length
  };

  const initialAccuracy = points.filter(p => p.label === rootMajority).length / points.length;

  return {
    root: rootNode,
    depth: 0,
    maxDepth: 2,
    loss: calculateGini(points),
    accuracy: initialAccuracy,
    currentStep: 0
  };
}

// Deep clone a node helper
function cloneTree(node: TreeNode): TreeNode {
  const copy: TreeNode = { ...node };
  if (node.left) copy.left = cloneTree(node.left);
  if (node.right) copy.right = cloneTree(node.right);
  return copy;
}

// Predict function for a point through the tree
export function predictTree(node: TreeNode, p: { x: number; y: number }): 0 | 1 {
  if (node.isLeaf) {
    return node.prediction ?? 0;
  }
  
  const feature = node.feature!;
  const threshold = node.threshold!;
  const val = feature === 'x' ? p.x : p.y;
  
  if (val < threshold) {
    return node.left ? predictTree(node.left, p) : (node.prediction ?? 0);
  } else {
    return node.right ? predictTree(node.right, p) : (node.prediction ?? 0);
  }
}

// Get all leaf nodes and their bounding boxes
export function getTreeLeaves(node: TreeNode): TreeNode[] {
  if (node.isLeaf) {
    return [node];
  }
  const leaves: TreeNode[] = [];
  if (node.left) leaves.push(...getTreeLeaves(node.left));
  if (node.right) leaves.push(...getTreeLeaves(node.right));
  return leaves;
}

export function stepDecisionTree(
  points: LabeledPoint[],
  currentState: DecisionTreeState
): DecisionTreeState {
  const step = currentState.currentStep;
  if (step >= 3) return currentState; // fully built at step 3

  const newRoot = cloneTree(currentState.root);

  if (step === 0) {
    // Step 0 -> 1: Split the root node
    const bestSplit = findBestSplit(points);
    if (bestSplit) {
      newRoot.isLeaf = false;
      newRoot.feature = bestSplit.feature;
      newRoot.threshold = bestSplit.threshold;
      
      const leftPoints = points.filter(p => p[bestSplit.feature] < bestSplit.threshold);
      const rightPoints = points.filter(p => p[bestSplit.feature] >= bestSplit.threshold);

      newRoot.left = {
        id: 'left',
        name: `Node X${bestSplit.feature === 'x' ? '1' : '2'} < ${bestSplit.threshold.toFixed(2)}`,
        prediction: getMajorityClass(leftPoints),
        isLeaf: true,
        box: {
          ...newRoot.box,
          xMax: bestSplit.feature === 'x' ? bestSplit.threshold : newRoot.box.xMax,
          yMax: bestSplit.feature === 'y' ? bestSplit.threshold : newRoot.box.yMax,
        },
        pointCount: leftPoints.length
      };

      newRoot.right = {
        id: 'right',
        name: `Node X${bestSplit.feature === 'x' ? '1' : '2'} ≥ ${bestSplit.threshold.toFixed(2)}`,
        prediction: getMajorityClass(rightPoints),
        isLeaf: true,
        box: {
          ...newRoot.box,
          xMin: bestSplit.feature === 'x' ? bestSplit.threshold : newRoot.box.xMin,
          yMin: bestSplit.feature === 'y' ? bestSplit.threshold : newRoot.box.yMin,
        },
        pointCount: rightPoints.length
      };
    }
  } else if (step === 1) {
    // Step 1 -> 2: Split the left child
    if (newRoot.left && !newRoot.left.isLeaf) {
      // shouldn't happen, let's safeguard
    } else if (newRoot.left && newRoot.feature && newRoot.threshold !== undefined) {
      const f = newRoot.feature;
      const t = newRoot.threshold;
      
      // Points in left node
      const leftPoints = points.filter(p => p[f] < t);
      const split = findBestSplit(leftPoints);
      
      if (split) {
        newRoot.left.isLeaf = false;
        newRoot.left.feature = split.feature;
        newRoot.left.threshold = split.threshold;
        
        const subLeft = leftPoints.filter(p => p[split.feature] < split.threshold);
        const subRight = leftPoints.filter(p => p[split.feature] >= split.threshold);

        newRoot.left.left = {
          id: 'left_left',
          name: `L-Left Split`,
          prediction: getMajorityClass(subLeft),
          isLeaf: true,
          box: {
            ...newRoot.left.box,
            xMax: split.feature === 'x' ? split.threshold : newRoot.left.box.xMax,
            yMax: split.feature === 'y' ? split.threshold : newRoot.left.box.yMax,
          },
          pointCount: subLeft.length
        };

        newRoot.left.right = {
          id: 'left_right',
          name: `L-Right Split`,
          prediction: getMajorityClass(subRight),
          isLeaf: true,
          box: {
            ...newRoot.left.box,
            xMin: split.feature === 'x' ? split.threshold : newRoot.left.box.xMin,
            yMin: split.feature === 'y' ? split.threshold : newRoot.left.box.yMin,
          },
          pointCount: subRight.length
        };
      }
    }
  } else if (step === 2) {
    // Step 2 -> 3: Split the right child
    if (newRoot.right && newRoot.feature && newRoot.threshold !== undefined) {
      const f = newRoot.feature;
      const t = newRoot.threshold;

      // Points in right node
      const rightPoints = points.filter(p => p[f] >= t);
      const split = findBestSplit(rightPoints);

      if (split) {
        newRoot.right.isLeaf = false;
        newRoot.right.feature = split.feature;
        newRoot.right.threshold = split.threshold;

        const subLeft = rightPoints.filter(p => p[split.feature] < split.threshold);
        const subRight = rightPoints.filter(p => p[split.feature] >= split.threshold);

        newRoot.right.left = {
          id: 'right_left',
          name: `R-Left Split`,
          prediction: getMajorityClass(subLeft),
          isLeaf: true,
          box: {
            ...newRoot.right.box,
            xMax: split.feature === 'x' ? split.threshold : newRoot.right.box.xMax,
            yMax: split.feature === 'y' ? split.threshold : newRoot.right.box.yMax,
          },
          pointCount: subLeft.length
        };

        newRoot.right.right = {
          id: 'right_right',
          name: `R-Right Split`,
          prediction: getMajorityClass(subRight),
          isLeaf: true,
          box: {
            ...newRoot.right.box,
            xMin: split.feature === 'x' ? split.threshold : newRoot.right.box.xMin,
            yMin: split.feature === 'y' ? split.threshold : newRoot.right.box.yMin,
          },
          pointCount: subRight.length
        };
      }
    }
  }

  // Calculate new metrics
  const leaves = getTreeLeaves(newRoot);
  
  // Total impurity is weighted Gini impurity across leaves
  let totalImpurity = 0;
  let correctPredictions = 0;

  for (const leaf of leaves) {
    const leafPoints = points.filter(p => {
      return p.x >= leaf.box.xMin && p.x <= leaf.box.xMax &&
             p.y >= leaf.box.yMin && p.y <= leaf.box.yMax;
    });

    const leafGini = calculateGini(leafPoints);
    totalImpurity += (leafPoints.length / points.length) * leafGini;

    const pred = leaf.prediction!;
    correctPredictions += leafPoints.filter(p => p.label === pred).length;
  }

  const accuracy = correctPredictions / points.length;

  return {
    root: newRoot,
    depth: step + 1,
    maxDepth: 2,
    loss: totalImpurity,
    accuracy,
    currentStep: step + 1
  };
}
