import { create } from 'zustand';
import type { Point2D, LabeledPoint } from '../data/datasets';
import {
  generateEasyLinear,
  generateNoisyLinear,
  generateBinaryLinear,
  generateXOR,
  generateCircular,
  generateMultiCluster
} from '../data/datasets';

import type { LinearRegressionState } from '../algorithms/linearRegression';
import {
  initializeLinearRegression,
  stepLinearRegression
} from '../algorithms/linearRegression';

import type { LogisticRegressionState } from '../algorithms/logisticRegression';
import {
  initializeLogisticRegression,
  stepLogisticRegression
} from '../algorithms/logisticRegression';

import type { SVMState } from '../algorithms/svm';
import {
  initializeSVM,
  stepSVM
} from '../algorithms/svm';

import type { DecisionTreeState } from '../algorithms/decisionTree';
import {
  initializeDecisionTree,
  stepDecisionTree
} from '../algorithms/decisionTree';

import type { KMeansState } from '../algorithms/kmeans';
import {
  initializeKMeans,
  stepKMeans
} from '../algorithms/kmeans';

export type AlgorithmType =
  | 'linear-regression'
  | 'logistic-regression'
  | 'svm'
  | 'decision-tree'
  | 'kmeans';

export type DatasetType =
  | 'easy-linear'
  | 'noisy-linear'
  | 'easy-separable'
  | 'xor'
  | 'circular'
  | 'multi-cluster';

export interface PlaygroundState {
  selectedAlgorithm: AlgorithmType;
  datasetType: DatasetType;
  points: Point2D[] | LabeledPoint[];
  learningRate: number;
  runState: 'idle' | 'running' | 'paused' | 'completed';
  speed: 'slow' | 'medium' | 'fast';
  epoch: number;
  maxEpochs: number;
  
  // Metrics History
  lossHistory: number[];
  accuracyHistory: number[];
  inertiaHistory: number[];

  // Algorithm Specific States
  linearRegressionState: LinearRegressionState;
  logisticRegressionState: LogisticRegressionState;
  svmState: SVMState;
  decisionTreeState: DecisionTreeState;
  kmeansState: KMeansState;

  // Actions
  setAlgorithm: (algo: AlgorithmType) => void;
  setDatasetType: (type: DatasetType) => void;
  setLearningRate: (lr: number) => void;
  setSpeed: (speed: 'slow' | 'medium' | 'fast') => void;
  setRunState: (state: 'idle' | 'running' | 'paused' | 'completed') => void;
  resetModel: () => void;
  step: () => void;
}

const getDatasetForAlgorithm = (algo: AlgorithmType, datasetType: DatasetType) => {
  switch (algo) {
    case 'linear-regression':
      return datasetType === 'noisy-linear' ? generateNoisyLinear() : generateEasyLinear();
    case 'logistic-regression':
    case 'svm':
    case 'decision-tree':
      if (datasetType === 'xor') return generateXOR();
      if (datasetType === 'circular') return generateCircular();
      return generateBinaryLinear();
    case 'kmeans':
      return generateMultiCluster();
  }
};

const getDefaultDatasetType = (algo: AlgorithmType): DatasetType => {
  switch (algo) {
    case 'linear-regression':
      return 'easy-linear';
    case 'logistic-regression':
    case 'svm':
      return 'easy-separable';
    case 'decision-tree':
      return 'xor';
    case 'kmeans':
      return 'multi-cluster';
  }
};

export const usePlaygroundStore = create<PlaygroundState>((set, get) => {
  // Helpers to initialize algorithm states
  const initialPoints = getDatasetForAlgorithm('linear-regression', 'easy-linear');
  const initialLRState = initializeLinearRegression();

  return {
    selectedAlgorithm: 'linear-regression',
    datasetType: 'easy-linear',
    points: initialPoints,
    learningRate: 0.03,
    runState: 'idle',
    speed: 'medium',
    epoch: 0,
    maxEpochs: 100,

    lossHistory: [],
    accuracyHistory: [],
    inertiaHistory: [],

    // Initially populated with empty/dummy objects but overwritten on reset
    linearRegressionState: initialLRState,
    logisticRegressionState: initializeLogisticRegression(),
    svmState: initializeSVM(),
    decisionTreeState: initializeDecisionTree([]),
    kmeansState: initializeKMeans([]),

    setAlgorithm: (algo) => {
      const defaultData = getDefaultDatasetType(algo);
      const points = getDatasetForAlgorithm(algo, defaultData);
      
      let maxEpochs = 100;
      let learningRate = 0.03;
      if (algo === 'kmeans') {
        maxEpochs = 20; // converges fast
      } else if (algo === 'decision-tree') {
        maxEpochs = 3; // depth limits splits to 3 iterations
      } else if (algo === 'svm') {
        learningRate = 0.05;
      }

      set({
        selectedAlgorithm: algo,
        datasetType: defaultData,
        points,
        epoch: 0,
        maxEpochs,
        learningRate,
        runState: 'idle',
        lossHistory: [],
        accuracyHistory: [],
        inertiaHistory: []
      });
      get().resetModel();
    },

    setDatasetType: (type) => {
      const { selectedAlgorithm } = get();
      const points = getDatasetForAlgorithm(selectedAlgorithm, type);
      set({
        datasetType: type,
        points,
        epoch: 0,
        runState: 'idle',
        lossHistory: [],
        accuracyHistory: [],
        inertiaHistory: []
      });
      get().resetModel();
    },

    setLearningRate: (lr) => set({ learningRate: lr }),
    setSpeed: (speed) => set({ speed }),
    setRunState: (state) => set({ runState: state }),

    resetModel: () => {
      const { points } = get();
      const lrState = initializeLinearRegression();
      const logState = initializeLogisticRegression();
      const svmState = initializeSVM();
      const dtState = initializeDecisionTree(points as LabeledPoint[]);
      const kmState = initializeKMeans(points as Point2D[]);

      set({
        epoch: 0,
        runState: 'idle',
        lossHistory: [],
        accuracyHistory: [],
        inertiaHistory: [],
        linearRegressionState: {
          ...lrState,
          residuals: points.map(p => ({
            start: p,
            end: { x: p.x, y: lrState.slope * p.x + lrState.intercept }
          }))
        },
        logisticRegressionState: logState,
        svmState: svmState,
        decisionTreeState: dtState,
        kmeansState: kmState
      });
    },

    step: () => {
      const state = get();
      const {
        selectedAlgorithm,
        points,
        learningRate,
        epoch,
        maxEpochs,
        lossHistory,
        accuracyHistory,
        inertiaHistory
      } = state;

      if (epoch >= maxEpochs) {
        set({ runState: 'completed' });
        return;
      }

      const nextEpoch = epoch + 1;

      switch (selectedAlgorithm) {
        case 'linear-regression': {
          const nextLRState = stepLinearRegression(
            points as Point2D[],
            state.linearRegressionState,
            learningRate
          );
          set({
            linearRegressionState: nextLRState,
            lossHistory: [...lossHistory, nextLRState.loss],
            epoch: nextEpoch,
            runState: nextEpoch >= maxEpochs ? 'completed' : state.runState
          });
          break;
        }
        case 'logistic-regression': {
          const nextLogState = stepLogisticRegression(
            points as LabeledPoint[],
            state.logisticRegressionState,
            learningRate
          );
          set({
            logisticRegressionState: nextLogState,
            lossHistory: [...lossHistory, nextLogState.loss],
            accuracyHistory: [...accuracyHistory, nextLogState.accuracy],
            epoch: nextEpoch,
            runState: nextEpoch >= maxEpochs ? 'completed' : state.runState
          });
          break;
        }
        case 'svm': {
          const nextSVMState = stepSVM(
            points as LabeledPoint[],
            state.svmState,
            learningRate
          );
          set({
            svmState: nextSVMState,
            lossHistory: [...lossHistory, nextSVMState.loss],
            accuracyHistory: [...accuracyHistory, nextSVMState.accuracy],
            epoch: nextEpoch,
            runState: nextEpoch >= maxEpochs ? 'completed' : state.runState
          });
          break;
        }
        case 'decision-tree': {
          const nextDTState = stepDecisionTree(
            points as LabeledPoint[],
            state.decisionTreeState
          );
          set({
            decisionTreeState: nextDTState,
            lossHistory: [...lossHistory, nextDTState.loss],
            accuracyHistory: [...accuracyHistory, nextDTState.accuracy],
            epoch: nextEpoch,
            runState: nextEpoch >= maxEpochs ? 'completed' : state.runState
          });
          break;
        }
        case 'kmeans': {
          const nextKMState = stepKMeans(
            points as Point2D[],
            state.kmeansState
          );
          set({
            kmeansState: nextKMState,
            inertiaHistory: [...inertiaHistory, nextKMState.inertia],
            epoch: nextEpoch,
            runState: (nextEpoch >= maxEpochs || nextKMState.hasConverged) ? 'completed' : state.runState
          });
          break;
        }
      }
    }
  };
});
