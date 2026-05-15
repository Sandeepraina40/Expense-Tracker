import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import ChartFrame from './ChartFrame';

const TOOLTIP_STYLE = {
  backgroundColor: '#1e293b',
  border: 'none',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '13px',
};

const GRID_STROKE = '#334155';
const AXIS_STROKE = '#94a3b8';

const MonthlyBarChart = ({ expenses }) => {
  const chartData = useMemo(() => {
    const monthlyMap = expenses.reduce((acc, expense) => {
      const date = new Date(expense.date);
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      acc[monthYear] = (acc[monthYear] || 0) + expense.amount;
      return acc;
    }, {});

    return Object.entries(monthlyMap)
      .map(([name, amount]) => ({ name, amount: parseFloat(amount.toFixed(2)) }))
      .reverse();
  }, [expenses]);

  return (
    <ChartFrame title="Monthly Expenses" empty={chartData.length === 0}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="name" stroke={AXIS_STROKE} fontSize={12} tickLine={false} />
        <YAxis
          stroke={AXIS_STROKE}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(val) => `$${val}`}
        />
        <Tooltip
          formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']}
          cursor={{ fill: GRID_STROKE, opacity: 0.4 }}
          contentStyle={TOOLTIP_STYLE}
        />
        <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} animationDuration={800} />
      </BarChart>
    </ChartFrame>
  );
};

export default MonthlyBarChart;
