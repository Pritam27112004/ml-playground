import React, { useMemo } from 'react';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';

export const LossGraph: React.FC = () => {
  const { selectedAlgorithm, lossHistory, inertiaHistory, maxEpochs } = usePlaygroundStore();

  // If K-Means, we visualize Inertia instead of Loss, but it serves the same training minimization concept.
  const isKMeans = selectedAlgorithm === 'kmeans';
  const history = isKMeans ? inertiaHistory : lossHistory;
  const metricName = isKMeans ? 'Inertia (Within-cluster sum of squares)' : 'Training Loss (Cost Function)';
  const penColor = isKMeans ? '#7C3AED' : '#DC2626'; // Purple for inertia, red for loss

  const width = 450;
  const height = 180;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 25;
  const paddingBottom = 25;

  const graphWidth = width - paddingLeft - paddingRight;
  const graphHeight = height - paddingTop - paddingBottom;

  // Auto-scale Y values
  const { minVal, maxVal } = useMemo(() => {
    if (history.length === 0) return { minVal: 0, maxVal: 1.0 };
    const max = Math.max(...history);
    const min = Math.min(...history);
    // Add 10% breathing room at the top
    const range = max - min;
    const maxVal = max + (range > 0 ? range * 0.1 : max * 0.1 || 0.1);
    const minVal = Math.max(0, min - (range > 0 ? range * 0.05 : 0));
    return { minVal, maxVal };
  }, [history]);

  // Map values to graph coordinates
  const getX = (idx: number) => {
    if (maxEpochs <= 1) return paddingLeft;
    return paddingLeft + (idx / (maxEpochs - 1)) * graphWidth;
  };

  const getY = (val: number) => {
    const range = maxVal - minVal;
    if (range === 0) return paddingTop + graphHeight / 2;
    return paddingTop + graphHeight - ((val - minVal) / range) * graphHeight;
  };

  const pathD = useMemo(() => {
    if (history.length === 0) return '';
    return history
      .map((val, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx).toFixed(1)} ${getY(val).toFixed(1)}`)
      .join(' ');
  }, [history, minVal, maxVal, maxEpochs]);

  // Horizontal guide grid lines
  const horizontalGrid = useMemo(() => {
    const lines = [];
    const step = (maxVal - minVal) / 4;
    for (let i = 0; i <= 4; i++) {
      const v = minVal + i * step;
      const yPos = getY(v);
      lines.push(
        <React.Fragment key={i}>
          {/* Guide lines */}
          <line
            x1={paddingLeft}
            y1={yPos}
            x2={width - paddingRight}
            y2={yPos}
            stroke="#f3f4f6"
            strokeWidth="1.5"
          />
          {/* Y ticks text */}
          <text
            x={paddingLeft - 8}
            y={yPos + 4}
            textAnchor="end"
            className="text-[10px] font-sans text-gray-400 select-none"
          >
            {v.toFixed(2)}
          </text>
        </React.Fragment>
      );
    }
    return lines;
  }, [minVal, maxVal]);

  return (
    <div className="notebook-card p-4 bg-white select-none">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-handwritten text-lg font-bold text-gray-800 flex items-center gap-1.5">
          <span className="relative inline-block">
            <span>{metricName}</span>
            <span className="absolute left-0 right-0 bottom-0.5 h-1.5 bg-highlighter-yellow/40 -z-10" />
          </span>
        </h3>
        <div className="text-[11px] text-gray-400 font-sans">
          Epoch: {history.length} / {maxEpochs}
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        {history.length === 0 ? (
          <div className="h-[180px] w-full flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-md">
            <p className="font-handwritten text-gray-400 text-sm">
              Press "Play" to start tracing the training curve
            </p>
          </div>
        ) : (
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
            {/* Horizontal Grid */}
            {horizontalGrid}

            {/* Axes */}
            {/* Y axis */}
            <line
              x1={paddingLeft}
              y1={paddingTop - 5}
              x2={paddingLeft}
              y2={height - paddingBottom}
              stroke="#9ca3af"
              strokeWidth="1.5"
            />
            {/* X axis */}
            <line
              x1={paddingLeft}
              y1={height - paddingBottom}
              x2={width - paddingRight + 5}
              y2={height - paddingBottom}
              stroke="#9ca3af"
              strokeWidth="1.5"
            />

            {/* X-axis tick marks / label */}
            <text
              x={width - paddingRight}
              y={height - paddingBottom + 16}
              textAnchor="end"
              className="text-[9px] font-sans text-gray-400 font-medium"
            >
              Epochs ➔
            </text>

            {/* Loss Trace Path */}
            <path
              d={pathD}
              fill="none"
              stroke={penColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="filter drop-shadow-sm"
            />

            {/* Current endpoint pulse dot */}
            {history.length > 0 && (
              <circle
                cx={getX(history.length - 1)}
                cy={getY(history[history.length - 1])}
                r="4"
                fill={penColor}
                stroke="white"
                strokeWidth="1"
              />
            )}
          </svg>
        )}
      </div>
    </div>
  );
};
