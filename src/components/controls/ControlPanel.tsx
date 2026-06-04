import React from 'react';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import type { DatasetType } from '../../store/usePlaygroundStore';
import { Play, Pause, ArrowRight, RefreshCw } from 'lucide-react';

export const ControlPanel: React.FC = () => {
  const {
    selectedAlgorithm,
    datasetType,
    setDatasetType,
    learningRate,
    setLearningRate,
    runState,
    setRunState,
    speed,
    setSpeed,
    epoch,
    maxEpochs,
    resetModel,
    step,
    points,
    linearRegressionState,
    logisticRegressionState,
    svmState,
    decisionTreeState,
    kmeansState
  } = usePlaygroundStore();

  const handlePlayPause = () => {
    if (runState === 'running') {
      setRunState('paused');
    } else {
      setRunState('running');
    }
  };

  const isTrainableLR = ['linear-regression', 'logistic-regression', 'svm'].includes(selectedAlgorithm);

  // Available datasets for each algorithm
  const renderDatasetSelector = () => {
    let datasets: { id: DatasetType; label: string }[] = [];
    
    if (selectedAlgorithm === 'linear-regression') {
      datasets = [
        { id: 'easy-linear', label: '✏️ Easy Linear' },
        { id: 'noisy-linear', label: '✏️ Noisy Linear' }
      ];
    } else if (['logistic-regression', 'svm', 'decision-tree'].includes(selectedAlgorithm)) {
      datasets = [
        { id: 'easy-separable', label: '✏️ Easy Separable' },
        { id: 'xor', label: '✏️ XOR Pattern' },
        { id: 'circular', label: '✏️ Concentric Rings' }
      ];
    } else if (selectedAlgorithm === 'kmeans') {
      datasets = [
        { id: 'multi-cluster', label: '✏️ Three Clusters' }
      ];
    }

    if (datasets.length <= 1) return null;

    return (
      <div className="mb-6">
        <h4 className="font-handwritten font-bold text-gray-700 text-sm mb-2">Select Dataset:</h4>
        <div className="flex flex-wrap gap-2">
          {datasets.map((ds) => (
            <button
              key={ds.id}
              onClick={() => setDatasetType(ds.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md border-2 transition-all ${
                datasetType === ds.id
                  ? 'bg-pen-blue border-pen-blue text-white shadow-sm'
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {ds.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Render parameter readouts
  const renderLiveParameters = () => {
    return (
      <div className="p-4 bg-yellow-50/70 border-2 border-dashed border-yellow-300 rounded-lg font-handwritten text-gray-700 text-sm">
        <h4 className="font-bold text-pen-orange mb-2 text-base">📋 Model Readout:</h4>
        
        <div className="space-y-1.5 text-sm">
          <div>
            <span className="font-bold">Iteration:</span> {epoch} / {maxEpochs}
          </div>

          {selectedAlgorithm === 'linear-regression' && (
            <>
              <div>
                <span className="font-bold text-pen-blue">Slope (w):</span>{' '}
                {linearRegressionState.slope.toFixed(4)}
              </div>
              <div>
                <span className="font-bold text-pen-blue">Intercept (b):</span>{' '}
                {linearRegressionState.intercept.toFixed(4)}
              </div>
              <div>
                <span className="font-bold text-pen-red">Current Loss (MSE):</span>{' '}
                {linearRegressionState.loss.toFixed(6)}
              </div>
            </>
          )}

          {selectedAlgorithm === 'logistic-regression' && (
            <>
              <div>
                <span className="font-bold text-pen-blue">Weight 1 (w1):</span>{' '}
                {logisticRegressionState.w1.toFixed(4)}
              </div>
              <div>
                <span className="font-bold text-pen-blue">Weight 2 (w2):</span>{' '}
                {logisticRegressionState.w2.toFixed(4)}
              </div>
              <div>
                <span className="font-bold text-pen-blue">Bias (b):</span>{' '}
                {logisticRegressionState.bias.toFixed(4)}
              </div>
              <div>
                <span className="font-bold text-pen-red">BCE Loss:</span>{' '}
                {logisticRegressionState.loss.toFixed(6)}
              </div>
              <div>
                <span className="font-bold text-pen-green">Training Accuracy:</span>{' '}
                {(logisticRegressionState.accuracy * 100).toFixed(1)}%
              </div>
            </>
          )}

          {selectedAlgorithm === 'svm' && (
            <>
              <div>
                <span className="font-bold text-pen-blue">Weight 1 (w1):</span> {svmState.w1.toFixed(4)}
              </div>
              <div>
                <span className="font-bold text-pen-blue">Weight 2 (w2):</span> {svmState.w2.toFixed(4)}
              </div>
              <div>
                <span className="font-bold text-pen-blue">Bias (b):</span> {svmState.bias.toFixed(4)}
              </div>
              <div>
                <span className="font-bold text-pen-red">Hinge Loss + L2:</span>{' '}
                {svmState.loss.toFixed(6)}
              </div>
              <div>
                <span className="font-bold text-pen-green">Training Accuracy:</span>{' '}
                {(svmState.accuracy * 100).toFixed(1)}%
              </div>
              <div>
                <span className="font-bold text-pen-orange">Support Vectors:</span>{' '}
                {svmState.supportVectorIndices.length} / {points.length}
              </div>
            </>
          )}

          {selectedAlgorithm === 'decision-tree' && (
            <>
              <div>
                <span className="font-bold text-pen-blue">Splits Formed:</span>{' '}
                {decisionTreeState.currentStep}
              </div>
              <div>
                <span className="font-bold text-pen-red">Weighted Gini Impurity:</span>{' '}
                {decisionTreeState.loss.toFixed(6)}
              </div>
              <div>
                <span className="font-bold text-pen-green">Training Accuracy:</span>{' '}
                {(decisionTreeState.accuracy * 100).toFixed(1)}%
              </div>
              <div className="text-[12px] text-gray-500 leading-tight mt-1.5">
                * Decision Tree grows node-by-node. Click "Next Step" to watch splits form.
              </div>
            </>
          )}

          {selectedAlgorithm === 'kmeans' && (
            <>
              <div>
                <span className="font-bold text-pen-blue">Substep Action:</span>{' '}
                <span className="capitalize text-pen-green font-extrabold">
                  {kmeansState.currentSubStep === 'initialized'
                    ? 'Initialized'
                    : kmeansState.currentSubStep === 'assign'
                    ? 'Assigned points to centroids'
                    : 'Moved centroids to means'}
                </span>
              </div>
              <div>
                <span className="font-bold text-pen-purple">Inertia (WCSS):</span>{' '}
                {kmeansState.inertia.toFixed(2)}
              </div>
              <div>
                <span className="font-bold text-gray-600">Centroids:</span>
                <ul className="list-disc pl-4 text-xs font-sans mt-0.5 space-y-0.5">
                  {kmeansState.centroids.map((c, i) => (
                    <li key={i}>
                      C{i + 1}: ({c.x.toFixed(2)}, {c.y.toFixed(2)})
                    </li>
                  ))}
                </ul>
              </div>
              {kmeansState.hasConverged && (
                <div className="mt-2 text-pen-green font-bold text-xs bg-green-50 border border-green-200 p-1.5 rounded text-center animate-bounce">
                  🎉 Centroids have converged!
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="notebook-card p-6 bg-white flex flex-col justify-between h-full select-none">
      <div>
        <h3 className="font-handwritten text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-100 flex justify-between items-center">
          <span>Controls</span>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-sans font-normal uppercase">
            {runState}
          </span>
        </h3>

        {/* Dataset Selection */}
        {renderDatasetSelector()}

        {/* 1. Learning Rate Control */}
        {isTrainableLR && (
          <div className="mb-5">
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-handwritten font-bold text-gray-700 text-sm">
                Learning Rate (α):
              </label>
              <span className="text-xs font-mono font-bold text-pen-blue bg-blue-50 px-2 py-0.5 rounded">
                {learningRate}
              </span>
            </div>
            <input
              type="range"
              min="0.005"
              max="0.3"
              step="0.005"
              value={learningRate}
              onChange={(e) => setLearningRate(parseFloat(e.target.value))}
              disabled={runState === 'running'}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pen-blue disabled:opacity-50"
            />
            <span className="text-[10px] text-gray-400 font-sans mt-1 block leading-tight">
              Higher α trains faster but might overshoot. Lower α is more stable.
            </span>
          </div>
        )}

        {/* 2. Simulation Speed Control */}
        <div className="mb-6">
          <h4 className="font-handwritten font-bold text-gray-700 text-sm mb-2">Training Speed:</h4>
          <div className="grid grid-cols-3 gap-2">
            {(['slow', 'medium', 'fast'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`py-1 text-xs font-medium rounded border-2 transition-all ${
                  speed === s
                    ? 'bg-gray-800 border-gray-800 text-white font-bold'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="capitalize">{s}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Main Action Buttons */}
        <div className="space-y-3 mb-6">
          <div className="flex gap-3">
            {/* Play/Pause */}
            <button
              onClick={handlePlayPause}
              disabled={runState === 'completed'}
              className={`flex-1 notebook-btn py-3 font-semibold text-sm flex items-center justify-center gap-2 ${
                runState === 'running'
                  ? 'bg-yellow-500 border-yellow-500 hover:bg-yellow-600 text-white'
                  : 'bg-pen-blue border-pen-blue text-white hover:bg-blue-700 disabled:opacity-50'
              }`}
            >
              {runState === 'running' ? (
                <>
                  <Pause size={16} /> Pause Training
                </>
              ) : (
                <>
                  <Play size={16} /> Play Training
                </>
              )}
            </button>

            {/* Step next */}
            <button
              onClick={step}
              disabled={runState === 'running' || runState === 'completed'}
              className="px-4 py-3 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-800 rounded-md notebook-btn disabled:opacity-40 flex items-center justify-center"
              title="Step One Iteration"
            >
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Reset button */}
          <button
            onClick={resetModel}
            className="w-full py-2 bg-white hover:bg-red-50 hover:text-red-600 text-gray-600 border border-gray-300 rounded font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <RefreshCw size={12} />
            Reset Parameters
          </button>
        </div>
      </div>

      {/* 4. Live Readouts */}
      {renderLiveParameters()}
    </div>
  );
};
