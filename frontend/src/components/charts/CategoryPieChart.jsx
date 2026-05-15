import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import ChartFrame from './ChartFrame';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

const TOOLTIP_STYLE = {
  backgroundColor: '#1e293b',
  border: 'none',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '13px',
};

const CategoryPieChart = ({ expenses }) => {
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

  return (
    <ChartFrame title="Category Distribution" empty={chartData.length === 0}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          animationDuration={800}
        >
          {chartData.map((entry, index) => (
            <Cell key={`pie-cell-${entry.name}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} contentStyle={TOOLTIP_STYLE} />
        <Legend />
      </PieChart>
    </ChartFrame>
  );
};

export default CategoryPieChart;
