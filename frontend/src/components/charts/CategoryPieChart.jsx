/**
 * CategoryPieChart Component
 * Renders a donut-style pie chart showing expense distribution by category
 * Uses Recharts library for responsive SVG-based visualizations
 * @author Harsh Chimnani
 */
import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Color palette for chart segments - designed for dark background visibility
const CHART_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#64748b', // Slate
];

// Custom tooltip styling for dark theme consistency
const TOOLTIP_STYLE = {
  backgroundColor: '#1e293b',
  border: 'none',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '13px',
};

const CategoryPieChart = ({ expenses }) => {
  // Aggregate expense amounts by category using memoization
  const chartData = useMemo(() => {
    const categoryMap = expenses.reduce((acc, expense) => {
      const { category, amount } = expense;
      acc[category] = (acc[category] || 0) + amount;
      return acc;
    }, {});

    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    }));
  }, [expenses]);

  // Display empty state when no data is available
  if (chartData.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        No data available
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <h3 className="text-center text-sm font-medium text-slate-300 mb-2">
        Category Distribution
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`pie-cell-${entry.name}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `$${value.toFixed(2)}`}
            contentStyle={TOOLTIP_STYLE}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryPieChart;
