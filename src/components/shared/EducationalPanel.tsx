import React from 'react';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';

interface AlgoContent {
  title: string;
  subtitle: string;
  intuition: string;
  howItWorks: string[];
  advantages: string[];
  limitations: string[];
  commonMistakes: string;
}

const contentMap: Record<string, AlgoContent> = {
  'linear-regression': {
    title: 'Linear Regression',
    subtitle: 'Drawing the Best Fit Line through Data Ticks',
    intuition: 'Imagine stretching a series of tiny rubber bands vertically from every data point to a rigid stick. When you let go, the stick naturally settles in the position that minimizes the stretching tension of all bands. That settling line is the "Regression Line" and represents the best fit of your data!',
    howItWorks: [
      'Equation: y = w • x + b, where w is the slope (angle) and b is the intercept (height offset).',
      'The Residual: The vertical distance between a data point and the prediction line. We square this distance to make all errors positive (MSE Loss).',
      'Gradient Descent: It slides the line down the slope of the error curve, adjusting w and b bit by bit until the average squared error is as low as possible.'
    ],
    advantages: [
      'Extremely fast to train and run.',
      'Super easy to interpret: the slope w tells you exactly how much y changes per unit of x.',
      'A great baseline algorithm for continuous values.'
    ],
    limitations: [
      'Assumes a straight-line relationship. If your data curves, linear regression fails to capture it.',
      'Highly sensitive to outliers (extremely high or low values will pull the line away from the bulk of the data).'
    ],
    commonMistakes: 'Believing correlation equals causation. A line showing that ice cream sales and sunscreen sales increase together does not mean ice cream causes sunscreen purchases!'
  },
  'logistic-regression': {
    title: 'Logistic Regression',
    subtitle: 'The S-curve Probability Classifier',
    intuition: 'Instead of predicting a continuous number (like house prices), we predict a probability between 0% and 100% (like "Is this email spam?"). We take a linear boundary line, but wrap it in an S-shaped "Sigmoid" function that squashes predictions between 0 and 1.',
    howItWorks: [
      'The Sigmoid: Takes any number and maps it to a range of (0, 1). A score of 0 on the boundary line equals 50% probability.',
      'Decision Boundary: The line where probability is exactly 50% (score = 0). Points on one side are classified as Class A, and points on the other side are Class B.',
      'Loss Function: Uses Binary Cross-Entropy. It heavily penalizes the model if it is confident and wrong (e.g. predicting 99% probability of Spam when it is not spam).'
    ],
    advantages: [
      'Outputs true probabilities, not just binary yes/no answers.',
      'Simple, fast, and performs very well on linearly separable data.',
      'Less prone to overfitting in low dimensions.'
    ],
    limitations: [
      'Cannot solve non-linear classification tasks (like the XOR cross pattern) without creating complex features manually.',
      'Assumes classes are linearly separable.'
    ],
    commonMistakes: 'Thinking Logistic Regression is for Regression tasks. Despite the name, it is a classification algorithm!'
  },
  'svm': {
    title: 'Support Vector Machine (SVM)',
    subtitle: 'The Maximum Margin Separator',
    intuition: 'Imagine building a wide street between two warring groups of dots. You want to make this street as wide as possible! The border-guard dots standing directly on the curb are the "Support Vectors". The center line of the street is your Decision Boundary.',
    howItWorks: [
      'Support Vectors: The critical data points that lie directly on the edges (margins) of the separating boundary. Only these points define where the boundary line goes; removing other points makes no difference!',
      'Maximum Margin: SVM maximizes the distance (margin) between the positive boundary and negative boundary.',
      'Hinge Loss: A loss function that is 0 if a point is on the correct side of the margin, and grows linearly if it crosses the margin boundary.'
    ],
    advantages: [
      'Extremely robust because it only cares about points close to the boundary (the support vectors), ignoring far-away outliers.',
      'Very effective in high-dimensional spaces.',
      'Can fit highly complex boundaries using the "Kernel Trick" (mapping data to a higher dimension).'
    ],
    limitations: [
      'Slow to train on massive datasets with millions of rows.',
      'Sensitive to overlapping noise: if dots are heavily blended, finding a clean margin is difficult.'
    ],
    commonMistakes: 'Ignoring feature scaling. SVM calculates geometric distances to find the margin, so if one coordinate axis has much larger scale than another, SVM will focus entirely on that axis!'
  },
  'decision-tree': {
    title: 'Decision Tree',
    subtitle: 'Recursive Spatial Partitioning',
    intuition: 'Think of playing 20 Questions. You ask a series of yes/no questions to divide your data: "Is x coordinate greater than 1.5?" If yes, go right. "Is y coordinate less than -0.5?" If yes, it is Class A; if no, it is Class B. Visually, this carves the graph into rectangular boxes!',
    howItWorks: [
      'Root and Splits: The tree starts at a single root node and evaluates which vertical or horizontal line splits the labels most cleanly.',
      'Gini Impurity: A measure of disorder. If a region has only Class A dots, its Gini impurity is 0. If it is a 50/50 mix, Gini is 0.5 (maximum disorder). The tree splits to minimize this impurity.',
      'Leaf Nodes: The final boxes. All points inside a leaf box receive the same majority-class prediction.'
    ],
    advantages: [
      'Intuitively simple: looks like a flow chart that humans can easily trace and understand.',
      'Handles non-linear patterns (like the XOR grid) easily by layering multiple splits.',
      'Requires no mathematical coordinate scaling.'
    ],
    limitations: [
      'Prone to "overfitting" if allowed to grow too deep: it will carve out tiny boxes just to capture single outlier noise points.',
      'Can be unstable: a tiny shift in data points can result in a completely different set of splits.'
    ],
    commonMistakes: 'Letting the tree grow infinitely deep. An unconstrained decision tree will split until every single data point has its own box, creating a highly erratic, useless boundary.'
  },
  'kmeans': {
    title: 'K-Means Clustering',
    subtitle: 'Finding Hidden Groups (Unsupervised)',
    intuition: 'You have a room full of people and want to split them into three groups. You place three flags (Centroids) randomly. Everyone walks to the nearest flag. Then, each flag is moved to the exact physical average position of its group. The people walk to their new nearest flag. You repeat this until no one needs to change groups!',
    howItWorks: [
      'Unsupervised Learning: K-Means does not look at labels (Class A/B). It only looks at coordinate grouping.',
      'Assign Step: Each data point calculates its distance to all centroids and joins the nearest cluster.',
      'Update Step: Each centroid slides to the average (mean) coordinate of all points in its cluster.',
      'Inertia (WCSS): The sum of squared distances from all points to their assigned centroids. K-Means stops when inertia stops decreasing.'
    ],
    advantages: [
      'Simple to understand, code, and explain.',
      'Scales very well to large datasets.',
      'Quickly discovers spherical group shapes.'
    ],
    limitations: [
      'You must specify the number of clusters (K) in advance.',
      'Extremely sensitive to initial random placements: starting in the wrong spots can lead to suboptimal groupings.',
      'Struggles with non-spherical clusters (like concentric rings or crescent shapes).'
    ],
    commonMistakes: 'Assuming K-Means is a classifier. K-Means groups unlabeled data (Clustering); it does not predict pre-labeled targets (Classification).'
  }
};

export const EducationalPanel: React.FC = () => {
  const { selectedAlgorithm } = usePlaygroundStore();
  const info = contentMap[selectedAlgorithm];

  if (!info) return null;

  return (
    <div className="notebook-card p-6 bg-white flex flex-col gap-6 select-text mt-6 border-t-4 border-t-pen-blue">
      {/* Intro Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-800 font-handwritten inline-block relative">
          <span>📝 Notebook Notes: {info.title}</span>
          <span className="absolute -left-1 -right-2 bottom-1 h-3 bg-highlighter-yellow/30 -z-10 -rotate-1" />
        </h2>
        <p className="text-gray-500 font-medium italic mt-1 font-sans text-sm">{info.subtitle}</p>
      </div>

      {/* Main Intuition Sticky Note */}
      <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-md">
        <h3 className="font-handwritten text-lg font-bold text-pen-blue mb-1">🎈 General Intuition:</h3>
        <p className="text-gray-700 leading-relaxed text-sm md:text-base">{info.intuition}</p>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        {/* How it learns */}
        <div className="space-y-3">
          <h3 className="font-handwritten text-lg font-bold text-pen-orange">⚙️ How it learns:</h3>
          <ul className="space-y-2 text-sm text-gray-700 list-disc pl-4 leading-relaxed font-sans">
            {info.howItWorks.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Advantages & Limitations */}
        <div className="space-y-4">
          <div>
            <h3 className="font-handwritten text-lg font-bold text-pen-green">👍 Advantages:</h3>
            <ul className="space-y-1 text-sm text-gray-700 list-disc pl-4 leading-relaxed font-sans">
              {info.advantages.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-handwritten text-lg font-bold text-pen-red">👎 Limitations:</h3>
            <ul className="space-y-1 text-sm text-gray-700 list-disc pl-4 leading-relaxed font-sans">
              {info.limitations.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Common Mistake Banner */}
      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-gray-800 flex items-start gap-2.5">
        <span className="text-xl">⚠️</span>
        <div>
          <span className="font-bold text-pen-red font-handwritten text-base">Common Mistake:</span>{' '}
          <span className="font-sans leading-relaxed text-gray-700">{info.commonMistakes}</span>
        </div>
      </div>
    </div>
  );
};
