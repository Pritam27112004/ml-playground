import { useEffect } from 'react';
import { usePlaygroundStore } from './store/usePlaygroundStore';
import { NotebookLayout } from './components/layout/NotebookLayout';
import { PlotCanvas } from './components/shared/PlotCanvas';
import { ControlPanel } from './components/controls/ControlPanel';
import { LossGraph } from './components/shared/LossGraph';
import { EducationalPanel } from './components/shared/EducationalPanel';

function App() {
  const { runState, speed, step, selectedAlgorithm, resetModel } = usePlaygroundStore();

  // Initialize model on first load
  useEffect(() => {
    resetModel();
  }, [selectedAlgorithm]);

  // Main animation / training loop
  useEffect(() => {
    if (runState !== 'running') return;

    const delay = speed === 'slow' ? 1000 : speed === 'medium' ? 300 : 45;
    const timer = setInterval(() => {
      step();
    }, delay);

    return () => clearInterval(timer);
  }, [runState, speed, step]);

  const getAlgorithmTitle = () => {
    switch (selectedAlgorithm) {
      case 'linear-regression':
        return 'Linear Regression';
      case 'logistic-regression':
        return 'Logistic Regression';
      case 'svm':
        return 'Support Vector Machine (SVM)';
      case 'decision-tree':
        return 'Decision Tree Classifier';
      case 'kmeans':
        return 'K-Means Clustering';
    }
  };

  const getAlgorithmDescription = () => {
    switch (selectedAlgorithm) {
      case 'linear-regression':
        return 'Fits a straight line to data points. Watch gradient descent minimize the squared distance residuals live!';
      case 'logistic-regression':
        return 'Creates a smooth linear boundary mapping classes to probabilities. Watch the decision line rotate and shift to separate classes.';
      case 'svm':
        return 'Maximizes the margin thickness between classes. Watch support vectors (anchors) lock into place and define the boundary.';
      case 'decision-tree':
        return 'Partitions space into orthogonal grid splits. Watch the tree grow branch-by-branch, carving out decision rectangles.';
      case 'kmeans':
        return 'Clusters unlabeled points by distance. Watch centroids initialize randomly, assign dots, slide to means, and repeat.';
    }
  };

  return (
    <NotebookLayout>
      <div className="flex flex-col gap-6">
        {/* Top Algorithm Overview Section */}
        <section className="border-b-2 border-dashed border-gray-200 pb-4 mb-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold font-handwritten text-gray-800 flex items-center gap-2">
                <span>📖 Study Topic: {getAlgorithmTitle()}</span>
              </h2>
              <p className="text-gray-600 mt-1.5 text-sm md:text-base leading-relaxed">
                {getAlgorithmDescription()}
              </p>
            </div>
            
            {/* Quick Math Equation Note */}
            <div className="hidden sm:block shrink-0 bg-yellow-50 border border-yellow-200 p-2.5 rounded shadow-sm text-[11px] font-handwritten text-gray-500 max-w-[200px] leading-tight rotate-1">
              <span className="font-bold text-pen-blue">Math Formula:</span>
              <div className="mt-1 font-mono">
                {selectedAlgorithm === 'linear-regression' && 'y = w • x + b'}
                {selectedAlgorithm === 'logistic-regression' && 'p = σ(wᵀx + b)'}
                {selectedAlgorithm === 'svm' && 'min 0.5||w||² + C∑ξ'}
                {selectedAlgorithm === 'decision-tree' && 'Gini = 1 - ∑(pᵢ)²'}
                {selectedAlgorithm === 'kmeans' && 'J = ∑||xᵢ - cⱼ||²'}
              </div>
            </div>
          </div>
        </section>

        {/* Universal Visualization Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Plot Canvas & Live Loss Graph */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Main Visual Plot */}
            <div className="notebook-card p-4 bg-white relative">
              <div className="absolute top-2 left-6 z-10 font-handwritten font-bold text-pen-blue text-sm">
                📝 Figure 1: Model Feature Space
              </div>
              <div className="mt-6">
                <PlotCanvas />
              </div>
            </div>

            {/* Live Loss / Inertia Curve Graph */}
            <LossGraph />
          </div>

          {/* Right Column: Interactive Sim Controls */}
          <div className="lg:col-span-5">
            <ControlPanel />
          </div>
        </div>

        {/* Bottom Column: In-depth Educational Explanations */}
        <EducationalPanel />
      </div>
    </NotebookLayout>
  );
}

export default App;
