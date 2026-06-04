import React, { useMemo } from 'react';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import type { LabeledPoint } from '../../data/datasets';
import { predictTree } from '../../algorithms/decisionTree';
import { sigmoid } from '../../algorithms/logisticRegression';

export const PlotCanvas: React.FC = () => {
  const {
    selectedAlgorithm,
    points,
    linearRegressionState,
    logisticRegressionState,
    svmState,
    decisionTreeState,
    kmeansState
  } = usePlaygroundStore();

  const width = 450;
  const height = 450;
  const padding = 35;
  const plotWidth = width - 2 * padding;
  const plotHeight = height - 2 * padding;

  // Coordinate scales: map [-5, 5] to canvas dimensions
  const scaleX = (x: number) => padding + ((x + 5) / 10) * plotWidth;
  const scaleY = (y: number) => padding + ((5 - y) / 10) * plotHeight;

  // Inverse scales: map canvas coordinates back to [-5, 5]
  const invertX = (px: number) => ((px - padding) / plotWidth) * 10 - 5;
  const invertY = (py: number) => 5 - ((py - padding) / plotHeight) * 10;

  // 1. Grid lines and ticks for a notebook sheet look
  const gridLines = useMemo(() => {
    const ticks = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
    return (
      <>
        {/* Grid background ticks */}
        {ticks.map((tick) => (
          <React.Fragment key={tick}>
            {/* Vertical grid line */}
            <line
              x1={scaleX(tick)}
              y1={padding}
              x2={scaleX(tick)}
              y2={height - padding}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            {/* Horizontal grid line */}
            <line
              x1={padding}
              y1={scaleY(tick)}
              x2={width - padding}
              y2={scaleY(tick)}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            {/* X-axis tick labels */}
            <text
              x={scaleX(tick)}
              y={height - padding + 15}
              textAnchor="middle"
              className="text-[10px] font-sans text-gray-400 select-none"
            >
              {tick}
            </text>
            {/* Y-axis tick labels */}
            <text
              x={padding - 10}
              y={scaleY(tick) + 3}
              textAnchor="end"
              className="text-[10px] font-sans text-gray-400 select-none"
            >
              {tick}
            </text>
          </React.Fragment>
        ))}
      </>
    );
  }, [plotWidth, plotHeight]);

  // 2. Decision Regions overlay (Logistic Regression, SVM, Decision Tree)
  const decisionRegions = useMemo(() => {
    if (selectedAlgorithm === 'linear-regression' || selectedAlgorithm === 'kmeans') return null;

    const cellsCount = 45; // 45x45 grid is fast and looks high res
    const cellW = plotWidth / cellsCount;
    const cellH = plotHeight / cellsCount;
    const rects = [];

    for (let gx = 0; gx < cellsCount; gx++) {
      for (let gy = 0; gy < cellsCount; gy++) {
        // Center of cell
        const px = padding + gx * cellW + cellW / 2;
        const py = padding + gy * cellH + cellH / 2;

        const x = invertX(px);
        const y = invertY(py);

        let color = 'transparent';
        let opacity = 0;

        if (selectedAlgorithm === 'logistic-regression') {
          const { w1, w2, bias } = logisticRegressionState;
          const z = w1 * x + w2 * y + bias;
          const p = sigmoid(z);
          
          if (p >= 0.5) {
            color = '#2563EB'; // Class 1 is Blue
            opacity = 0.05 + (p - 0.5) * 0.25; // fade near boundary
          } else {
            color = '#DC2626'; // Class 0 is Red
            opacity = 0.05 + (0.5 - p) * 0.25;
          }
        } else if (selectedAlgorithm === 'svm') {
          const { w1, w2, bias } = svmState;
          const score = w1 * x + w2 * y + bias;
          
          if (score >= 0) {
            color = '#2563EB';
            opacity = 0.12;
          } else {
            color = '#DC2626';
            opacity = 0.12;
          }
        } else if (selectedAlgorithm === 'decision-tree') {
          const pred = predictTree(decisionTreeState.root, { x, y });
          color = pred === 1 ? '#2563EB' : '#DC2626';
          opacity = 0.12;
        }

        rects.push(
          <rect
            key={`${gx}-${gy}`}
            x={padding + gx * cellW}
            y={padding + gy * cellH}
            width={cellW + 0.5} // slightly wider to avoid cracks
            height={cellH + 0.5}
            fill={color}
            opacity={opacity}
          />
        );
      }
    }

    return <g className="decision-regions">{rects}</g>;
  }, [selectedAlgorithm, plotWidth, plotHeight, logisticRegressionState, svmState, decisionTreeState]);

  // 3. Linear elements (Decision boundary lines, support vector margins)
  const boundaryLines = useMemo(() => {
    if (selectedAlgorithm === 'linear-regression') {
      const { slope, intercept } = linearRegressionState;
      // Draw regression line y = mx + c from x = -5 to x = 5
      const x1 = -5;
      const y1 = slope * x1 + intercept;
      const x2 = 5;
      const y2 = slope * x2 + intercept;
      return (
        <line
          x1={scaleX(x1)}
          y1={scaleY(y1)}
          x2={scaleX(x2)}
          y2={scaleY(y2)}
          stroke="#2563EB" // Blue Pen
          strokeWidth="3.5"
          strokeLinecap="round"
          className="filter drop-shadow-sm"
        />
      );
    }

    if (selectedAlgorithm === 'logistic-regression') {
      const { w1, w2, bias } = logisticRegressionState;
      // w1*x + w2*y + b = 0 -> y = (-w1*x - b) / w2
      if (Math.abs(w2) < 1e-5) {
        // Vertical boundary line x = -b / w1
        const lineX = -bias / w1;
        if (lineX >= -5 && lineX <= 5) {
          const sx = scaleX(lineX);
          return (
            <line
              x1={sx}
              y1={scaleY(-5)}
              x2={sx}
              y2={scaleY(5)}
              stroke="#2563EB" // blue boundary
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          );
        }
        return null;
      }

      const x1 = -5;
      const y1 = (-w1 * x1 - bias) / w2;
      const x2 = 5;
      const y2 = (-w1 * x2 - bias) / w2;

      return (
        <line
          x1={scaleX(x1)}
          y1={scaleY(y1)}
          x2={scaleX(x2)}
          y2={scaleY(y2)}
          stroke="#2563EB"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      );
    }

    if (selectedAlgorithm === 'svm') {
      const { w1, w2, bias } = svmState;
      if (Math.abs(w2) < 1e-5) {
        const xBoundary = -bias / w1;
        const xMarginPos = (1 - bias) / w1;
        const xMarginNeg = (-1 - bias) / w1;
        return (
          <>
            {/* Hyperplane boundary */}
            <line
              x1={scaleX(xBoundary)}
              y1={scaleY(-5)}
              x2={scaleX(xBoundary)}
              y2={scaleY(5)}
              stroke="#2563EB"
              strokeWidth="3.5"
            />
            {/* Margin lines */}
            <line
              x1={scaleX(xMarginPos)}
              y1={scaleY(-5)}
              x2={scaleX(xMarginPos)}
              y2={scaleY(5)}
              stroke="#2563EB"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.6"
            />
            <line
              x1={scaleX(xMarginNeg)}
              y1={scaleY(-5)}
              x2={scaleX(xMarginNeg)}
              y2={scaleY(5)}
              stroke="#DC2626"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.6"
            />
          </>
        );
      }

      // Calculate points for boundary line (score = 0)
      const x1 = -5;
      const y1_b = (-w1 * x1 - bias) / w2;
      const y1_pos = (-w1 * x1 - bias + 1) / w2;
      const y1_neg = (-w1 * x1 - bias - 1) / w2;

      const x2 = 5;
      const y2_b = (-w1 * x2 - bias) / w2;
      const y2_pos = (-w1 * x2 - bias + 1) / w2;
      const y2_neg = (-w1 * x2 - bias - 1) / w2;

      return (
        <>
          {/* Support vector margins */}
          <line
            x1={scaleX(x1)}
            y1={scaleY(y1_pos)}
            x2={scaleX(x2)}
            y2={scaleY(y2_pos)}
            stroke="#2563EB"
            strokeWidth="1.5"
            strokeDasharray="5 5"
            opacity="0.65"
          />
          <line
            x1={scaleX(x1)}
            y1={scaleY(y1_neg)}
            x2={scaleX(x2)}
            y2={scaleY(y2_neg)}
            stroke="#DC2626"
            strokeWidth="1.5"
            strokeDasharray="5 5"
            opacity="0.65"
          />
          {/* Main classification hyperplane */}
          <line
            x1={scaleX(x1)}
            y1={scaleY(y1_b)}
            x2={scaleX(x2)}
            y2={scaleY(y2_b)}
            stroke="#2563EB"
            strokeWidth="3.5"
          />
        </>
      );
    }

    if (selectedAlgorithm === 'decision-tree') {
      // Draw split lines recursively inside their bounding boxes
      const splits: React.ReactNode[] = [];
      const traverse = (node: typeof decisionTreeState.root) => {
        if (node.isLeaf) return;
        
        const { feature, threshold, box } = node;
        if (feature === 'x' && threshold !== undefined) {
          splits.push(
            <line
              key={node.id}
              x1={scaleX(threshold)}
              y1={scaleY(box.yMin)}
              x2={scaleX(threshold)}
              y2={scaleY(box.yMax)}
              stroke="#16A34A" // green pen split
              strokeWidth="2.5"
              strokeDasharray="4 4"
            />
          );
        } else if (feature === 'y' && threshold !== undefined) {
          splits.push(
            <line
              key={node.id}
              x1={scaleX(box.xMin)}
              y1={scaleY(threshold)}
              x2={scaleX(box.xMax)}
              y2={scaleY(threshold)}
              stroke="#16A34A"
              strokeWidth="2.5"
              strokeDasharray="4 4"
            />
          );
        }
        
        if (node.left) traverse(node.left);
        if (node.right) traverse(node.right);
      };

      traverse(decisionTreeState.root);
      return <>{splits}</>;
    }

    return null;
  }, [selectedAlgorithm, linearRegressionState, logisticRegressionState, svmState, decisionTreeState]);

  // 4. Draw residual/error ticks for Linear Regression
  const linearResiduals = useMemo(() => {
    if (selectedAlgorithm !== 'linear-regression') return null;
    return linearRegressionState.residuals.map((r, idx) => (
      <line
        key={idx}
        x1={scaleX(r.start.x)}
        y1={scaleY(r.start.y)}
        x2={scaleX(r.end.x)}
        y2={scaleY(r.end.y)}
        stroke="#DC2626" // Red Pen for errors
        strokeWidth="1.2"
        strokeDasharray="2 3"
        opacity="0.7"
      />
    ));
  }, [selectedAlgorithm, linearRegressionState]);

  // 5. Draw assignment arrows/lines for K-Means Clustering
  const kmeansAssignmentLines = useMemo(() => {
    if (selectedAlgorithm !== 'kmeans' || kmeansState.currentSubStep === 'initialized') return null;
    const { centroids, assignments } = kmeansState;
    
    // Cluster colors
    const colors = ['#2563EB', '#16A34A', '#7C3AED'];
    
    return points.map((p, idx) => {
      const cIdx = assignments[idx];
      if (cIdx === -1 || !centroids[cIdx]) return null;
      const centroid = centroids[cIdx];
      return (
        <line
          key={idx}
          x1={scaleX(p.x)}
          y1={scaleY(p.y)}
          x2={scaleX(centroid.x)}
          y2={scaleY(centroid.y)}
          stroke={colors[cIdx % colors.length]}
          strokeWidth="1"
          strokeDasharray="2 2"
          opacity="0.3"
        />
      );
    });
  }, [selectedAlgorithm, points, kmeansState]);

  return (
    <div className="flex flex-col items-center justify-center p-2 bg-white rounded-lg">
      <div className="relative w-full max-w-[450px] aspect-square notebook-grid-bg overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
        >
          {/* Graph Sheet Gridlines */}
          {gridLines}

          {/* Coordinate axes */}
          <line
            x1={padding}
            y1={scaleY(0)}
            x2={width - padding}
            y2={scaleY(0)}
            stroke="#4b5563"
            strokeWidth="1.5"
          />
          <line
            x1={scaleX(0)}
            y1={padding}
            x2={scaleX(0)}
            y2={height - padding}
            stroke="#4b5563"
            strokeWidth="1.5"
          />

          {/* Axis arrow heads */}
          <polygon points={`${width - padding},${scaleY(0) - 3} ${width - padding + 5},${scaleY(0)} ${width - padding},${scaleY(0) + 3}`} fill="#4b5563" />
          <polygon points={`${scaleX(0) - 3},${padding} ${scaleX(0)},${padding - 5} ${scaleX(0) + 3},${padding}`} fill="#4b5563" />

          {/* Render Decision Background shading */}
          {decisionRegions}

          {/* Error residual lines */}
          {linearResiduals}

          {/* Centroid linking lines in KMeans */}
          {kmeansAssignmentLines}

          {/* Render Decision boundary lines */}
          {boundaryLines}

          {/* Support Vector Highlights (Double orange Pen rings) */}
          {selectedAlgorithm === 'svm' &&
            svmState.supportVectorIndices.map((idx) => {
              const p = points[idx];
              if (!p) return null;
              return (
                <circle
                  key={`sv-${idx}`}
                  cx={scaleX(p.x)}
                  cy={scaleY(p.y)}
                  r="12"
                  fill="none"
                  stroke="#EA580C" // Orange Pen highlight
                  strokeWidth="2"
                  strokeDasharray="3 3"
                  className="animate-spin"
                  style={{ transformOrigin: `${scaleX(p.x)}px ${scaleY(p.y)}px`, animationDuration: '6s' }}
                />
              );
            })}

          {/* Render Data Points */}
          <g className="data-points">
            {points.map((p, idx) => {
              const isLabeled = 'label' in p;
              const xPos = scaleX(p.x);
              const yPos = scaleY(p.y);

              // Colors based on algorithm
              let stroke = '#4b5563';
              let fill = '#9ca3af';

              if (selectedAlgorithm === 'kmeans') {
                const cIdx = kmeansState.assignments[idx];
                const clusterColors = [
                  { fill: '#dbeafe', stroke: '#2563EB' }, // Blue
                  { fill: '#dcfce7', stroke: '#16A34A' }, // Green
                  { fill: '#f3e8ff', stroke: '#7C3AED' }  // Purple
                ];
                if (cIdx !== -1) {
                  const cc = clusterColors[cIdx % clusterColors.length];
                  stroke = cc.stroke;
                  fill = cc.fill;
                }
              } else if (isLabeled) {
                const lp = p as LabeledPoint;
                if (lp.label === 1) {
                  stroke = '#2563EB'; // Blue Pen class
                  fill = '#dbeafe';
                } else {
                  stroke = '#DC2626'; // Red Pen class
                  fill = '#fee2e2';
                }
              } else {
                // Regression points
                stroke = '#2563EB';
                fill = '#eff6ff';
              }

              return (
                <circle
                  key={idx}
                  cx={xPos}
                  cy={yPos}
                  r={selectedAlgorithm === 'linear-regression' ? 5.5 : 6}
                  stroke={stroke}
                  fill={fill}
                  strokeWidth="2"
                  className="transition-colors duration-150"
                />
              );
            })}
          </g>

          {/* Render Centroids (K-Means) */}
          {selectedAlgorithm === 'kmeans' && (
            <g className="centroids">
              {kmeansState.centroids.map((c, idx) => {
                const clusterColors = ['#2563EB', '#16A34A', '#7C3AED'];
                const color = clusterColors[idx % clusterColors.length];

                return (
                  <g key={`centroid-${idx}`}>
                    {/* Centroid Ring (Outer highlight) */}
                    <circle
                      cx={scaleX(c.x)}
                      cy={scaleY(c.y)}
                      r="10"
                      fill="none"
                      stroke={color}
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                    {/* Centroid X-marker */}
                    <path
                      d={`M ${scaleX(c.x) - 7} ${scaleY(c.y) - 7} L ${scaleX(c.x) + 7} ${scaleY(c.y) + 7} M ${scaleX(c.x) + 7} ${scaleY(c.y) - 7} L ${scaleX(c.x) - 7} ${scaleY(c.y) + 7}`}
                      stroke={color}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    {/* Centroid Label Text */}
                    <text
                      x={scaleX(c.x) + 12}
                      y={scaleY(c.y) + 4}
                      fill={color}
                      className="font-handwritten font-bold text-xs select-none"
                    >
                      C{idx + 1}
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {/* Floating handwritten grid description */}
        <div className="absolute top-2 right-4 font-handwritten text-[11px] text-gray-500 pointer-events-none select-none bg-paper-bg/95 border border-gray-200 px-1.5 py-0.5 rounded shadow-sm">
          Scale: -5 to +5
        </div>
      </div>
    </div>
  );
};
